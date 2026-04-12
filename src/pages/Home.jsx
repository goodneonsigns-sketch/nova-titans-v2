import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import Lightbox from '../components/Lightbox'
import { getBattingLeaders, getPitchingLeaders, computeRecord, fetchPhotos } from '../lib/queries'
import highlightsData from '../../content/highlights.json'

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
    <div
      className="overflow-x-auto pb-3"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="flex gap-2 sm:gap-3 min-w-max px-1">
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

          // Abbreviate opponent to 3 chars on mobile (handled in layout via text truncation)
          const opponentAbbr = game.opponent ? game.opponent.slice(0, 3).toUpperCase() : '???'

          return (
            <Link
              key={game.id}
              to="/gallery"
              className="flex flex-col items-center gap-1.5 group"
              title={`vs ${game.opponent}${game.result ? ' · ' + game.result : ''}`}
              style={{ minWidth: '52px' }}
            >
              <div
                className="w-3 h-3 rounded-full transition-transform group-hover:scale-150"
                style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
              />
              <div
                className="rounded-lg px-2 py-1.5 text-center transition-all"
                style={{
                  backgroundColor: dotBg,
                  border: `1px solid ${dotColor}30`,
                  minHeight: '48px',
                  minWidth: '48px',
                }}
              >
                <div className="font-display font-bold text-xs" style={{ color: dotColor }}>
                  {isRainout ? '☔' : isWin ? 'W' : isLoss ? 'L' : '—'}
                </div>
                {/* Mobile: 3-char abbreviation; sm+: up to 8 chars */}
                <div className="text-gray-400 text-xs whitespace-nowrap sm:hidden">{opponentAbbr}</div>
                <div className="text-gray-400 text-xs whitespace-nowrap hidden sm:block">{game.opponent?.slice(0, 8)}</div>
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
      // Slightly wider on mobile for better tap targets; w-40 on sm+
      className="shrink-0 w-44 sm:w-40 group focus:outline-none"
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
  const { seasons, games, players, battingStats, pitchingStats, articles = [] } = data
  const [photos, setPhotos] = useState([])
  
  useEffect(() => {
    fetchPhotos().then(setPhotos)
  }, [])
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
          className="py-8 sm:py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5 sm:mb-8">
              <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
                Latest Game
              </h2>
            </div>

            {/* Score display */}
            {(() => {
              const score = parseScore(latestGame.result)
              const isWin = latestGame.result?.includes('(W)')
              return (
                <div className="mb-6 sm:mb-8">
                  {/* Score row — wraps tightly on mobile */}
                  <div
                    className="inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 rounded-2xl mb-3 max-w-full overflow-hidden"
                    style={{ backgroundColor: '#111811', border: '1px solid #1e2e1e' }}
                  >
                    <span
                      className="font-display font-black uppercase tracking-widest whitespace-nowrap"
                      style={{ fontSize: 'clamp(0.8rem, 3vw, 2.5rem)', color: '#FFD700' }}
                    >
                      TITANS
                    </span>
                    {score ? (
                      <>
                        <span
                          className="font-display font-black"
                          style={{ fontSize: 'clamp(1.5rem, 5vw, 4rem)', color: isWin ? '#4ade80' : '#f87171' }}
                        >
                          {score.titans}
                        </span>
                        <span className="font-display font-black text-gray-600" style={{ fontSize: 'clamp(1rem, 3vw, 3rem)' }}>
                          —
                        </span>
                        <span
                          className="font-display font-black text-gray-300"
                          style={{ fontSize: 'clamp(1.5rem, 5vw, 4rem)' }}
                        >
                          {score.opp}
                        </span>
                      </>
                    ) : (
                      <span className="font-display font-bold text-gray-400 text-base sm:text-xl">
                        {latestGame.result}
                      </span>
                    )}
                    <span
                      className="font-display font-black uppercase tracking-widest whitespace-nowrap truncate max-w-[80px] sm:max-w-none"
                      style={{ fontSize: 'clamp(0.8rem, 3vw, 2.5rem)', color: 'rgba(255,255,255,0.5)' }}
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
                      <span className="text-xs sm:text-sm">
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

            {/* Photo strip — 2 cols on mobile, 4 on sm+ */}
            {latestGamePhotos.length > 0 && (
              <div
                className="grid gap-2 rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  gridTemplateColumns: `repeat(2, 1fr)`,
                  maxHeight: '320px',
                }}
                onClick={() => setLightbox({ game: latestGame, photos: latestGamePhotos, index: 0 })}
              >
                {/* Mobile: show 2 photos; sm+: show 4 */}
                {latestGamePhotos.slice(0, 2).map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="relative overflow-hidden group sm:hidden"
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
                    {idx === 1 && latestGamePhotos.length > 2 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="font-display font-black text-white text-2xl">
                          +{latestGamePhotos.length - 2}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {/* Desktop: show 4 photos in a 4-col grid override */}
                <div
                  className="hidden sm:contents"
                  style={{ gridColumn: '1 / -1' }}
                >
                  <div
                    className="hidden sm:grid gap-2 col-span-2 rounded-2xl overflow-hidden"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(latestGamePhotos.length, 4)}, 1fr)`,
                    }}
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
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SECTION 3: Player Spotlight Carousel ────────────────── */}
      {players.length > 0 && (
        <section
          className="py-8 sm:py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
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
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
              }}
            >
              {players.map((player) => (
                <div key={player.id} style={{ scrollSnapAlign: 'start' }}>
                  <CarouselPlayerCard
                    player={player}
                    battingStats={battingStats}
                    pitchingStats={pitchingStats}
                    season={currentSeason}
                    navigate={navigate}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 4: Season Stats Dashboard ───────────────────── */}
      {(battingStats.length > 0 || pitchingStats.length > 0) && (
        <section
          className="py-8 sm:py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)', background: 'linear-gradient(180deg, #0a0f0a 0%, #060c06 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6 sm:mb-10">
              <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
                Season Stats
              </h2>
            </div>

            {/* Animated counters — 2x2 on mobile, 4 across on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 sm:mb-12">
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
                  className="rounded-2xl p-4 sm:p-6 text-center border"
                  style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
                >
                  <div
                    className="font-display font-black leading-none mb-2"
                    style={{ fontSize: 'clamp(1.8rem, 5vw, 4rem)', color: '#FFD700' }}
                  >
                    {stat.value}
                  </div>
                  <div className="font-display uppercase tracking-widest text-gray-500" style={{ fontSize: '0.6rem' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboards — stack vertically on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Batting Average Leaders */}
              <div className="rounded-2xl p-4 sm:p-6 border" style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}>
                <h3 className="font-display font-bold uppercase tracking-widest text-sm mb-4 sm:mb-5 flex items-center gap-2" style={{ color: '#FFD700' }}>
                  ⚾ Batting Average
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {avgLeaders.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => s.player && navigate(`/player/${s.player.id}`)}
                      className="flex items-center gap-3 w-full group hover:opacity-80 transition-opacity"
                      style={{ minHeight: '44px' }}
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
              <div className="rounded-2xl p-4 sm:p-6 border" style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}>
                <h3 className="font-display font-bold uppercase tracking-widest text-sm mb-4 sm:mb-5 flex items-center gap-2" style={{ color: '#FFD700' }}>
                  💪 Home Runs
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {hrLeaders.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => s.player && navigate(`/player/${s.player.id}`)}
                      className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
                      style={{ minHeight: '44px' }}
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
              <div className="rounded-2xl p-4 sm:p-6 border" style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}>
                <h3 className="font-display font-bold uppercase tracking-widest text-sm mb-4 sm:mb-5 flex items-center gap-2" style={{ color: '#FFD700' }}>
                  🔥 Strikeouts (Pitching)
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {kLeaders.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => s.player && navigate(`/player/${s.player.id}`)}
                      className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
                      style={{ minHeight: '44px' }}
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
          className="py-8 sm:py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
                  Photo Gallery
                </h2>
              </div>
              <Link
                to="/gallery"
                className="font-display font-bold text-sm uppercase tracking-widest transition-colors"
                style={{ color: '#4ade80' }}
              >
                View All →
              </Link>
            </div>

            {/* 2 columns on mobile, 3 on sm, 4 on lg */}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-3 space-y-2 sm:space-y-3">
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
                    className="absolute inset-0 flex items-end p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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

      {/* ── SECTION 6: News & Highlights ─────────────────────────── */}
      {(() => {
        // Merge: DB articles first, then fallback to highlights.json news2026
        const dbArticles = articles.slice(0, 4)
        const jsonArticles = highlightsData.news2026 || []
        // Use DB if available, else fallback to JSON
        const displayArticles = dbArticles.length > 0
          ? dbArticles
          : jsonArticles.slice(0, 4).map(a => ({
              id: a.url,
              title: a.title,
              date: a.date,
              source: a.source,
              summary: a.summary,
              url: a.url,
              video_url: a.videoUrl || null,
            }))

        if (displayArticles.length === 0) return null

        return (
          <section
            className="py-8 sm:py-16 border-t"
            style={{ borderColor: 'rgba(0,102,51,0.3)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-5 sm:mb-8">
                <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
                  News &amp; Highlights
                </h2>
              </div>

              {/* Single column on mobile, multi-column on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {displayArticles.map((article) => {
                  const formattedDate = article.date
                    ? new Date(article.date + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })
                    : ''

                  // Extract YouTube video ID
                  const getYouTubeId = (url) => {
                    if (!url) return null
                    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
                    return m ? m[1] : null
                  }
                  const ytId = getYouTubeId(article.video_url)

                  return (
                    <a
                      key={article.id || article.url}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:border-yellow-400/40 group"
                      style={{ backgroundColor: '#111811', borderColor: '#1e2e1e', textDecoration: 'none' }}
                    >
                      {/* YouTube embed / thumbnail */}
                      {ytId && (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt={article.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#FFD700' }}
                            >
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="#0a0f0a">
                                <polygon points="6,3 17,10 6,17" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card body */}
                      <div className="flex flex-col flex-1 p-4 sm:p-5">
                        {/* Source + date */}
                        <div className="flex items-center gap-2 mb-3">
                          {article.source && (
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                              style={{ backgroundColor: 'rgba(0,102,51,0.4)', color: '#4ade80' }}
                            >
                              {article.source}
                            </span>
                          )}
                          {formattedDate && (
                            <span className="text-xs text-gray-500">{formattedDate}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3
                          className="font-display font-bold text-base leading-snug mb-3 group-hover:opacity-90 transition-opacity"
                          style={{ color: '#FFD700' }}
                        >
                          {article.title}
                        </h3>

                        {/* Summary snippet */}
                        {article.summary && (
                          <p className="text-gray-400 text-sm leading-relaxed flex-1 line-clamp-3">
                            {article.summary}
                          </p>
                        )}

                        {/* Read more */}
                        <div
                          className="mt-4 text-xs font-bold uppercase tracking-widest"
                          style={{ color: '#006633' }}
                        >
                          Read more →
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── SECTION 6b: HSBN Media Day Video ────────────────────── */}
      <section
        className="py-8 sm:py-16 border-t"
        style={{ borderColor: 'rgba(0,102,51,0.3)' }}
      >
        {/* Full-width embed on mobile — no extra horizontal padding on mobile */}
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
              <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
                🎥 HSBN Media Day 2026
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-5 sm:mb-8 ml-4">
              Coach Luebkert and team leaders discuss the upcoming season at the annual HSBN Press Conference
            </p>
          </div>

          {/* Full width on mobile (no px-4), max-w-3xl on larger screens */}
          <div className="sm:max-w-3xl sm:px-0 px-0">
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/sjLH1aXugBw"
                title="HSBN Media Day: Nova Titans 2026 Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '0',
                }}
                className="sm:rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Titans Legacy ──────────────────────────────── */}
      {(() => {
        const { programHistory, championships, mcQuaidQuote, seasonPreview } = highlightsData
        // Key championships to highlight as badges
        const featuredChamps = championships.filter(c =>
          [2005, 2004, 2023, 2017, 2002, 2000, 1991].includes(c.year)
        )

        return (
          <section
            className="py-8 sm:py-16 border-t"
            style={{
              borderColor: 'rgba(0,102,51,0.3)',
              background: 'linear-gradient(180deg, #0a0f0a 0%, #060c06 100%)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-6 sm:mb-10">
                <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
                  Titans Legacy
                </h2>
              </div>

              {/* Stack vertically on mobile, side-by-side on lg+ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                {/* Left: History */}
                <div>
                  <h3
                    className="font-display font-black uppercase text-2xl sm:text-3xl sm:text-4xl leading-tight mb-4 sm:mb-5"
                    style={{ color: '#ffffff' }}
                  >
                    Nearly 50 Years of{' '}
                    <span style={{ color: '#FFD700' }}>Excellence</span>
                  </h3>

                  {/* Coach McQuaid quote */}
                  <blockquote
                    className="rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-l-4"
                    style={{ backgroundColor: '#111811', borderLeftColor: '#FFD700' }}
                  >
                    <p className="text-gray-200 text-sm sm:text-base leading-relaxed italic mb-3">
                      &ldquo;{mcQuaidQuote}&rdquo;
                    </p>
                    <footer className="text-xs sm:text-sm font-bold uppercase tracking-widest" style={{ color: '#FFD700' }}>
                      — Coach Pat McQuaid
                      <span className="text-gray-500 font-normal normal-case tracking-normal ml-2">
                        FHSAA Hall of Fame · Nova HS '68 · Head Coach 1974–2024
                      </span>
                    </footer>
                  </blockquote>

                  {/* Season preview */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 sm:mb-6">
                    {seasonPreview}
                  </p>

                  {/* Current coach + facility */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div
                      className="rounded-xl p-3 sm:p-4 border"
                      style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
                    >
                      <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Head Coach</div>
                      <div className="font-display font-bold text-white text-sm sm:text-base">Brian Luebkert</div>
                      <div className="text-xs text-gray-500 mt-0.5">2026 Season</div>
                    </div>
                    <div
                      className="rounded-xl p-3 sm:p-4 border"
                      style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
                    >
                      <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Facility</div>
                      <div className="font-display font-bold text-white text-xs sm:text-sm leading-snug">
                        1,000-Seat Stadium
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Indoor cages · Digital scoreboard</div>
                    </div>
                  </div>
                </div>

                {/* Right: Championships + Alumni */}
                <div>
                  {/* Championship badges — smaller font, tighter wrap on mobile */}
                  <div className="mb-6 sm:mb-8">
                    <div className="text-xs uppercase tracking-widest text-gray-500 mb-3 sm:mb-4">Championship Titles</div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {featuredChamps.map((c) => (
                        <span
                          key={c.year}
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold font-display uppercase border"
                          style={{
                            fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                            letterSpacing: '0.04em',
                            backgroundColor: 'rgba(255,215,0,0.1)',
                            borderColor: 'rgba(255,215,0,0.4)',
                            color: '#FFD700',
                          }}
                        >
                          🏆 {c.year} · {c.title}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 sm:mt-3 text-xs text-gray-600">
                      + {championships.length - featuredChamps.length} more district & regional titles since 1985
                    </div>
                  </div>

                  {/* MLB Alumni */}
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gray-500 mb-3 sm:mb-4">MLB Alumni</div>
                    <div className="flex flex-col gap-2 sm:gap-3">
                      {[
                        { name: 'Michael Morse', detail: 'World Series Champion · MLB Outfielder/1B', emoji: '🌟' },
                        { name: 'Anthony Swarzak', detail: 'MLB Pitcher · 10 Seasons', emoji: '⚾' },
                      ].map((alum) => (
                        <div
                          key={alum.name}
                          className="flex items-center gap-3 rounded-xl p-3 sm:p-4 border"
                          style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
                        >
                          <span className="text-xl sm:text-2xl">{alum.emoji}</span>
                          <div>
                            <div className="font-display font-bold text-white text-sm">{alum.name}</div>
                            <div className="text-xs text-gray-500">{alum.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Location + district */}
                    <div className="mt-3 sm:mt-4 rounded-xl p-3 sm:p-4 border text-xs text-gray-500" style={{ borderColor: '#1e2e1e' }}>
                      <span className="text-gray-400">📍 {programHistory.location}</span>
                      <span className="mx-2 sm:mx-3 text-gray-700">·</span>
                      <span>{programHistory.district}</span>
                      <span className="mx-2 sm:mx-3 text-gray-700">·</span>
                      <span>{programHistory.schoolSize}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── SECTION 8: Senior Spotlight ───────────────────────────── */}
      {(() => {
        // Senior player jersey numbers (from highlights.json seniorIds)
        const seniorNumbers = [6, 11, 25, 15]
        const seniorMeta = {
          6:  { nick: 'Musa', display: 'Musa Adeoye' },
          11: { nick: 'JJ', display: 'Joseph "JJ" Cohen-Rodriguez' },
          25: { nick: 'Ricky', display: 'Ricky Relyea' },
          15: { nick: 'Brock', display: 'Brock Burns' },
        }

        // Match by jersey number
        const seniors = seniorNumbers
          .map((num) => {
            const player = players.find((p) => p.number === num || p.number === String(num))
            return { num, meta: seniorMeta[num], player }
          })
          .filter((s) => s.player || s.meta) // show even if player not in DB

        return (
          <section
            className="py-8 sm:py-16 border-t"
            style={{ borderColor: 'rgba(0,102,51,0.3)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
                  Senior Spotlight
                </h2>
              </div>
              <p className="font-display text-gray-400 text-xs sm:text-sm uppercase tracking-widest mb-5 sm:mb-8 ml-4">
                Class of 2026 — Honoring our Graduating Titans
              </p>

              {/* 2x2 on mobile, 4 across on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
                {seniors.map(({ num, meta, player }) => {
                  const name = player?.name || meta?.display || `#${num}`
                  const position = player?.positions || ''
                  const headshotUrl = player?.headshot_url || null
                  const initials = name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  const profileUrl = player ? `/player/${player.id}` : '#'

                  return (
                    <Link
                      key={num}
                      to={profileUrl}
                      className="flex flex-col items-center gap-2 sm:gap-3 group rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:-translate-y-1"
                      style={{
                        backgroundColor: '#111811',
                        borderColor: 'rgba(255,215,0,0.35)',
                        textDecoration: 'none',
                        minHeight: '44px',
                      }}
                    >
                      {/* Headshot with gold ring */}
                      <div
                        className="relative rounded-full p-0.5"
                        style={{ background: 'linear-gradient(135deg, #FFD700, #b8860b)' }}
                      >
                        {headshotUrl ? (
                          <img
                            src={headshotUrl}
                            alt={name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover object-top border-2"
                            style={{ borderColor: '#0a0f0a' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className="rounded-full items-center justify-center font-bold border-2"
                          style={{
                            width: 'clamp(64px, 16vw, 80px)',
                            height: 'clamp(64px, 16vw, 80px)',
                            fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                            backgroundColor: '#006633',
                            borderColor: '#0a0f0a',
                            color: '#FFD700',
                            display: headshotUrl ? 'none' : 'flex',
                          }}
                        >
                          {initials}
                        </div>

                        {/* Jersey number badge */}
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center border-2"
                          style={{ backgroundColor: '#FFD700', color: '#0a0f0a', borderColor: '#0a0f0a' }}
                        >
                          {num}
                        </div>
                      </div>

                      {/* Name */}
                      <div className="text-center">
                        <div
                          className="font-display font-bold text-xs sm:text-sm leading-tight group-hover:opacity-80 transition-opacity"
                          style={{ color: '#FFD700' }}
                        >
                          {meta?.display || name}
                        </div>
                        {position && (
                          <div
                            className="text-xs mt-1 px-2 py-0.5 rounded font-semibold"
                            style={{ color: '#4ade80', backgroundColor: 'rgba(0,102,51,0.3)' }}
                          >
                            {position}
                          </div>
                        )}
                      </div>

                      {/* Senior label */}
                      <div
                        className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                        style={{ color: '#FFD700', borderColor: 'rgba(255,215,0,0.4)', backgroundColor: 'rgba(255,215,0,0.08)' }}
                      >
                        Sr. · '26
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── SECTION 9: Schedule Strip ────────────────────────────── */}
      {games.length > 0 && (
        <section
          className="py-8 sm:py-16 border-t"
          style={{ borderColor: 'rgba(0,102,51,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 sm:h-8 rounded" style={{ backgroundColor: '#FFD700' }} />
                <h2 className="font-display font-black uppercase tracking-widest text-lg sm:text-xl" style={{ color: '#FFD700' }}>
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
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 sm:mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                Win
              </span>
              <span className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                Loss
              </span>
              <span className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFD700' }} />
                Upcoming / Rained Out
              </span>
              <span className="ml-auto font-display font-bold text-sm sm:text-base" style={{ color: '#FFD700' }}>
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
