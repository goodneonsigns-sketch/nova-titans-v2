import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Lightbox from '../components/Lightbox'
import { fetchPlayerPhotos } from '../lib/queries'

function StatBox({ label, value, large = false, highlight = false }) {
  return (
    <div
      className="rounded-xl p-3 sm:p-4 text-center flex flex-col items-center justify-center"
      style={{
        backgroundColor: highlight ? 'rgba(0,102,51,0.25)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${highlight ? 'rgba(0,102,51,0.5)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <div
        className="font-display font-black leading-none mb-1"
        style={{
          fontSize: large ? 'clamp(1.4rem, 4vw, 2.8rem)' : '1.1rem',
          color: highlight ? '#FFD700' : '#ffffff',
        }}
      >
        {value ?? 0}
      </div>
      <div className="font-display uppercase tracking-widest text-gray-500" style={{ fontSize: '0.6rem' }}>
        {label}
      </div>
    </div>
  )
}

function GameGalleryCard({ game, photos, onPhotoClick }) {
  const isWin = game.result?.includes('(W)')
  const isLoss = game.result?.includes('(L)')
  const isRainout = game.result?.includes('Rained Out')
  const resultColor = isWin ? '#4ade80' : isLoss ? '#f87171' : isRainout ? '#93c5fd' : '#fbbf24'
  const resultBg = isWin
    ? 'rgba(74,222,128,0.15)'
    : isLoss
    ? 'rgba(248,113,113,0.15)'
    : isRainout
    ? 'rgba(147,197,253,0.15)'
    : 'rgba(251,191,36,0.15)'

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (!photos.length) return null

  return (
    <div
      className="rounded-xl overflow-hidden border cursor-pointer group hover:-translate-y-1 transition-all duration-200"
      style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
      onClick={() => onPhotoClick(game, photos, 0)}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ paddingBottom: '60%' }}>
        <img
          src={photos[0].url}
          alt={`vs ${game.opponent}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentElement.style.backgroundColor = '#1a2a1a'
          }}
        />
        {photos.length > 1 && (
          <div
            className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
          >
            📷 {photos.length}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-white text-sm">vs {game.opponent}</div>
          <div className="text-gray-500 text-xs">{formatDate(game.date)}</div>
        </div>
        {game.result && (
          <div
            className="px-2 py-0.5 rounded text-xs font-bold font-display"
            style={{ color: resultColor, backgroundColor: resultBg }}
          >
            {isRainout ? '☔' : isWin ? 'W' : 'L'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlayerProfile({ data }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { players, battingStats, pitchingStats, fieldingStats, seasons, games } = data
  const [photos, setPhotos] = useState([])

  const currentSeason = seasons.find((s) => s.is_current) || seasons[0]

  const player = players.find((p) => p.id === id || p.id === parseInt(id))

  const playerIndex = players.findIndex((p) => p.id === player?.id)
  const prevPlayer = playerIndex > 0 ? players[playerIndex - 1] : null
  const nextPlayer = playerIndex < players.length - 1 ? players[playerIndex + 1] : null

  const [lightbox, setLightbox] = useState(null)

  // Lazy-load this player's tagged photos
  useEffect(() => {
    if (player?.id) {
      fetchPlayerPhotos(player.id).then(setPhotos)
    }
  }, [player?.id])

  if (!player) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center p-8"
        style={{ backgroundColor: '#0a0f0a' }}
      >
        <div className="text-5xl mb-4">⚾</div>
        <div className="font-display font-black text-white text-2xl mb-2">Player Not Found</div>
        <p className="text-gray-500 mb-6">This player doesn't exist or data isn't loaded yet.</p>
        <Link
          to="/roster"
          className="font-display font-bold uppercase tracking-widest px-6 py-3 rounded-lg text-sm"
          style={{ backgroundColor: '#006633', color: '#FFD700' }}
        >
          ← Back to Roster
        </Link>
      </div>
    )
  }

  const batting = battingStats?.find(
    (s) => s.player_id === player.id && s.season_id === currentSeason?.id
  )
  const fielding = fieldingStats?.find(
    (s) => s.player_id === player?.id && s.season_id === currentSeason?.id
  )
  const pitching = pitchingStats?.find(
    (s) => s.player_id === player.id && s.season_id === currentSeason?.id
  )
  const hasPitching = pitching && (pitching.app > 0 || parseFloat(pitching.ip) > 0)

  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const classLabel = player.grad_year
    ? player.grad_year === 2026
      ? 'Senior'
      : player.grad_year === 2027
      ? 'Junior'
      : player.grad_year === 2028
      ? 'Sophomore'
      : player.grad_year === 2029
      ? 'Freshman'
      : `Class of ${player.grad_year}`
    : null

  // Filter photos tagged with this player
  // Photos are already filtered for this player via fetchPlayerPhotos()
  const playerPhotos = photos

  // Group player photos by game_id
  const playerPhotosByGame = playerPhotos.reduce((acc, photo) => {
    if (!acc[photo.game_id]) acc[photo.game_id] = []
    acc[photo.game_id].push(photo)
    return acc
  }, {})

  // Get the games that have player-specific photos, preserving game order
  const gamesWithPlayerPhotos = games.filter(
    (g) => playerPhotosByGame[g.id] && playerPhotosByGame[g.id].length > 0
  )

  const getPlayerGamePhotos = (gameId) => playerPhotosByGame[gameId] || []

  return (
    <div style={{ backgroundColor: '#0a0f0a', minHeight: '100vh' }}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #060c06 0%, #0d1a0d 50%, #0a0f0a 100%)',
          minHeight: '320px',
        }}
      >
        {/* Green radial glow */}
        <div
          className="absolute top-0 left-1/3 w-96 h-96 -translate-y-1/2 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #006633 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Back nav */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link
              to="/roster"
              className="font-display font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{ color: '#4ade80', minHeight: '44px', display: 'flex', alignItems: 'center' }}
            >
              ← Back to Roster
            </Link>
            <div className="flex items-center gap-2">
              {prevPlayer && (
                <button
                  onClick={() => navigate(`/player/${prevPlayer.id}`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-all hover:border-yellow-400/50"
                  style={{ borderColor: '#1e2e1e', color: '#9ca3af', backgroundColor: '#111811', minHeight: '44px' }}
                  title={prevPlayer.name}
                >
                  ‹ #{prevPlayer.number}
                </button>
              )}
              {nextPlayer && (
                <button
                  onClick={() => navigate(`/player/${nextPlayer.id}`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-all hover:border-yellow-400/50"
                  style={{ borderColor: '#1e2e1e', color: '#9ca3af', backgroundColor: '#111811', minHeight: '44px' }}
                  title={nextPlayer.name}
                >
                  #{nextPlayer.number} ›
                </button>
              )}
            </div>
          </div>

          {/* Player hero content — stack vertically on mobile, horizontal on md+ */}
          <div className="flex flex-col items-center text-center md:flex-row md:items-end md:text-left gap-6 md:gap-10">
            {/* Jersey number (large background) */}
            <div className="relative">
              <div
                className="absolute -left-4 -top-4 font-display font-black text-green-900/30 pointer-events-none select-none"
                style={{ fontSize: 'clamp(6rem, 15vw, 14rem)', lineHeight: 1 }}
                aria-hidden="true"
              >
                {player.number}
              </div>

              {/* Headshot */}
              <div className="relative z-10">
                {player.headshot_url ? (
                  <img
                    src={player.headshot_url}
                    alt={player.name}
                    className="rounded-2xl object-cover object-top border-2"
                    style={{
                      width: 'clamp(100px, 18vw, 200px)',
                      height: 'clamp(120px, 22vw, 240px)',
                      borderColor: '#006633',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className="rounded-2xl items-center justify-center font-black border-2"
                  style={{
                    width: 'clamp(100px, 18vw, 200px)',
                    height: 'clamp(120px, 22vw, 240px)',
                    backgroundColor: '#006633',
                    borderColor: '#004d26',
                    color: '#FFD700',
                    fontSize: 'clamp(2rem, 4vw, 4rem)',
                    display: player.headshot_url ? 'none' : 'flex',
                  }}
                >
                  {initials}
                </div>
              </div>
            </div>

            {/* Player info — centered on mobile */}
            <div className="relative z-10 pb-2 w-full md:w-auto">
              {/* Number badge */}
              <div
                className="inline-flex items-center gap-1 font-display font-black uppercase tracking-widest mb-2 text-sm px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,215,0,0.15)', color: '#FFD700' }}
              >
                #{player.number}
              </div>

              {/* Name */}
              <h1
                className="font-display font-black uppercase tracking-wide leading-none mb-3 sm:mb-4 text-white"
                style={{ fontSize: 'clamp(1.75rem, 6vw, 4.5rem)' }}
              >
                {player.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start mb-3 sm:mb-4">
                {player.positions && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ backgroundColor: 'rgba(0,102,51,0.4)', color: '#4ade80' }}
                  >
                    {player.positions}
                  </span>
                )}
                {classLabel && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#d1d5db' }}
                  >
                    {classLabel}
                  </span>
                )}
                {(player.height || player.weight) && (
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}
                  >
                    {[player.height, player.weight ? `${player.weight} lbs` : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                )}
              </div>

              {/* School */}
              <div className="text-gray-500 text-xs sm:text-sm font-display uppercase tracking-widest">
                Nova High School · Davie, FL · Spring 2026
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {/* Batting Stats */}
        {batting ? (
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-1 h-7 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-base sm:text-lg" style={{ color: '#FFD700' }}>
                ⚾ Batting Stats
              </h2>
            </div>

            {/* Key rate stats — 2 cols on mobile, 4 on md */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <StatBox label="AVG" value={batting.ba || '.000'} large highlight />
              <StatBox label="OBP" value={batting.obp || '.000'} large highlight />
              <StatBox label="SLG" value={batting.slg || '.000'} large highlight />
              <StatBox label="OPS" value={batting.ops || '.000'} large highlight />
            </div>

            {/* Counting stats — 3 cols on mobile, 6 on sm, 11 on md */}
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-11 gap-1.5 sm:gap-2">
              <StatBox label="GP" value={batting.gp} />
              <StatBox label="AB" value={batting.ab} />
              <StatBox label="R" value={batting.r} />
              <StatBox label="H" value={batting.h} />
              <StatBox label="RBI" value={batting.rbi} />
              <StatBox label="2B" value={batting.doubles} />
              <StatBox label="3B" value={batting.triples} />
              <StatBox label="HR" value={batting.hr} />
              <StatBox label="BB" value={batting.bb} />
              <StatBox label="K" value={batting.k} />
              <StatBox label="SB" value={batting.sb} />
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 sm:p-8 text-center border"
            style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
          >
            <div className="text-3xl mb-2">⚾</div>
            <div className="font-display font-bold text-gray-500 uppercase tracking-widest text-sm">
              No batting stats on record
            </div>
          </div>
        )}

        {/* Pitching Stats */}
        {hasPitching && (
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-1 h-7 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-base sm:text-lg" style={{ color: '#FFD700' }}>
                🔥 Pitching Stats
              </h2>
            </div>

            {/* Key rate stats — 2 cols on mobile, 4 on md */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <StatBox label="ERA" value={pitching.era || '0.00'} large highlight />
              <StatBox label="WHIP" value={pitching.whip || '0.00'} large highlight />
              <StatBox label="W-L" value={`${pitching.w || 0}-${pitching.l || 0}`} large highlight />
              <StatBox label="SVS" value={pitching.sv ?? 0} large highlight />
            </div>

            {/* Counting stats */}
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5 sm:gap-2">
              <StatBox label="APP" value={pitching.app} />
              <StatBox label="IP" value={pitching.ip} />
              <StatBox label="H" value={pitching.h} />
              <StatBox label="R" value={pitching.r} />
              <StatBox label="ER" value={pitching.er} />
              <StatBox label="BB" value={pitching.bb} />
              <StatBox label="K" value={pitching.k} />
            </div>
          </div>
        )}

        {/* Fielding / Baserunning Stats */}
        {fielding && fielding.sb > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-1 h-7 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-base sm:text-lg" style={{ color: '#FFD700' }}>
                🧤 Fielding & Baserunning
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              <StatBox label="SB" value={fielding.sb} large highlight />
              <StatBox label="SBA" value={fielding.sba} large />
              <StatBox label="SB%" value={fielding.sbp || '.000'} large highlight />
              {fielding.po > 0 && <StatBox label="PO" value={fielding.po} />}
              {fielding.a > 0 && <StatBox label="A" value={fielding.a} />}
              {fielding.e > 0 && <StatBox label="E" value={fielding.e} />}
              {fielding.dp > 0 && <StatBox label="DP" value={fielding.dp} />}
              {fielding.fp && fielding.fp !== '0' && <StatBox label="FP" value={fielding.fp} />}
            </div>
          </div>
        )}

        {/* Game Photos Section — player-specific */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-base sm:text-lg" style={{ color: '#FFD700' }}>
                📷 Action Shots
              </h2>
            </div>
            <Link
              to="/gallery"
              className="font-display font-bold uppercase tracking-widest text-sm"
              style={{ color: '#4ade80' }}
            >
              Full Gallery →
            </Link>
          </div>

          {gamesWithPlayerPhotos.length > 0 ? (
            // 2 columns on mobile, 3 on sm, 4 on md
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {gamesWithPlayerPhotos.map((game) => (
                <GameGalleryCard
                  key={game.id}
                  game={game}
                  photos={getPlayerGamePhotos(game.id)}
                  onPhotoClick={(g, p, i) => setLightbox({ game: g, photos: p, index: i })}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 sm:p-10 text-center border"
              style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
            >
              <div className="text-4xl mb-3">📸</div>
              <div className="font-display font-bold text-gray-400 uppercase tracking-widest text-sm mb-1">
                Action shots coming soon!
              </div>
              <p className="text-gray-600 text-sm">
                Photos featuring this player will appear here once tagged.
              </p>
            </div>
          )}
        </div>

        {/* Browse other players — full-width prev/next on mobile */}
        <div
          className="rounded-2xl p-4 sm:p-6 border"
          style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
        >
          <div className="mb-4">
            <div className="font-display font-black text-white text-base sm:text-lg uppercase tracking-widest">
              Browse the Roster
            </div>
            <div className="text-gray-500 text-sm mt-1">
              View all {players.length} players on the 2026 Nova Titans
            </div>
          </div>

          {/* Full-width buttons on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {prevPlayer && (
              <button
                onClick={() => navigate(`/player/${prevPlayer.id}`)}
                className="font-display font-bold uppercase tracking-widest px-4 py-3 sm:py-2 rounded-lg text-sm border transition-all hover:border-yellow-400/50 flex-1 sm:flex-none text-center"
                style={{ borderColor: '#1e2e1e', color: '#9ca3af', backgroundColor: '#0a0f0a', minHeight: '44px' }}
              >
                ‹ {prevPlayer.name.split(' ')[0]}
              </button>
            )}
            <Link
              to="/roster"
              className="font-display font-bold uppercase tracking-widest px-5 py-3 sm:py-2 rounded-lg text-sm flex-1 sm:flex-none text-center"
              style={{ backgroundColor: '#006633', color: '#FFD700', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              All Players
            </Link>
            {nextPlayer && (
              <button
                onClick={() => navigate(`/player/${nextPlayer.id}`)}
                className="font-display font-bold uppercase tracking-widest px-4 py-3 sm:py-2 rounded-lg text-sm border transition-all hover:border-yellow-400/50 flex-1 sm:flex-none text-center"
                style={{ borderColor: '#1e2e1e', color: '#9ca3af', backgroundColor: '#0a0f0a', minHeight: '44px' }}
              >
                {nextPlayer.name.split(' ')[0]} ›
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          game={lightbox.game}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
