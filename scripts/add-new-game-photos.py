#!/usr/bin/env python3
"""
Add new game photos from Dropbox to Supabase Storage + Database.
Downloads from Dropbox, uploads to Supabase Storage, creates game + photo records.
Usage: python3 scripts/add-new-game-photos.py
"""
import json
import os
import sys
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SUPABASE_URL = "https://hxrucwregtzirnesvhrj.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

DROPBOX_APP_KEY = "kxu7o7wdx0uevph"
DROPBOX_APP_SECRET = "6w18phfie9ezqu9"
DROPBOX_REFRESH_TOKEN = "DhoQFza7ABkAAAAAAAAAAeen66ezZWe7xggwMReo9UVYSAipgz8V7qdCEB41ntvS"

BUCKET = "game-photos"
WORKERS = 3

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}

# NEW folders to import — game_id is pre-existing in DB
NEW_FOLDERS = [
    {
        "folder": "4-15-26",
        "game_id": 19,  # 4/15 Division Semifinal vs St. Thomas Aquinas
    },
]


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


def list_dropbox_folder(token, folder_name):
    """List all files in a Dropbox folder."""
    path = f"/Nova Baseball/Nova Titans/{folder_name}"
    all_files = []
    body = {"path": path, "limit": 2000}
    resp = requests.post(
        "https://api.dropboxapi.com/2/files/list_folder",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=body,
        timeout=30,
    )
    data = resp.json()
    all_files.extend([e for e in data.get("entries", []) if e[".tag"] == "file"])
    while data.get("has_more"):
        resp = requests.post(
            "https://api.dropboxapi.com/2/files/list_folder/continue",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"cursor": data["cursor"]},
            timeout=30,
        )
        data = resp.json()
        all_files.extend([e for e in data.get("entries", []) if e[".tag"] == "file"])
    return sorted(all_files, key=lambda e: e["name"])


def download_from_dropbox(token, dropbox_path):
    """Download a file from Dropbox, return bytes."""
    for attempt in range(3):
        try:
            resp = requests.post(
                "https://content.dropboxapi.com/2/files/download",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Dropbox-API-Arg": json.dumps({"path": dropbox_path}),
                },
                timeout=120,
            )
            if resp.status_code == 200:
                return resp.content
            print(f"  Download failed ({resp.status_code}): {dropbox_path}")
        except Exception as e:
            print(f"  Download error (attempt {attempt+1}): {e}")
        time.sleep(2)
    return None


def upload_to_supabase(storage_path, data_bytes, content_type="image/jpeg"):
    """Upload file to Supabase Storage."""
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}"
    for attempt in range(3):
        try:
            resp = requests.post(
                url,
                headers={
                    **headers,
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
                data=data_bytes,
                timeout=120,
            )
            if resp.status_code in (200, 201):
                return True
            print(f"  Upload failed ({resp.status_code}): {storage_path}")
        except Exception as e:
            print(f"  Upload error (attempt {attempt+1}): {e}")
        time.sleep(2)
    return False


def get_public_url(storage_path):
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"


def create_game(game_info):
    """Create a game record in the database. Returns the game ID."""
    # First check if game already exists for this date
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/games?date=eq.{game_info['date']}&select=id",
        headers={**headers, "Content-Type": "application/json"},
        timeout=30,
    )
    existing = resp.json()
    if existing and len(existing) > 0:
        print(f"  Game already exists for {game_info['date']} (ID: {existing[0]['id']})")
        return existing[0]["id"]

    # Get current season
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/seasons?is_current=eq.true&select=id",
        headers={**headers, "Content-Type": "application/json"},
        timeout=30,
    )
    seasons = resp.json()
    season_id = seasons[0]["id"] if seasons else None

    game = {
        "season_id": season_id,
        "date": game_info["date"],
        "opponent": game_info["opponent"],
        "home_away": game_info["home_away"],
        "is_jv": game_info.get("is_jv", False),
    }

    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/games",
        headers={**headers, "Content-Type": "application/json", "Prefer": "return=representation"},
        json=game,
        timeout=30,
    )
    if resp.status_code in (200, 201):
        created = resp.json()
        game_id = created[0]["id"] if isinstance(created, list) else created["id"]
        print(f"  ✅ Created game: {game_info['date']} vs {game_info['opponent']} (ID: {game_id})")
        return game_id
    else:
        print(f"  ❌ Failed to create game: {resp.status_code} {resp.text}")
        return None


def add_photo_record(game_id, filename, storage_path, url, sort_order):
    """Insert a photo record into the database."""
    photo = {
        "game_id": game_id,
        "filename": filename,
        "storage_path": storage_path,
        "url": url,
        "sort_order": sort_order,
    }
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/photos",
        headers={**headers, "Content-Type": "application/json", "Prefer": "return=minimal"},
        json=photo,
        timeout=30,
    )
    return resp.status_code in (200, 201)


def process_photo(args):
    """Download from Dropbox and upload to Supabase Storage."""
    db_token, game_id, file_entry, folder_name, sort_order = args
    filename = file_entry["name"]
    dropbox_path = file_entry["path_display"]
    storage_path = f"game-{game_id}/{filename}"

    # Download
    data = download_from_dropbox(db_token, dropbox_path)
    if not data:
        return {"filename": filename, "success": False, "error": "download failed"}

    # Upload to storage
    ok = upload_to_supabase(storage_path, data)
    if not ok:
        return {"filename": filename, "success": False, "error": "upload failed"}

    # Get public URL
    url = get_public_url(storage_path)

    # Add to database
    ok = add_photo_record(game_id, filename, storage_path, url, sort_order)
    if not ok:
        return {"filename": filename, "success": False, "error": "db insert failed"}

    return {"filename": filename, "success": True}


def main():
    if not SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_KEY env var")
        sys.exit(1)

    print("Refreshing Dropbox token...")
    db_token = refresh_dropbox_token()
    print("✅ Dropbox token refreshed\n")

    total_uploaded = 0
    total_failed = 0

    for game_info in NEW_FOLDERS:
        folder = game_info["folder"]
        print(f"\n{'='*60}")
        print(f"Processing folder: {folder} (game_id={game_info.get('game_id', 'new')})")
        print(f"{'='*60}")

        # List files in Dropbox
        files = list_dropbox_folder(db_token, folder)
        jpg_files = [f for f in files if f["name"].lower().endswith((".jpg", ".jpeg"))]
        print(f"Found {len(jpg_files)} photos")

        if not jpg_files:
            continue

        # Use pre-existing game ID or create new
        game_id = game_info.get("game_id")
        if not game_id:
            game_id = create_game(game_info)
            if not game_id:
                print(f"  ❌ Skipping folder — couldn't create game")
                continue

        # Process photos in parallel
        tasks = []
        for i, file_entry in enumerate(jpg_files):
            tasks.append((db_token, game_id, file_entry, folder, i + 1))

        success = 0
        failed = 0
        with ThreadPoolExecutor(max_workers=WORKERS) as executor:
            futures = {executor.submit(process_photo, t): t for t in tasks}
            for future in as_completed(futures):
                result = future.result()
                if result["success"]:
                    success += 1
                else:
                    failed += 1
                    print(f"  ❌ {result['filename']}: {result['error']}")
                if (success + failed) % 25 == 0:
                    print(f"  Progress: {success + failed}/{len(jpg_files)} ({success} ok, {failed} failed)")

        print(f"\n  ✅ {folder}: {success} uploaded, {failed} failed")
        total_uploaded += success
        total_failed += failed

    print(f"\n{'='*60}")
    print(f"DONE: {total_uploaded} photos uploaded, {total_failed} failed")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
