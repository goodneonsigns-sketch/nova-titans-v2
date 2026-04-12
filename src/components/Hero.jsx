import { computeRecord } from '../lib/queries'

export default function Hero({ teamInfo, games }) {
  const record = computeRecord(games)
  const wins = parseInt(record.split('-')[0]) || 0
  const losses = parseInt(record.split('-')[1]) || 0

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0f0a 0%, #051a0e 40%, #0a1a0a 100%)',
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #006633 0px,
            #006633 1px,
            transparent 1px,
            transparent 40px
          )`,
        }}
      />

      {/* Green glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] -translate-y-1/2 opacity-20"
        style={{
          background: 'radial-gradient(ellipse, #006633 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Season badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-semibold border" style={{ backgroundColor: '#006633/20', borderColor: '#006633', color: '#FFD700', backgroundColor: 'rgba(0,102,51,0.2)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FFD700' }}></span>
          Spring 2026 Season
        </div>

        {/* Team name */}
        <h1 className="font-display font-black uppercase tracking-widest mb-2" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: '#FFD700', textShadow: '0 0 60px rgba(255,215,0,0.3)' }}>
          Nova Titans
        </h1>
        <h2 className="font-display font-bold uppercase tracking-[0.3em] text-gray-400 mb-8" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
          Baseball
        </h2>

        {/* Record display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="font-display font-black text-5xl md:text-7xl" style={{ color: '#FFD700' }}>{wins}</div>
            <div className="font-display text-sm uppercase tracking-widest text-green-400 mt-1">Wins</div>
          </div>
          <div className="font-display font-black text-4xl text-gray-600">-</div>
          <div className="text-center">
            <div className="font-display font-black text-5xl md:text-7xl text-gray-300">{losses}</div>
            <div className="font-display text-sm uppercase tracking-widest text-gray-500 mt-1">Losses</div>
          </div>
        </div>

        {/* Team info chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5">
            📍 Nova High School, Davie FL
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5">
            🏆 6A District 15
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5">
            ⚾ {games.length} Games Played
          </span>
        </div>
      </div>
    </section>
  )
}
