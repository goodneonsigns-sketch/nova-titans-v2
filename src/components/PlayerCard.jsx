export default function PlayerCard({ player, onClick }) {
  const initials = player.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const classYear = player.grad_year
    ? player.grad_year === 2026
      ? 'SR'
      : player.grad_year === 2027
      ? 'JR'
      : player.grad_year === 2028
      ? 'SO'
      : player.grad_year === 2029
      ? 'FR'
      : `'${String(player.grad_year).slice(2)}`
    : ''

  return (
    <button
      onClick={() => onClick(player)}
      className="group text-left w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl"
    >
      <div className="card p-4 group-hover:border-yellow-500/50">
        <div className="flex items-center gap-4">
          {/* Headshot / Avatar */}
          <div className="relative shrink-0">
            {player.headshot_url ? (
              <img
                src={player.headshot_url}
                alt={player.name}
                className="w-16 h-16 rounded-full object-cover object-top border-2"
                style={{ borderColor: '#006633' }}
                onError={e => {
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
            {/* Number badge */}
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: '#FFD700', color: '#0a0f0a' }}
            >
              {player.number}
            </div>
          </div>

          {/* Player info */}
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-white text-base leading-tight truncate">
              {player.name}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {player.positions && (
                <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: 'rgba(0,102,51,0.4)', color: '#4ade80' }}>
                  {player.positions}
                </span>
              )}
              {classYear && (
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-white/10 text-gray-300">
                  {classYear}
                </span>
              )}
            </div>
            {(player.height || player.weight) && (
              <div className="text-xs text-gray-500 mt-1">
                {[player.height, player.weight ? `${player.weight} lbs` : ''].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
