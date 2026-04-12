export default function Schedule({ games }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getResultStyle = (result) => {
    if (!result) return { color: '#fbbf24', label: 'Upcoming', bg: 'rgba(251,191,36,0.1)' }
    if (result.includes('(W)')) return { color: '#4ade80', label: result, bg: 'rgba(74,222,128,0.1)' }
    if (result.includes('(L)')) return { color: '#f87171', label: result, bg: 'rgba(248,113,113,0.1)' }
    if (result.includes('Rained Out')) return { color: '#93c5fd', label: '☔ Rained Out', bg: 'rgba(147,197,253,0.1)' }
    return { color: '#9ca3af', label: result, bg: 'transparent' }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: '#0d180d' }}>
            <th className="px-4 py-3 text-left font-display font-bold uppercase tracking-wider text-xs text-gray-500">Date</th>
            <th className="px-4 py-3 text-left font-display font-bold uppercase tracking-wider text-xs text-gray-500">Opponent</th>
            <th className="px-4 py-3 text-left font-display font-bold uppercase tracking-wider text-xs text-gray-500 hidden sm:table-cell">Time</th>
            <th className="px-4 py-3 text-left font-display font-bold uppercase tracking-wider text-xs text-gray-500 hidden sm:table-cell">Location</th>
            <th className="px-4 py-3 text-left font-display font-bold uppercase tracking-wider text-xs text-gray-500">Result</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, i) => {
            const rs = getResultStyle(game.result)
            return (
              <tr
                key={game.id}
                className="border-t border-white/5 hover:bg-white/5 transition-colors"
                style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
              >
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap font-mono text-xs">
                  {formatDate(game.date)}
                </td>
                <td className="px-4 py-3 text-white font-medium">
                  {game.opponent}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell whitespace-nowrap">
                  {game.time || '—'}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${game.location === 'home' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/20 text-blue-400'}`}>
                    {game.location || 'home'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="text-xs px-2 py-1 rounded font-semibold font-display"
                    style={{ color: rs.color, backgroundColor: rs.bg }}
                  >
                    {rs.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
