#!/usr/bin/env python3
"""Update photo URLs in Supabase from dropbox-links.json"""
import json
import os
import requests

SUPABASE_URL = "https://hxrucwregtzirnesvhrj.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
OLD_PROJECT = "/Users/company-brain/.openclaw/workspace/projects/nova-titans-gallery"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Load fresh dropbox links — format: {folder: {dropbox_path: url}}
with open(f"{OLD_PROJECT}/dropbox-links.json") as f:
    dropbox_links = json.load(f)

# Build flat lookup: dropbox_path -> url
path_to_url = {}
for folder, links_dict in dropbox_links.items():
    for path, url in links_dict.items():
        path_to_url[path.lower()] = url

print(f"Loaded {len(path_to_url)} Dropbox URLs across {len(dropbox_links)} folders")

# Get ALL photos from Supabase (paginate since limit is 1000)
all_photos = []
offset = 0
while True:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/photos?select=id,dropbox_path&order=id&limit=1000&offset={offset}",
        headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}
    )
    batch = resp.json()
    if not batch:
        break
    all_photos.extend(batch)
    offset += len(batch)
    if len(batch) < 1000:
        break

print(f"Total photos in DB: {len(all_photos)}")

# Match and update
updated = 0
failed = 0

for photo in all_photos:
    dropbox_path = (photo.get("dropbox_path") or "").lower()
    url = path_to_url.get(dropbox_path)
    
    if url:
        resp = requests.patch(
            f"{SUPABASE_URL}/rest/v1/photos?id=eq.{photo['id']}",
            headers=headers,
            json={"url": url}
        )
        if resp.status_code in (200, 204):
            updated += 1
        else:
            print(f"  Error on photo {photo['id']}: {resp.status_code}")
            failed += 1
    else:
        failed += 1
    
    if (updated + failed) % 200 == 0:
        print(f"  Progress: {updated + failed}/{len(all_photos)} ({updated} matched, {failed} unmatched)")

print(f"\n✅ Done! {updated} photos updated, {failed} unmatched")
