#!/usr/bin/env python3
"""
Nova Titans Baseball - Supabase Data Migration Script
Reads data.json and game-photos.json from the original nova-titans-gallery project
and inserts all data into Supabase tables via REST API.

Usage:
    python3 scripts/migrate-data.py

Requirements:
    pip install requests

IMPORTANT: Run supabase/schema.sql in the Supabase SQL Editor BEFORE running this script.
"""

import json
import os
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ requests not installed. Run: pip install requests")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hxrucwregtzirnesvhrj.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_SERVICE_KEY:
    print("❌ SUPABASE_SERVICE_KEY environment variable is not set.")
    print("   Run: export SUPABASE_SERVICE_KEY='your_service_role_key_here'")
    sys.exit(1)

BASE_DIR = Path(__file__).parent.parent
SOURCE_DIR = BASE_DIR.parent / "nova-titans-gallery"
DATA_FILE = SOURCE_DIR / "data.json"
PHOTOS_FILE = SOURCE_DIR / "game-photos.json"

HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def post(table, data, upsert=False):
    """Insert one or more rows into a Supabase table."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = dict(HEADERS)
    if upsert:
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
    rows = data if isinstance(data, list) else [data]
    r = requests.post(url, json=rows, headers=headers)
    if r.status_code not in (200, 201):
        raise Exception(f"POST {table} failed {r.status_code}: {r.text[:300]}")
    return r.json() if r.text else []

def delete_all(table):
    """Delete all rows from a table (for re-running migrations)."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=gte.0"
    r = requests.delete(url, headers=HEADERS)
    if r.status_code not in (200, 204):
        print(f"  ⚠️  Could not clear {table}: {r.status_code}")

def normalize_date(date_str):
    """Convert 2/12/26 or 3/03/26 to 2026-02-12 (ISO format)."""
    if not date_str:
        return None
    parts = date_str.strip().split("/")
    if len(parts) != 3:
        return date_str
    m, d, y = parts
    year = int(y)
    if year < 100:
        year += 2000
    return f"{year:04d}-{int(m):02d}-{int(d):02d}"

def derive_dropbox_folder(date_str):
    """Convert 2/12/26 → '2-12' (matches game-photos.json keys)."""
    if not date_str:
        return None
    parts = date_str.strip().split("/")
    if len(parts) == 3:
        m, d, y = parts
        return f"{int(m)}-{int(d)}"
    return None

# ── Main Migration ────────────────────────────────────────────────────────────

def main():
    print("🏟️  Nova Titans Baseball - Data Migration")
    print("=" * 50)

    # Load source data
    if not DATA_FILE.exists():
        print(f"❌ Cannot find data.json at: {DATA_FILE}")
        sys.exit(1)
    if not PHOTOS_FILE.exists():
        print(f"❌ Cannot find game-photos.json at: {PHOTOS_FILE}")
        sys.exit(1)

    with open(DATA_FILE) as f:
        data = json.load(f)
    with open(PHOTOS_FILE) as f:
        game_photos = json.load(f)

    print(f"✅ Loaded {len(data['roster'])} players, {len(data['schedule'])} games, {len(game_photos)} photo sets")

    # ── 1. Clear existing data (idempotent re-runs) ────────────────────────
    print("\n🗑️  Clearing existing data...")
    for table in ["photos", "batting_stats", "pitching_stats", "games", "players", "seasons", "team_info"]:
        delete_all(table)
        print(f"  Cleared {table}")

    # ── 2. Insert team_info ────────────────────────────────────────────────
    print("\n📋 Inserting team info...")
    team = data["team"]
    team_rows = [
        {"key": "name", "value": team["name"]},
        {"key": "school", "value": team.get("school", "Nova High School")},
        {"key": "location", "value": team.get("location", "Davie, FL")},
        {"key": "season", "value": team.get("season", "Spring 2026")},
        {"key": "district", "value": team.get("district", "6A District 15")},
        {"key": "mascot", "value": team.get("mascot", "Titans")},
        {"key": "record_overall", "value": team.get("record", {}).get("overall", "")},
    ]
    post("team_info", team_rows, upsert=True)
    print(f"  ✅ Inserted {len(team_rows)} team info entries")

    # ── 3. Insert season ──────────────────────────────────────────────────
    print("\n📅 Inserting season...")
    season_rows = post("seasons", {
        "name": "Spring 2026",
        "year": 2026,
        "is_current": True,
    })
    season_id = season_rows[0]["id"]
    print(f"  ✅ Season ID: {season_id}")

    # ── 4. Insert players ─────────────────────────────────────────────────
    print(f"\n👥 Inserting {len(data['roster'])} players...")
    player_rows_input = []
    for p in data["roster"]:
        player_rows_input.append({
            "number": p["number"],
            "name": p["name"],
            "grad_year": p.get("gradYear"),
            "positions": p.get("positions", ""),
            "height": p.get("height", ""),
            "weight": str(p["weight"]) if p.get("weight") else None,
            "headshot_url": None,  # Will be updated when we have URLs
        })
    player_rows = post("players", player_rows_input)
    # Build name → id map
    player_id_map = {r["name"]: r["id"] for r in player_rows}
    print(f"  ✅ Inserted {len(player_rows)} players")

    # ── 5. Insert games ───────────────────────────────────────────────────
    print(f"\n⚾ Inserting {len(data['schedule'])} games...")
    game_rows_input = []
    for g in data["schedule"]:
        dropbox_key = derive_dropbox_folder(g["date"])
        # Check for extended key (e.g., "2-17-26" in game_photos)
        if dropbox_key and dropbox_key not in game_photos:
            # Try with year suffix
            date_parts = g["date"].split("/")
            if len(date_parts) == 3:
                m, d, yr = date_parts
                dropbox_key_v2 = f"{int(m)}-{int(d)}-{yr.zfill(2)}"
                if dropbox_key_v2 in game_photos:
                    dropbox_key = dropbox_key_v2

        game_rows_input.append({
            "season_id": season_id,
            "date": normalize_date(g["date"]),
            "time": g.get("time"),
            "opponent": g["opponent"],
            "location": g.get("location", "home"),
            "game_type": g.get("type", "Regular Season"),
            "result": g.get("result"),
            "dropbox_folder": dropbox_key,
        })
    game_rows = post("games", game_rows_input)
    # Build dropbox_folder → id map
    game_id_map = {r["dropbox_folder"]: r["id"] for r in game_rows if r.get("dropbox_folder")}
    print(f"  ✅ Inserted {len(game_rows)} games")
    print(f"  📂 Dropbox folders mapped: {list(game_id_map.keys())[:5]}...")

    # ── 6. Insert batting stats ───────────────────────────────────────────
    print(f"\n📊 Inserting batting stats...")
    batting_rows = []
    for p in data["roster"]:
        player_id = player_id_map.get(p["name"])
        if not player_id:
            continue
        b = p.get("batting", {})
        batting_rows.append({
            "player_id": player_id,
            "season_id": season_id,
            "gp": b.get("GP", 0),
            "ab": b.get("AB", 0),
            "r": b.get("R", 0),
            "h": b.get("H", 0),
            "rbi": b.get("RBI", 0),
            "doubles": b.get("2B", 0),
            "triples": b.get("3B", 0),
            "hr": b.get("HR", 0),
            "bb": b.get("BB", 0),
            "k": b.get("K", 0),
            "sb": b.get("SB", 0),
            "ba": b.get("BA", ".000") or ".000",
            "obp": b.get("OBP", ".000") or ".000",
            "slg": b.get("SLG", ".000") or ".000",
            "ops": b.get("OPS", ".000") or ".000",
        })
    if batting_rows:
        post("batting_stats", batting_rows)
        print(f"  ✅ Inserted {len(batting_rows)} batting stat rows")

    # ── 7. Insert pitching stats ──────────────────────────────────────────
    print(f"\n🔥 Inserting pitching stats...")
    pitching_rows = []
    for p in data["roster"]:
        player_id = player_id_map.get(p["name"])
        if not player_id:
            continue
        pt = p.get("pitching", {})
        # Only insert if they have pitching appearances
        if not pt or (pt.get("APP", 0) == 0 and not pt.get("IP", "").replace(".0", "").strip()):
            continue
        pitching_rows.append({
            "player_id": player_id,
            "season_id": season_id,
            "era": pt.get("ERA") or None,
            "w": pt.get("W", 0),
            "l": pt.get("L", 0),
            "app": pt.get("APP", 0),
            "sv": pt.get("SV", 0),
            "ip": pt.get("IP", "0.0"),
            "h": pt.get("H", 0),
            "r": pt.get("R", 0),
            "er": pt.get("ER", 0),
            "bb": pt.get("BB", 0),
            "k": pt.get("K", 0),
            "whip": pt.get("WHIP") or None,
        })
    if pitching_rows:
        post("pitching_stats", pitching_rows)
        print(f"  ✅ Inserted {len(pitching_rows)} pitching stat rows")
    else:
        print("  ℹ️  No pitching stats to insert")

    # ── 8. Insert photos ──────────────────────────────────────────────────
    print(f"\n📷 Inserting photos from {len(game_photos)} game sets...")
    total_photos = 0
    for folder_key, game_data in game_photos.items():
        game_id = game_id_map.get(folder_key)
        if not game_id:
            # Try matching by month-day only
            parts = folder_key.split("-")
            if len(parts) >= 2:
                short_key = f"{parts[0]}-{parts[1]}"
                game_id = game_id_map.get(short_key)
        if not game_id:
            print(f"  ⚠️  No game found for folder: {folder_key}")
            continue

        thumbnails = game_data.get("thumbnails", [])
        all_files = game_data.get("all_files", [])

        # Use thumbnails for first 8, build complete list from all_files
        # Store dropbox_path for each photo; URL will be populated later
        photo_rows = []
        for i, f in enumerate(all_files):
            thumb = thumbnails[i] if i < len(thumbnails) else None
            photo_rows.append({
                "game_id": game_id,
                "filename": f["name"],
                "dropbox_path": f["path"],
                "url": None,  # Will be populated when Dropbox links are generated
                "sort_order": i,
            })

        if photo_rows:
            # Insert in batches of 50
            for batch_start in range(0, len(photo_rows), 50):
                batch = photo_rows[batch_start:batch_start + 50]
                post("photos", batch)
            total_photos += len(photo_rows)
            print(f"  ✅ {folder_key}: {len(photo_rows)} photos")

    print(f"\n  📸 Total photos inserted: {total_photos}")

    # ── Done ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("✅ Migration complete!")
    print(f"   Players:       {len(player_rows)}")
    print(f"   Games:         {len(game_rows)}")
    print(f"   Batting rows:  {len(batting_rows)}")
    print(f"   Pitching rows: {len(pitching_rows)}")
    print(f"   Photos:        {total_photos}")
    print()
    print("⚠️  Photo URLs are not yet set. To enable photo display:")
    print("   1. Generate Dropbox shared links for each folder")
    print("   2. Update the 'url' column in the photos table")
    print("   OR migrate photos to Supabase Storage (run migrate-photos.py)")

if __name__ == "__main__":
    main()
