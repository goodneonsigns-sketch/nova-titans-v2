import { supabase } from './supabase'

/**
 * Fetch core data needed for the app (NO photos — those load lazily).
 * Also fetches lightweight photo counts per game for display.
 */
export async function fetchAllData() {
  const [
    teamInfoRes,
    seasonsRes,
    gamesRes,
    playersRes,
    battingRes,
    pitchingRes,
    fieldingRes,
    articlesRes,
  ] = await Promise.all([
    supabase.from('team_info').select('*'),
    supabase.from('seasons').select('*').order('year', { ascending: false }),
    supabase.from('games').select('*').order('date', { ascending: true }),
    supabase.from('players').select('*').order('number', { ascending: true }),
    supabase.from('batting_stats').select('*'),
    supabase.from('pitching_stats').select('*'),
    supabase.from('fielding_stats').select('*'),
    supabase.from('articles').select('*').order('date', { ascending: false }),
  ])

  // Convert team_info array to object
  const teamInfo = {}
  if (teamInfoRes.data) {
    teamInfoRes.data.forEach(({ key, value }) => {
      teamInfo[key] = value
    })
  }

  return {
    teamInfo,
    seasons: seasonsRes.data || [],
    games: gamesRes.data || [],
    players: playersRes.data || [],
    battingStats: battingRes.data || [],
    pitchingStats: pitchingRes.data || [],
    fieldingStats: fieldingRes.data || [],
    photos: [], // loaded lazily via fetchPhotos()
    articles: articlesRes.data || [],
    errors: [
      teamInfoRes.error,
      seasonsRes.error,
      gamesRes.error,
      playersRes.error,
      battingRes.error,
      pitchingRes.error,
      fieldingRes.error,
      // articles error is non-fatal
    ].filter(Boolean),
  }
}

// Cache for lazily loaded photos
let _photosCache = null
let _photosLoading = false
let _photosCallbacks = []

/**
 * Lazily fetch ALL photos (called on demand, cached after first load).
 */
export async function fetchPhotos() {
  if (_photosCache) return _photosCache

  if (_photosLoading) {
    // Already loading — wait for it
    return new Promise(resolve => _photosCallbacks.push(resolve))
  }

  _photosLoading = true
  const all = []
  let offset = 0
  while (true) {
    const { data, error } = await supabase
      .from('photos')
      .select('id,game_id,filename,url,sort_order,player_ids')
      .order('sort_order', { ascending: true })
      .range(offset, offset + 999)
    if (error || !data || data.length === 0) break
    all.push(...data)
    offset += data.length
    if (data.length < 1000) break
  }

  _photosCache = all
  _photosLoading = false
  _photosCallbacks.forEach(cb => cb(all))
  _photosCallbacks = []
  return all
}

/**
 * Fetch photos for a specific game only (lightweight).
 */
export async function fetchGamePhotos(gameId) {
  const { data } = await supabase
    .from('photos')
    .select('id,game_id,filename,url,sort_order,player_ids')
    .eq('game_id', gameId)
    .order('sort_order', { ascending: true })
  return data || []
}

/**
 * Fetch photos for a specific player only.
 */
export async function fetchPlayerPhotos(playerId) {
  const { data } = await supabase
    .from('photos')
    .select('id,game_id,filename,url,sort_order,player_ids')
    .contains('player_ids', [playerId])
    .order('sort_order', { ascending: true })
  return data || []
}

/**
 * Fetch photo counts per game (lightweight — for showing "X photos" badges).
 */
export async function fetchPhotoCounts() {
  const { data } = await supabase
    .from('photos')
    .select('game_id')
  if (!data) return {}
  const counts = {}
  data.forEach(p => { counts[p.game_id] = (counts[p.game_id] || 0) + 1 })
  return counts
}

/**
 * Get photos for a specific game
 */
export function getGamePhotos(photos, gameId) {
  return photos.filter(p => p.game_id === gameId)
}

/**
 * Get batting stats for a player in a season
 */
export function getPlayerBattingStats(battingStats, playerId, seasonId) {
  return battingStats.find(s => s.player_id === playerId && s.season_id === seasonId) || null
}

/**
 * Get pitching stats for a player in a season
 */
export function getPlayerPitchingStats(pitchingStats, playerId, seasonId) {
  return pitchingStats.find(s => s.player_id === playerId && s.season_id === seasonId) || null
}

/**
 * Compute team record from games (W/L/Rained Out)
 */
export function computeRecord(games) {
  let w = 0, l = 0
  games.forEach(g => {
    if (!g.result) return
    if (g.result.includes('(W)')) w++
    else if (g.result.includes('(L)')) l++
  })
  return `${w}-${l}`
}

/**
 * Get top N batting leaders by a stat (e.g. 'ba', 'hr', 'rbi')
 */
export function getBattingLeaders(battingStats, players, stat, n = 5) {
  return battingStats
    .filter(s => s[stat] && parseFloat(s[stat]) > 0)
    .sort((a, b) => parseFloat(b[stat]) - parseFloat(a[stat]))
    .slice(0, n)
    .map(s => ({
      ...s,
      player: players.find(p => p.id === s.player_id),
    }))
}

/**
 * Get top N pitching leaders by a stat (e.g. 'era', 'k', 'w')
 */
export function getPitchingLeaders(pitchingStats, players, stat, n = 5) {
  const ascending = stat === 'era' || stat === 'whip'
  return pitchingStats
    .filter(s => s[stat] && s[stat] !== '0' && s.app > 0)
    .sort((a, b) =>
      ascending
        ? parseFloat(a[stat]) - parseFloat(b[stat])
        : parseFloat(b[stat]) - parseFloat(a[stat])
    )
    .slice(0, n)
    .map(s => ({
      ...s,
      player: players.find(p => p.id === s.player_id),
    }))
}
