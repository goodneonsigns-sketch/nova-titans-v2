#!/usr/bin/env python3
"""Upload player headshots to Supabase Storage and update player records"""
import os
import json
import requests

SUPABASE_URL = "https://hxrucwregtzirnesvhrj.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
HEADSHOTS_DIR = "/Users/company-brain/.openclaw/workspace/projects/nova-titans-gallery/player-picks"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}

# Get all players
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/players?select=id,name,number",
    headers=headers
)
players = resp.json()
print(f"Players: {len(players)}")

# Map player names to slugs (matching the file naming convention)
def name_to_slug(name):
    return name.lower().replace(" ", "-").replace("'", "")

uploaded = 0
for player in players:
    slug = name_to_slug(player["name"])
    filepath = os.path.join(HEADSHOTS_DIR, f"{slug}.png")
    
    if not os.path.exists(filepath):
        print(f"  ⚠️  No headshot for {player['name']} ({slug}.png)")
        continue
    
    # Upload to Supabase Storage
    with open(filepath, "rb") as f:
        file_data = f.read()
    
    storage_path = f"{slug}.png"
    upload_resp = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/headshots/{storage_path}",
        headers={
            **headers,
            "Content-Type": "image/png",
            "x-upsert": "true"
        },
        data=file_data
    )
    
    if upload_resp.status_code in (200, 201):
        # Get public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/headshots/{storage_path}"
        
        # Update player record
        update_resp = requests.patch(
            f"{SUPABASE_URL}/rest/v1/players?id=eq.{player['id']}",
            headers={**headers, "Content-Type": "application/json", "Prefer": "return=minimal"},
            json={"headshot_url": public_url}
        )
        
        if update_resp.status_code in (200, 204):
            uploaded += 1
            print(f"  ✅ #{player['number']} {player['name']}")
        else:
            print(f"  ❌ DB update failed for {player['name']}: {update_resp.status_code}")
    else:
        print(f"  ❌ Upload failed for {player['name']}: {upload_resp.status_code} {upload_resp.text[:100]}")

print(f"\n✅ Done! {uploaded} headshots uploaded to Supabase Storage")
