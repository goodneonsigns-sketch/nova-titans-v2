import { supabase } from './supabase'

/**
 * Fetch all data needed for the app in parallel.
 * Returns { teamInfo, seasons, games, players, battingStats, pitchingStats, photos }
 */
export async function fetchAllData() {
  const [
    teamInfoRes,
    seasonsRes,
    gamesRes,
    playersRes,
    battingRes,
    pitchingRes,
    photosRes,
    articlesRes,
  ] = await Promise.all([
    supabase.from('team_info').select('*'),
    supabase.from('seasons').select('*').order('year', { ascending: false }),
    supabase.from('games').select('*').order('date', { ascending: true }),
    supabase.from('players').select('*').order('number', { ascending: true }),
    supabase.from('batting_stats').select('*'),
    supabase.from('pitching_stats').select('*'),
    supabase.from('photos').select('id,game_id,filename,url,storage_path,sort_order,player_ids').order('sort_order', { ascending: true }).limit(5000),
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
    photos: photosRes.data || [],
    articles: articlesRes.data || [],
    errors: [
      teamInfoRes.error,
      seasonsRes.error,
      gamesRes.error,
      playersRes.error,
      battingRes.error,
      pitchingRes.error,
      photosRes.error,
      // articles error is non-fatal — table may not exist yet
    ].filter(Boolean),
  }
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
