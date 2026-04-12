#!/usr/bin/env python3
"""
Tag players in game photos using GPT-4o vision.
Sends batches of photos to detect jersey numbers, then updates Supabase.
"""
import json
import os
import sys
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SUPABASE_URL = "https://hxrucwregtzirnesvhrj.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

BATCH_SIZE = 8  # photos per GPT-4o request
PROGRESS_FILE = "tagging-progress.json"
MAX_WORKERS = 2  # parallel GPT-4o requests

# Roster mapping: number -> player_id (will be loaded from DB)
number_to_player = {}

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

SYSTEM_PROMPT = """You identify jersey numbers on Nova Titans baseball players (green/gold/white uniforms, "Titans" script).
Numbers are on the BACK of jerseys. IGNORE opposing teams. Be aggressive — report probable numbers too.

Roster: {roster}

Respond ONLY with JSON array (no markdown):
[{{"photo": 0, "numbers": [{{"num": 19, "conf": 0.9, "act": "batting"}}]}}, {{"photo": 1, "numbers": []}}]
"""

def load_roster():
    """Load player roster from Supabase."""
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/players?select=id,number,name&order=number",
        headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"},
    )
    players = resp.json()
    roster_text = ""
    for p in players:
        number_to_player[p["number"]] = p["id"]
        roster_text += f"#{p['number']} {p['name']}\n"
    return roster_text, players

def analyze_batch(photos, roster_text):
    """Send a batch of photos to GPT-4o for jersey number detection."""
    content = [{"type": "text", "text": f"Identify visible jersey numbers on Nova Titans players in these {len(photos)} photos (indexed 0-{len(photos)-1}). Respond as JSON array."}]
    
    for i, photo in enumerate(photos):
        content.append({
            "type": "image_url",
            "image_url": {"url": photo["url"], "detail": "low"},
        })
    
    for attempt in range(3):
        try:
            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT.format(roster=roster_text)},
                        {"role": "user", "content": content},
                    ],
                    "max_tokens": 1500,
                    "temperature": 0.1,
                },
                timeout=60,
            )
            
            if resp.status_code == 429:
                wait = int(resp.headers.get("Retry-After", 30))
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            
            if resp.status_code != 200:
                print(f"    API error {resp.status_code}: {resp.text[:200]}")
                time.sleep(5)
                continue
            
            result = resp.json()
            text = result["choices"][0]["message"]["content"]
            
            # Parse JSON from response (strip markdown if present)
            text = text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1] if "\n" in text else text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
            
            return json.loads(text)
        except json.JSONDecodeError as e:
            print(f"    JSON parse error: {e}")
            print(f"    Raw response: {text[:200]}")
            time.sleep(2)
        except Exception as e:
            print(f"    Exception: {e}")
            time.sleep(5)
    
    return None

def update_photo_tags(photo_id, detections):
    """Update photo record with player tags."""
    player_ids = []
    tags = []
    
    for det in detections:
        number = det.get("number")
        confidence = det.get("confidence", 0.5)
        action = det.get("action", "unknown")
        
        player_id = number_to_player.get(number)
        if player_id and confidence >= 0.6:  # Only tag if reasonably confident
            player_ids.append(player_id)
            tags.append({
                "number": number,
                "player_id": player_id,
                "confidence": confidence,
                "action": action,
            })
    
    if not player_ids:
        return 0
    
    resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/photos?id=eq.{photo_id}",
        headers=headers,
        json={"player_ids": player_ids, "player_tags": tags},
    )
    return len(player_ids) if resp.status_code in (200, 204) else 0

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return set(json.load(f))
    return set()

def save_progress(done_ids):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(list(done_ids), f)

def main():
    if not SERVICE_KEY or not OPENAI_KEY:
        print("ERROR: Set SUPABASE_SERVICE_KEY and OPENAI_API_KEY")
        sys.exit(1)
    
    print("🏷️  Nova Titans — AI Player Tagging")
    print("=" * 60)
    
    # Load roster
    roster_text, players = load_roster()
    print(f"📋 Loaded {len(players)} players")
    
    # Get all photos with Supabase Storage URLs
    print("📷 Fetching photos...")
    all_photos = []
    offset = 0
    while True:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/photos?select=id,game_id,filename,url&url=like.*supabase*&order=id&limit=1000&offset={offset}",
            headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"},
        )
        batch = resp.json()
        if not batch:
            break
        all_photos.extend(batch)
        offset += len(batch)
        if len(batch) < 1000:
            break
    
    print(f"   Total photos: {len(all_photos)}")
    
    # Load progress
    done_ids = load_progress()
    remaining = [p for p in all_photos if p["id"] not in done_ids]
    print(f"   Already processed: {len(done_ids)}")
    print(f"   Remaining: {len(remaining)}")
    
    if not remaining:
        print("\n✅ All photos already tagged!")
        return
    
    # Process in batches
    total_tagged = 0
    total_processed = 0
    start_time = time.time()
    
    for i in range(0, len(remaining), BATCH_SIZE):
        batch = remaining[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (len(remaining) + BATCH_SIZE - 1) // BATCH_SIZE
        
        result = analyze_batch(batch, roster_text)
        
        if result:
            batch_tags = 0
            for item in result:
                # Handle both formats: {"photo": 0, "numbers": [...]} or {"photo_index": 0, "detections": [...]}
                idx = item.get("photo", item.get("photo_index", 0))
                raw_numbers = item.get("numbers", item.get("detections", []))
                
                # Normalize to standard format
                detections = []
                for n in raw_numbers:
                    detections.append({
                        "number": n.get("num", n.get("number", 0)),
                        "confidence": n.get("conf", n.get("confidence", 0.5)),
                        "action": n.get("act", n.get("action", "unknown")),
                    })
                
                if idx < len(batch) and detections:
                    tagged = update_photo_tags(batch[idx]["id"], detections)
                    batch_tags += tagged
                
                if idx < len(batch):
                    done_ids.add(batch[idx]["id"])
            
            # Mark undetected photos as done too
            for photo in batch:
                done_ids.add(photo["id"])
            
            total_tagged += batch_tags
            total_processed += len(batch)
            
            elapsed = time.time() - start_time
            rate = total_processed / elapsed if elapsed > 0 else 0
            eta = (len(remaining) - total_processed) / rate if rate > 0 else 0
            
            if batch_num % 5 == 0 or batch_tags > 0:
                print(f"  📊 Batch {batch_num}/{total_batches}: {batch_tags} players tagged | Total: {total_tagged} tags in {total_processed} photos | {rate:.1f} photos/s | ETA {eta/60:.0f}m")
            
            save_progress(done_ids)
        else:
            print(f"  ⚠️ Batch {batch_num} failed — skipping")
            for photo in batch:
                done_ids.add(photo["id"])
            save_progress(done_ids)
        
        # Small delay to avoid rate limits
        time.sleep(0.5)
    
    elapsed = time.time() - start_time
    save_progress(done_ids)
    
    print(f"\n{'='*60}")
    print(f"✅ Tagging complete in {elapsed/60:.1f} minutes")
    print(f"   Photos processed: {total_processed}")
    print(f"   Players tagged: {total_tagged}")
    print(f"   Tag rate: {total_tagged/total_processed*100:.1f}% of photos had identifiable players")

if __name__ == "__main__":
    main()
