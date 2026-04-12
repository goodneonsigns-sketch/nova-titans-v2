import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import Lightbox from '../components/Lightbox'
import { getBattingLeaders, getPitchingLeaders, computeRecord } from '../lib/queries'

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ target, decimals = 0, prefix = '', suffix = '' }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1600
          const steps = 60
          const stepVal = target / steps
          let current = 0
          const timer = setInterval(() => {
            current = Math.min(current + stepVal, target)
            setValue(current)
            if (current >= target) clearInterval(timer)
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [target])

  const display =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toString()

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

// ─── Schedule Strip ───────────────────────────────────────────────────────────
function ScheduleStrip({ games }) {
  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex gap-3 min-w-max">
        {games.map((game) => {
          const isWin = game.result?.includes('(W)')
          const isLoss = game.result?.includes('(L)')
          const isRainout = game.result?.includes('Rained Out')
          const dotColor = isWin ? '#4ade80' : isLoss ? '#f87171' : '#FFD700'
          const dotBg = isWin
            ? 'rgba(74,222,128,0.15)'
            : isLoss
            ? 'rgba(248,113,113,0.15)'
            : 'rgba(255,215,0,0.15)'
          const formatted = game.date
            ? new Date(game.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : ''

          return (
            <Link
              key={game.id}
              to="/gallery"
              className="flex flex-col items-center gap-1.5 group"
              title={`vs ${game.opponent}${game.result ? ' · ' + game.result : ''}`}
            >
              <div
                className="w-3 h-3 rounded-full transition-transform group-hover:scale-150"
                style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
              />
              <div
                className="rounded-lg px-2 py-1 text-center transition-all"
                style={{ backgroundColor: dotBg, border: `1px solid ${dotColor}30` }}
              >
                <div className="font-display font-bold text-xs" style={{ color: dotColor }}>
                  {isRainout ? '☔' : isWin ? 'W' : isLoss ? 'L' : '—'}
                </div>
                <div className="text-gray-400 text-xs whitespace-nowrap">{game.opponent?.slice(0, 8)}</div>
                <div className="text-gray-600 text-xs">{formatted}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Player Carousel Card ────────────────────────────────────────────────────
function CarouselPlayerCard({ player, battingStats, pitchingStats, season, navigate }) {
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const batting = battingStats?.find(
    (s) => s.player_id === player.id && s.season_id === season?.id
  )
  const pitching = pitchingStats?.find(
    (s) => s.player_id === player.id && s.season_id === season?.id
  )

  const keyStat = batting?.ba
    ? { label: 'AVG', value: batting.ba }
    : batting?.hr
    ? { label: 'HR', value: batting.hr }
    : pitching?.k
    ? { label: 'K', value: pitching.k }
    : null

  return (
    <button
      onClick={() => navigate(`/player/${player.id}`)}
      className="shrink-0 w-40 group focus:outline-none"
    >
      <div
        className="rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 border group-hover:border-yellow-400/60 group-hover:-translate-y-1"
        style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
      >
        {/* Headshot */}
        <div className="relative">
          {player.headshot_url ? (
            <img
              src={player.headshot_url}
              alt={player.name}
              className="w-16 h-16 rounded-full object-cover object-top border-2"
              style={{ borderColor: '#006633' }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="w-16 h-16 rounded-full items-center justify-center text-xl font-bold border-2"
            style={{
              backgroundColor: '#006633',
              borderColor: '#004d26',
              color: '#FFD700',
              display: player.headshot_url ? 'none' : 'flex',
            }}
          >
            {initials}
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: '#FFD700', color: '#0a0f0a' }}
          >
            {player.number}
          </div>
        </div>

        {/* Name */}
        <div className="font-display font-bold text-white text-sm text-center leading-tight w-full truncate">
          {player.name}
        </div>

        {/* Position */}
        {player.positions && (
          <div
            className="text-xs px-2 py-0.5 rounded font-semibold"
            style={{ backgroundColor: 'rgba(0,102,51,0.4)', color: '#4ade80' }}
          >
            {player.positions}
          </div>
        )}

        {/* Key stat */}
        {keyStat && (
          <div className="text-center mt-1">
            <div className="font-display font-black text-lg" style={{ color: '#FFD700' }}>
              {keyStat.value}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">
              {keyStat.label}
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

// ─── Main Home Component ──────────────────────────────────────────────────────
export default function Home({ data }) {
  const { seasons, games, players, battingStats, pitchingStats, photos } = data
  const navigate = useNavigate()

  const currentSeason = seasons.find((s) => s.is_current) || seasons[0]

  const [lightbox, setLightbox] = useState(null)
  const carouselRef = useRef(null)

  // ── Data helpers ──────────────────────────────────────────────────────────
  const getGamePhotos = (gameId) => photos.filter((p) => p.game_id === gameId)

  // Most recent game with a result
  const gamesWithResult = games.filter((g) => g.result)
  const latestGame = gamesWithResult[gamesWithResult.length - 1]
  const latestGamePhotos = latestGame ? getGamePhotos(latestGame.id) : []

  // Games that have photos — for gallery preview
  const gamesWithPhotos = games.filter((g) => getGamePhotos(g.id).length > 0)

  // One representative photo per game (for masonry preview)
  const galleryPreviewPhotos = gamesWithPhotos
    .map((g) => ({ game: g, photo: getGamePhotos(g.id)[0] }))
    .filter((x) => x.photo)
    .slice(0, 12)

  // Season stats
  const record = computeRecord(games)
  const totalHRs = battingStats.reduce((sum, s) => sum + (parseInt(s.hr) || 0), 0)
  const totalKsPitched = pitchingStats.reduce((sum, s) => sum + (parseInt(s.k) || 0), 0)
  const avgBA = (() => {
    const valid = battingStats.filter((s) => s.ba && parseFloat(s.ba) > 0)
    if (!valid.length) return 0
    return valid.reduce((sum, s) => sum + parseFloat(s.ba), 0) / valid.length
  })()

  // Stat leaders
  const avgLeaders = getBattingLeaders(battingStats, players, 'ba', 3)
  const hrLeaders = getBattingLeaders(battingStats, players, 'hr', 3)
  const kLeaders = getPitchingLeaders(pitchingStats, players, 'k', 3)

  // Parse result score from e.g. "9-8 (W)"
  const parseScore = (result) => {
    if (!result) return null
    const match = result.match(/(\d+)-(\d+)/)
    return match ? { titans: match[1], opp: match[2] } : null
  }

  // Carousel auto-rotate
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const interval = setInterval(() => {
      el.scrollLeft += 176 // ~one card width
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollLeft = 0
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── SECTION 1: Hero ─────────────────────────────────────── */}
      <Hero teamInfo={data.teamInfo} games={games} photos={photos} />

      {/* ── SECTION 2: Latest Game Spotlight ────────────────────── */}
      {latestGame && (
        <section
          className="py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-xl" style={{ color: '#FFD700' }}>
                Latest Game
              </h2>
            </div>

            {/* Score display */}
            {(() => {
              const score = parseScore(latestGame.result)
              const isWin = latestGame.result?.includes('(W)')
              return (
                <div className="mb-8">
                  <div
                    className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl mb-3"
                    style={{ backgroundColor: '#111811', border: '1px solid #1e2e1e' }}
                  >
                    <span
                      className="font-display font-black uppercase tracking-widest"
                      style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)', color: '#FFD700' }}
                    >
                      TITANS
                    </span>
                    {score ? (
                      <>
                        <span
                          className="font-display font-black"
                          style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: isWin ? '#4ade80' : '#f87171' }}
                        >
                          {score.titans}
                        </span>
                        <span className="font-display font-black text-gray-600" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
                          —
                        </span>
                        <span
                          className="font-display font-black text-gray-300"
                          style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
                        >
                          {score.opp}
                        </span>
                      </>
                    ) : (
                      <span className="font-display font-bold text-gray-400 text-xl">
                        {latestGame.result}
                      </span>
                    )}
                    <span
                      className="font-display font-black uppercase tracking-widest"
                      style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)', color: 'rgba(255,255,255,0.5)' }}
                    >
                      {latestGame.opponent}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span
                      className="px-2 py-0.5 rounded font-display font-bold text-xs uppercase"
                      style={{
                        backgroundColor: isWin ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)',
                        color: isWin ? '#4ade80' : '#f87171',
                      }}
                    >
                      {isWin ? 'WIN' : 'LOSS'}
                    </span>
                    {latestGame.date && (
                      <span>
                        {new Date(latestGame.date + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Photo strip */}
            {latestGamePhotos.length > 0 && (
              <div
                className="grid gap-2 rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(latestGamePhotos.length, 4)}, 1fr)`,
                  maxHeight: '320px',
                }}
                onClick={() => setLightbox({ game: latestGame, photos: latestGamePhotos, index: 0 })}
              >
                {latestGamePhotos.slice(0, 4).map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="relative overflow-hidden group"
                    style={{ paddingBottom: '66%' }}
                  >
                    <img
                      src={photo.url}
                      alt={`Game photo ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.style.backgroundColor = '#1a2a1a'
                      }}
                    />
                    {idx === 3 && latestGamePhotos.length > 4 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="font-display font-black text-white text-2xl">
                          +{latestGamePhotos.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SECTION 3: Player Spotlight Carousel ────────────────── */}
      {players.length > 0 && (
        <section
          className="py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-xl" style={{ color: '#FFD700' }}>
                  Player Spotlight
                </h2>
              </div>
              <Link
                to="/roster"
                className="font-display font-bold text-sm uppercase tracking-widest transition-colors"
                style={{ color: '#4ade80' }}
              >
                Full Roster →
              </Link>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {players.map((player) => (
                <CarouselPlayerCard
                  key={player.id}
                  player={player}
                  battingStats={battingStats}
                  pitchingStats={pitchingStats}
                  season={currentSeason}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 4: Season Stats Dashboard ───────────────────── */}
      {(battingStats.length > 0 || pitchingStats.length > 0) && (
        <section
          className="py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)', background: 'linear-gradient(180deg, #0a0f0a 0%, #060c06 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-xl" style={{ color: '#FFD700' }}>
                Season Stats
              </h2>
            </div>

            {/* Animated counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                {
                  label: 'Team AVG',
                  value: <AnimatedCounter target={avgBA} decimals={3} />,
                },
                {
                  label: 'Home Runs',
                  value: <AnimatedCounter target={totalHRs} />,
                },
                {
                  label: 'Strikeouts (P)',
                  value: <AnimatedCounter target={totalKsPitched} />,
                },
                {
                  label: 'Games Played',
                  value: <AnimatedCounter target={games.length} />,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-6 text-center border"
                  style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
                >
                  <div
                    className="font-display font-black leading-none mb-2"
                    style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#FFD700' }}
                  >
                    {stat.value}
                  </div>
                  <div className="font-display uppercase tracking-widest text-xs text-gray-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Batting Average Leaders */}
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}>
                <h3 className="font-display font-bold uppercase tracking-widest text-sm mb-5 flex items-center gap-2" style={{ color: '#FFD700' }}>
                  ⚾ Batting Average
                </h3>
                <div className="space-y-4">
                  {avgLeaders.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => s.player && navigate(`/player/${s.player.id}`)}
                      className="flex items-center gap-3 w-full group hover:opacity-80 transition-opacity"
                    >
                      <span
                        className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.08)',
                          color: i === 0 ? '#0a0f0a' : '#9ca3af',
                        }}
                      >
                        {i + 1}
                      </span>
                      {s.player?.headshot_url ? (
                        <img
                          src={s.player.headshot_url}
                          alt={s.player.name}
                          className="w-9 h-9 rounded-full object-cover object-top border shrink-0"
                          style={{ borderColor: '#006633' }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#006633', color: '#FFD700' }}
                        >
                          {s.player?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-white text-sm font-semibold truncate">
                          {s.player?.name || 'Unknown'}
                        </div>
                        <div className="text-gray-600 text-xs">{s.gp} GP · {s.ab} AB</div>
                      </div>
                      <span className="font-display font-black text-lg shrink-0" style={{ color: '#FFD700' }}>
                        {s.ba}
                      </span>
                    </button>
                  ))}
                  {avgLeaders.length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-2">No data yet</p>
                  )}
                </div>
              </div>

              {/* HR Leaders */}
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}>
                <h3 className="font-display font-bold uppercase tracking-widest text-sm mb-5 flex items-center gap-2" style={{ color: '#FFD700' }}>
                  💪 Home Runs
                </h3>
                <div className="space-y-4">
                  {hrLeaders.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => s.player && navigate(`/player/${s.player.id}`)}
                      className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
                    >
                      <span
                        className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.08)',
                          color: i === 0 ? '#0a0f0a' : '#9ca3af',
                        }}
                      >
                        {i + 1}
                      </span>
                      {s.player?.headshot_url ? (
                        <img
                          src={s.player.headshot_url}
                          alt={s.player.name}
                          className="w-9 h-9 rounded-full object-cover object-top border shrink-0"
                          style={{ borderColor: '#006633' }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#006633', color: '#FFD700' }}
                        >
                          {s.player?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-white text-sm font-semibold truncate">
                          {s.player?.name || 'Unknown'}
                        </div>
                        <div className="text-gray-600 text-xs">{s.rbi} RBI · {s.h} H</div>
                      </div>
                      <span className="font-display font-black text-3xl shrink-0" style={{ color: '#FFD700' }}>
                        {s.hr}
                      </span>
                    </button>
                  ))}
                  {hrLeaders.length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-2">No data yet</p>
                  )}
                </div>
              </div>

              {/* K Leaders */}
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}>
                <h3 className="font-display font-bold uppercase tracking-widest text-sm mb-5 flex items-center gap-2" style={{ color: '#FFD700' }}>
                  🔥 Strikeouts (Pitching)
                </h3>
                <div className="space-y-4">
                  {kLeaders.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => s.player && navigate(`/player/${s.player.id}`)}
                      className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
                    >
                      <span
                        className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.08)',
                          color: i === 0 ? '#0a0f0a' : '#9ca3af',
                        }}
                      >
                        {i + 1}
                      </span>
                      {s.player?.headshot_url ? (
                        <img
                          src={s.player.headshot_url}
                          alt={s.player.name}
                          className="w-9 h-9 rounded-full object-cover object-top border shrink-0"
                          style={{ borderColor: '#006633' }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#006633', color: '#FFD700' }}
                        >
                          {s.player?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-white text-sm font-semibold truncate">
                          {s.player?.name || 'Unknown'}
                        </div>
                        <div className="text-gray-600 text-xs">{s.app} APP · {s.ip} IP</div>
                      </div>
                      <span className="font-display font-black text-3xl shrink-0" style={{ color: '#FFD700' }}>
                        {s.k}
                      </span>
                    </button>
                  ))}
                  {kLeaders.length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-2">No data yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 5: Photo Gallery Preview ────────────────────── */}
      {galleryPreviewPhotos.length > 0 && (
        <section
          className="py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-xl" style={{ color: '#FFD700' }}>
                  Photo Gallery
                </h2>
              </div>
              <Link
                to="/gallery"
                className="font-display font-bold text-sm uppercase tracking-widest transition-colors"
                style={{ color: '#4ade80' }}
              >
                View All Photos →
              </Link>
            </div>

            {/* Masonry-style grid */}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {galleryPreviewPhotos.map(({ game, photo }, idx) => (
                <div
                  key={photo.id || idx}
                  className="relative overflow-hidden rounded-xl break-inside-avoid cursor-pointer group"
                  onClick={() => {
                    const gamePhotos = getGamePhotos(game.id)
                    setLightbox({ game, photos: gamePhotos, index: 0 })
                  }}
                >
                  <img
                    src={photo.url}
                    alt={`vs ${game.opponent}`}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.parentElement.style.display = 'none'
                    }}
                  />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }}
                  >
                    <div>
                      <div className="font-display font-bold text-white text-xs">
                        vs {game.opponent}
                      </div>
                      {game.date && (
                        <div className="text-gray-300 text-xs">
                          {new Date(game.date + 'T12:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 6: Schedule Strip ────────────────────────────── */}
      {games.length > 0 && (
        <section
          className="py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-xl" style={{ color: '#FFD700' }}>
                  2026 Season
                </h2>
              </div>
              <Link
                to="/schedule"
                className="font-display font-bold text-sm uppercase tracking-widest transition-colors"
                style={{ color: '#4ade80' }}
              >
                Full Schedule →
              </Link>
            </div>

            <ScheduleStrip games={games} />

            {/* Record summary */}
            <div className="flex items-center gap-6 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                Win
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                Loss
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFD700' }} />
                Upcoming / Rained Out
              </span>
              <span className="ml-auto font-display font-bold" style={{ color: '#FFD700' }}>
                {record}
              </span>
            </div>
          </div>
        </section>
      )}

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
