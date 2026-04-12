import { useEffect } from 'react'

export default function PlayerModal({ player, battingStats, pitchingStats, currentSeason, onClose }) {
  const batting = battingStats?.find(s => s.player_id === player?.id && s.season_id === currentSeason?.id)
  const pitching = pitchingStats?.find(s => s.player_id === player?.id && s.season_id === currentSeason?.id)

  const initials = player?.name
    ? player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const hasPitching = pitching && (pitching.app > 0 || parseFloat(pitching.ip) > 0)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!player) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ backgroundColor: '#111811', borderColor: '#1e2e1e' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 pb-0" style={{ background: 'linear-gradient(135deg, rgba(0,102,51,0.3) 0%, transparent 60%)' }}>
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {player.headshot_url ? (
                <img
                  src={player.headshot_url}
                  alt={player.name}
                  className="w-20 h-20 rounded-full object-cover object-top border-2"
                  style={{ borderColor: '#006633' }}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className="w-20 h-20 rounded-full items-center justify-center text-2xl font-bold border-2"
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
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center"
                style={{ backgroundColor: '#FFD700', color: '#0a0f0a' }}
              >
                #{player.number}
              </div>
            </div>

            {/* Name & info */}
            <div>
              <h2 className="font-display font-black text-2xl text-white">{player.name}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {player.positions && (
                  <span className="text-sm px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: 'rgba(0,102,51,0.4)', color: '#4ade80' }}>
                    {player.positions}
                  </span>
                )}
                {player.grad_year && (
                  <span className="text-sm px-2 py-0.5 rounded bg-white/10 text-gray-300">
                    Class of {player.grad_year}
                  </span>
                )}
              </div>
              {(player.height || player.weight) && (
                <div className="text-sm text-gray-400 mt-1">
                  {[player.height, player.weight ? `${player.weight} lbs` : ''].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 pt-4 space-y-6">
          {/* Batting Stats */}
          {batting ? (
            <div>
              <h3 className="font-display font-bold text-yellow-400 uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                <span>⚾</span> Batting Stats
              </h3>
              {/* Key averages */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'AVG', value: batting.ba || '.000' },
                  { label: 'OBP', value: batting.obp || '.000' },
                  { label: 'SLG', value: batting.slg || '.000' },
                  { label: 'OPS', value: batting.ops || '.000' },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0,102,51,0.2)' }}>
                    <div className="font-display font-bold text-white text-lg">{stat.value}</div>
                    <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
              {/* Raw stats */}
              <div className="grid grid-cols-6 gap-1">
                {[
                  { label: 'GP', value: batting.gp },
                  { label: 'AB', value: batting.ab },
                  { label: 'R', value: batting.r },
                  { label: 'H', value: batting.h },
                  { label: 'RBI', value: batting.rbi },
                  { label: '2B', value: batting.doubles },
                  { label: '3B', value: batting.triples },
                  { label: 'HR', value: batting.hr },
                  { label: 'BB', value: batting.bb },
                  { label: 'K', value: batting.k },
                  { label: 'SB', value: batting.sb },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-1.5 rounded bg-white/5">
                    <div className="font-bold text-white text-sm">{stat.value ?? 0}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600 text-sm">No batting stats available</div>
          )}

          {/* Pitching Stats */}
          {hasPitching && (
            <div>
              <h3 className="font-display font-bold text-yellow-400 uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                <span>🔥</span> Pitching Stats
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'ERA', value: pitching.era || '0.00' },
                  { label: 'WHIP', value: pitching.whip || '0.00' },
                  { label: 'W-L', value: `${pitching.w}-${pitching.l}` },
                  { label: 'SVS', value: pitching.sv },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0,102,51,0.2)' }}>
                    <div className="font-display font-bold text-white text-lg">{stat.value}</div>
                    <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { label: 'APP', value: pitching.app },
                  { label: 'IP', value: pitching.ip },
                  { label: 'H', value: pitching.h },
                  { label: 'R', value: pitching.r },
                  { label: 'ER', value: pitching.er },
                  { label: 'BB', value: pitching.bb },
                  { label: 'K', value: pitching.k },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-1.5 rounded bg-white/5">
                    <div className="font-bold text-white text-sm">{stat.value ?? 0}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
