import StatsTable from '../components/StatsTable'

export default function StatsPage({ data }) {
  const { seasons, battingStats, pitchingStats, players } = data
  const currentSeason = seasons.find(s => s.is_current) || seasons[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">📊 Statistics</h1>
        {currentSeason && (
          <div className="text-gray-400 text-sm">{currentSeason.name}</div>
        )}
      </div>

      {battingStats.length === 0 && pitchingStats.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-lg mb-2">No stats yet</p>
          <p className="text-sm">Run <code className="bg-white/5 px-2 py-0.5 rounded">python3 scripts/migrate-data.py</code> to import player statistics.</p>
        </div>
      ) : (
        <StatsTable
          battingStats={battingStats}
          pitchingStats={pitchingStats}
          players={players}
          season={currentSeason}
        />
      )}
    </div>
  )
}
