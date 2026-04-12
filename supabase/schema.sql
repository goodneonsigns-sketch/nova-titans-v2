-- Nova Titans Baseball - Supabase Schema
-- Paste this into the Supabase SQL Editor: https://supabase.com/dashboard/project/hxrucwregtzirnesvhrj/sql/new

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  grad_year INTEGER,
  positions TEXT,
  height TEXT,
  weight TEXT,
  headshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,  -- e.g., "Spring 2026"
  year INTEGER NOT NULL,
  is_current BOOLEAN DEFAULT FALSE
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id),
  date DATE NOT NULL,
  time TEXT,
  opponent TEXT NOT NULL,
  location TEXT DEFAULT 'home',
  game_type TEXT DEFAULT 'Regular Season',
  result TEXT,  -- e.g., "9-8 (W)", "Rained Out", null for upcoming
  dropbox_folder TEXT,  -- e.g., "4-10-26"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player batting stats (season totals)
CREATE TABLE IF NOT EXISTS batting_stats (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  season_id INTEGER REFERENCES seasons(id),
  gp INTEGER DEFAULT 0,
  ab INTEGER DEFAULT 0,
  r INTEGER DEFAULT 0,
  h INTEGER DEFAULT 0,
  rbi INTEGER DEFAULT 0,
  doubles INTEGER DEFAULT 0,
  triples INTEGER DEFAULT 0,
  hr INTEGER DEFAULT 0,
  bb INTEGER DEFAULT 0,
  k INTEGER DEFAULT 0,
  sb INTEGER DEFAULT 0,
  ba TEXT,
  obp TEXT,
  slg TEXT,
  ops TEXT,
  UNIQUE(player_id, season_id)
);

-- Player pitching stats (season totals)
CREATE TABLE IF NOT EXISTS pitching_stats (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  season_id INTEGER REFERENCES seasons(id),
  era TEXT,
  w INTEGER DEFAULT 0,
  l INTEGER DEFAULT 0,
  app INTEGER DEFAULT 0,
  sv INTEGER DEFAULT 0,
  ip TEXT,
  h INTEGER DEFAULT 0,
  r INTEGER DEFAULT 0,
  er INTEGER DEFAULT 0,
  bb INTEGER DEFAULT 0,
  k INTEGER DEFAULT 0,
  whip TEXT,
  UNIQUE(player_id, season_id)
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id),
  filename TEXT NOT NULL,
  storage_path TEXT,  -- Supabase storage path
  dropbox_path TEXT,  -- Original Dropbox path
  url TEXT,           -- Direct URL (Supabase storage or Dropbox temp link)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team info (key/value store)
CREATE TABLE IF NOT EXISTS team_info (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE batting_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_info ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read" ON players FOR SELECT USING (true);
CREATE POLICY "Public read" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read" ON games FOR SELECT USING (true);
CREATE POLICY "Public read" ON batting_stats FOR SELECT USING (true);
CREATE POLICY "Public read" ON pitching_stats FOR SELECT USING (true);
CREATE POLICY "Public read" ON photos FOR SELECT USING (true);
CREATE POLICY "Public read" ON team_info FOR SELECT USING (true);

-- Service role write policies (needed for migration script)
CREATE POLICY "Service role insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role insert" ON seasons FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role insert" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role insert" ON batting_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role insert" ON pitching_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role insert" ON photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role insert" ON team_info FOR INSERT WITH CHECK (true);
