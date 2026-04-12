import { useState } from 'react'
import PlayerCard from '../components/PlayerCard'
import PlayerModal from '../components/PlayerModal'

export default function Roster({ data }) {
  const { seasons, players, battingStats, pitchingStats } = data
  const currentSeason = seasons.find(s => s.is_current) || seasons[0]
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? players.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        (p.positions || '').toLowerCase().includes(filter.toLowerCase())
      )
    : players

  const byYear = filtered.reduce((acc, p) => {
    const yr = p.grad_year || 'Unknown'
    if (!acc[yr]) acc[yr] = []
    acc[yr].push(p)
    return acc
  }, {})
  const sortedYears = Object.keys(byYear).sort((a, b) => a - b)

  const yearLabel = (yr) => {
    const map = { 2026: 'Senior', 2027: 'Junior', 2028: 'Sophomore', 2029: 'Freshman' }
    return map[yr] || `Class of ${yr}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">👥 Full Roster</h1>
        <div className="text-gray-500 text-sm">{players.length} players</div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by name or position..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
      </div>

      {players.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="text-5xl mb-4">⚾</div>
          <p className="text-lg mb-2">Roster not yet loaded</p>
          <p className="text-sm">Run <code className="bg-white/5 px-2 py-0.5 rounded">python3 scripts/migrate-data.py</code> to import player data.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedYears.map(year => (
            <div key={year}>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="font-display font-bold text-green-400 uppercase tracking-widest text-sm">
                  {yearLabel(year)}
                </h3>
                <div className="flex-1 h-px bg-green-900/30"></div>
                <span className="text-gray-600 text-xs">{byYear[year].length} players</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {byYear[year].map(player => (
                  <PlayerCard key={player.id} player={player} onClick={setSelectedPlayer} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          battingStats={battingStats}
          pitchingStats={pitchingStats}
          currentSeason={currentSeason}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}
