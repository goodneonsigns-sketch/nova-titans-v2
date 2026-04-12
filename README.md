# Nova Titans Baseball — v2

A modern React + Supabase + Vercel gallery app for the Nova Titans baseball team.

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Design:** Dark green/gold theme (#0a0f0a / #006633 / #FFD700)

---

## Quick Start

### 1. Set Up the Database

**Option A: Supabase SQL Editor (Easiest)**
1. Go to https://supabase.com/dashboard/project/hxrucwregtzirnesvhrj/sql/new
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

**Option B: Automated script (requires PAT)**
```bash
# Get your token from: https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="sbp_your_token_here"
bash scripts/setup-db.sh
```

### 2. Migrate Data

```bash
pip install requests
python3 scripts/migrate-data.py
```

This imports all players, stats, games, and photo metadata from the original `nova-titans-gallery` project.

### 3. Run Locally

```bash
npm install
npm run dev
```

Visit http://localhost:5173

### 4. Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm install -g vercel
vercel --prod
```

Or connect the GitHub repo to Vercel at https://vercel.com/new.

**Environment variables to set in Vercel:**
```
VITE_SUPABASE_URL=https://hxrucwregtzirnesvhrj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_sx33keI7V-upXVngrmM2Rw_ZlqXfjCG
```

---

## Project Structure

```
src/
  components/
    Layout.jsx        — Nav + footer
    Hero.jsx          — Season hero with record
    PlayerCard.jsx    — Player card with headshot
    PlayerModal.jsx   — Full player stats overlay
    GameCard.jsx      — Game card with photo thumbnails
    Lightbox.jsx      — Full-screen photo gallery (swipe + keyboard)
    StatsTable.jsx    — Sortable batting/pitching stats table
    Schedule.jsx      — Season schedule table
  pages/
    Home.jsx          — Main page (all sections)
    Roster.jsx        — Full roster page with search
    Gallery.jsx       — All-games photo gallery
    SchedulePage.jsx  — Full schedule with record summary
    StatsPage.jsx     — Full stats table
  lib/
    supabase.js       — Supabase client
    queries.js        — Data fetching + helpers
supabase/
  schema.sql          — Database schema (paste into SQL editor)
scripts/
  setup-db.sh         — Automated DB setup (needs PAT)
  migrate-data.py     — Import data from nova-titans-gallery
```

---

## Pages

| Route | Page |
|-------|------|
| `/` | Home (hero + roster + gallery + stats) |
| `/roster` | Full roster with search |
| `/schedule` | Season schedule + record |
| `/gallery` | All game photos |
| `/stats` | Full batting & pitching stats |

---

## Photo Notes

Photos are stored in Dropbox. The migration script saves `dropbox_path` for each photo but doesn't set the `url` field yet.

To enable photo display, either:
1. **Generate Dropbox temp links** using the existing `generate-dropbox-links.py` in `nova-titans-gallery/`
2. **Migrate to Supabase Storage** (recommended for production) — create a `migrate-photos.py` script

---

## Database Schema

- `seasons` — Season info (Spring 2026)
- `players` — Roster with headshots
- `games` — Schedule + results
- `batting_stats` — Player batting stats by season
- `pitching_stats` — Player pitching stats by season
- `photos` — Game photos with Dropbox paths
- `team_info` — Key/value team info

---

## Development Notes

- The site works with an **empty DB** — shows a loading/empty state
- All data is fetched once on page load (small dataset)
- RLS is enabled with public read policies
- The anon key is used in the frontend (safe to expose)
- The service role key is **never** in frontend code
