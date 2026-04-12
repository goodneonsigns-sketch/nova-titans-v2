#!/usr/bin/env python3
"""
Migrate all game photos from Dropbox to Supabase Storage.
Downloads from Dropbox temp links and uploads to Supabase Storage bucket.
Updates the photos table URL to point to Supabase Storage.
"""
import json
import os
import sys
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SUPABASE_URL = "https://hxrucwregtzirnesvhrj.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# Dropbox credentials
DROPBOX_APP_KEY = "kxu7o7wdx0uevph"
DROPBOX_APP_SECRET = "6w18phfie9ezqu9"
DROPBOX_REFRESH_TOKEN = "DhoQFza7ABkAAAAAAAAAAeen66ezZWe7xggwMReo9UVYSAipgz8V7qdCEB41ntvS"

BUCKET = "game-photos"
WORKERS = 3  # concurrent uploads
PROGRESS_FILE = "migration-progress.json"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}

def refresh_dropbox_token():
    resp = requests.post(
        "https://api.dropboxapi.com/oauth2/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": DROPBOX_REFRESH_TOKEN,
            "client_id": DROPBOX_APP_KEY,
            "client_secret": DROPBOX_APP_SECRET,
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

def get_temp_link(token, path):
    """Get a temporary download link for a Dropbox file."""
    for attempt in range(3):
        try:
            resp = requests.post(
                "https://api.dropboxapi.com/2/files/get_temporary_link",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"path": path},
                timeout=30,
            )
            if resp.status_code == 200:
                return resp.json()["link"]
            elif resp.status_code == 429:
                wait = int(resp.headers.get("Retry-After", 30))
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"    Temp link error {resp.status_code}: {resp.text[:100]}")
                time.sleep(2)
        except Exception as e:
            print(f"    Temp link exception: {e}")
            time.sleep(2)
    return None

def download_from_dropbox(url):
    """Download a file from Dropbox temp link."""
    for attempt in range(3):
        try:
            resp = requests.get(url, timeout=60)
            if resp.status_code == 200:
                return resp.content
            time.sleep(2)
        except Exception as e:
            print(f"    Download error: {e}")
            time.sleep(2)
    return None

def upload_to_supabase(storage_path, data, content_type="image/jpeg"):
    """Upload file data to Supabase Storage."""
    for attempt in range(3):
        try:
            resp = requests.post(
                f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}",
                headers={
                    **headers,
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
                data=data,
                timeout=60,
            )
            if resp.status_code in (200, 201):
                return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"
            else:
                print(f"    Upload error {resp.status_code}: {resp.text[:100]}")
                time.sleep(2)
        except Exception as e:
            print(f"    Upload exception: {e}")
            time.sleep(2)
    return None

def update_photo_url(photo_id, new_url, storage_path):
    """Update the photo record in Supabase."""
    resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/photos?id=eq.{photo_id}",
        headers={**headers, "Content-Type": "application/json", "Prefer": "return=minimal"},
        json={"url": new_url, "storage_path": storage_path},
    )
    return resp.status_code in (200, 204)

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return set(json.load(f))
    return set()

def save_progress(done_ids):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(list(done_ids), f)

def process_photo(photo, dropbox_token):
    """Download from Dropbox, upload to Supabase Storage, update DB."""
    photo_id = photo["id"]
    game_id = photo["game_id"]
    dropbox_path = photo["dropbox_path"]
    filename = photo["filename"]
    
    # Determine storage path: game-{game_id}/{filename}
    safe_filename = filename.replace(" ", "_").replace(",", "").replace("(", "").replace(")", "")
    storage_path = f"game-{game_id}/{safe_filename}"
    
    # Get temp link from Dropbox
    temp_link = get_temp_link(dropbox_token, dropbox_path)
    if not temp_link:
        return photo_id, False, "Failed to get Dropbox temp link"
    
    # Download
    data = download_from_dropbox(temp_link)
    if not data:
        return photo_id, False, "Failed to download from Dropbox"
    
    # Determine content type
    ext = filename.lower().split(".")[-1]
    ct = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png" if ext == "png" else "image/jpeg"
    
    # Upload to Supabase Storage
    public_url = upload_to_supabase(storage_path, data, ct)
    if not public_url:
        return photo_id, False, "Failed to upload to Supabase Storage"
    
    # Update DB
    if update_photo_url(photo_id, public_url, storage_path):
        return photo_id, True, None
    else:
        return photo_id, False, "Failed to update DB"

def main():
    if not SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_KEY environment variable")
        sys.exit(1)
    
    # Create storage bucket
    print("📦 Creating storage bucket...")
    resp = requests.post(
        f"{SUPABASE_URL}/storage/v1/bucket",
        headers={**headers, "Content-Type": "application/json"},
        json={"id": BUCKET, "name": BUCKET, "public": True, "file_size_limit": 10485760},
    )
    if resp.status_code in (200, 201):
        print("  ✅ Bucket created")
    elif "already exists" in resp.text.lower() or resp.status_code == 409:
        print("  ✅ Bucket already exists")
    else:
        print(f"  ⚠️ Bucket response: {resp.status_code} {resp.text[:100]}")
    
    # Get all photos from DB
    print("📷 Fetching photo records...")
    all_photos = []
    offset = 0
    while True:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/photos?select=id,game_id,dropbox_path,filename&order=id&limit=1000&offset={offset}",
            headers=headers,
        )
        batch = resp.json()
        if not batch:
            break
        all_photos.extend(batch)
        offset += len(batch)
        if len(batch) < 1000:
            break
    
    print(f"  Total photos: {len(all_photos)}")
    
    # Load progress (resume support)
    done_ids = load_progress()
    remaining = [p for p in all_photos if p["id"] not in done_ids]
    print(f"  Already migrated: {len(done_ids)}")
    print(f"  Remaining: {len(remaining)}")
    
    if not remaining:
        print("\n✅ All photos already migrated!")
        return
    
    # Refresh Dropbox token
    print("\n🔑 Refreshing Dropbox token...")
    dropbox_token = refresh_dropbox_token()
    print("  ✅ Token ready")
    
    # Process photos
    print(f"\n🚀 Migrating {len(remaining)} photos ({WORKERS} workers)...\n")
    
    success = 0
    failed = 0
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {
            executor.submit(process_photo, photo, dropbox_token): photo
            for photo in remaining
        }
        
        for future in as_completed(futures):
            photo_id, ok, error = future.result()
            if ok:
                success += 1
                done_ids.add(photo_id)
            else:
                failed += 1
                print(f"  ❌ Photo {photo_id}: {error}")
            
            total_done = success + failed
            if total_done % 50 == 0:
                elapsed = time.time() - start_time
                rate = total_done / elapsed if elapsed > 0 else 0
                eta = (len(remaining) - total_done) / rate if rate > 0 else 0
                print(f"  📊 Progress: {total_done}/{len(remaining)} ({success} ✅, {failed} ❌) — {rate:.1f}/s, ETA {eta/60:.0f}m")
                save_progress(done_ids)
    
    save_progress(done_ids)
    elapsed = time.time() - start_time
    
    print(f"\n{'='*60}")
    print(f"✅ Migration complete in {elapsed/60:.1f} minutes")
    print(f"   Success: {success}")
    print(f"   Failed: {failed}")
    print(f"   Total in Supabase Storage: {len(done_ids)}")

if __name__ == "__main__":
    main()
