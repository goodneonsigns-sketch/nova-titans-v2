import Schedule from '../components/Schedule'
import { computeRecord } from '../lib/queries'

export default function SchedulePage({ data }) {
  const { games } = data
  const record = computeRecord(games)

  const wins = games.filter(g => g.result?.includes('(W)')).length
  const losses = games.filter(g => g.result?.includes('(L)')).length
  const upcoming = games.filter(g => !g.result).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">📅 Schedule</h1>
        <div className="font-display font-bold text-2xl" style={{ color: '#FFD700' }}>
          {record}
        </div>
      </div>

      {/* Record summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Wins', value: wins, color: '#4ade80' },
          { label: 'Losses', value: losses, color: '#f87171' },
          { label: 'Upcoming', value: upcoming, color: '#fbbf24' },
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <div className="font-display font-black text-3xl" style={{ color: stat.color }}>{stat.value}</div>
            <div className="font-display text-xs uppercase tracking-wider text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <Schedule games={games} />
    </div>
  )
}
