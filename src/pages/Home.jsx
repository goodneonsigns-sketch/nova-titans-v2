import { useState } from 'react'
import Hero from '../components/Hero'
import PlayerCard from '../components/PlayerCard'
import PlayerModal from '../components/PlayerModal'
import GameCard from '../components/GameCard'
import Lightbox from '../components/Lightbox'
import Schedule from '../components/Schedule'
import StatsTable from '../components/StatsTable'
import { getBattingLeaders, getPitchingLeaders } from '../lib/queries'

export default function Home({ data }) {
  const { teamInfo, seasons, games, players, battingStats, pitchingStats, photos } = data

  const currentSeason = seasons.find(s => s.is_current) || seasons[0]

  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [lightbox, setLightbox] = useState(null) // { game, photos, index }
  const [showAllGames, setShowAllGames] = useState(false)

  // Group players by grad year
  const playersByYear = players.reduce((acc, p) => {
    const yr = p.grad_year || 'Unknown'
    if (!acc[yr]) acc[yr] = []
    acc[yr].push(p)
    return acc
  }, {})
  const sortedYears = Object.keys(playersByYear).sort((a, b) => a - b)

  // Get photos for each game
  const getGamePhotos = (gameId) => photos.filter(p => p.game_id === gameId)

  // Games with photos (for gallery section)
  const gamesWithPhotos = games.filter(g => getGamePhotos(g.id).length > 0)
  const displayedGames = showAllGames ? gamesWithPhotos : gamesWithPhotos.slice(0, 6)

  // Stat leaders
  const battingLeaders = getBattingLeaders(battingStats, players, 'ba', 5)
  const hrLeaders = getBattingLeaders(battingStats, players, 'hr', 3)
  const pitchingLeaders = getPitchingLeaders(pitchingStats, players, 'k', 5)

  const openLightbox = (game, gamePhotos, index) => {
    setLightbox({ game, photos: gamePhotos, index })
  }

  return (
    <div>
      {/* Hero */}
      <Hero teamInfo={teamInfo} games={games} />

      {/* ── SCHEDULE ────────────────────────────────────── */}
      <section id="schedule" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title">📅 Schedule & Results</h2>
        <Schedule games={games} />
      </section>

      {/* ── ROSTER ──────────────────────────────────────── */}
      <section id="roster" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <h2 className="section-title">👥 Roster</h2>
        {players.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <div className="text-4xl mb-3">⚾</div>
            <p>Roster data not yet loaded. Run the migration script to populate players.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedYears.map(year => (
              <div key={year}>
                <h3 className="font-display font-bold text-green-400 uppercase tracking-widest text-sm mb-4">
                  Class of {year}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {playersByYear[year].map(player => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      onClick={setSelectedPlayer}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── STATS LEADERS ───────────────────────────────── */}
      {(battingStats.length > 0 || pitchingStats.length > 0) && (
        <section id="leaders" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <h2 className="section-title">📊 Stats Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Batting Average Leaders */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-yellow-400 uppercase tracking-wider text-sm mb-4">Batting Average</h3>
              <div className="space-y-3">
                {battingLeaders.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.1)', color: i === 0 ? '#0a0f0a' : '#9ca3af' }}>
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-white text-sm font-medium">{s.player?.name || 'Unknown'}</div>
                        <div className="text-gray-600 text-xs">{s.gp} GP · {s.ab} AB</div>
                      </div>
                    </div>
                    <span className="font-display font-bold text-yellow-400">{s.ba}</span>
                  </div>
                ))}
                {battingLeaders.length === 0 && <p className="text-gray-600 text-sm text-center py-2">No data yet</p>}
              </div>
            </div>

            {/* HR Leaders */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-yellow-400 uppercase tracking-wider text-sm mb-4">Home Runs</h3>
              <div className="space-y-3">
                {hrLeaders.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.1)', color: i === 0 ? '#0a0f0a' : '#9ca3af' }}>
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-white text-sm font-medium">{s.player?.name || 'Unknown'}</div>
                        <div className="text-gray-600 text-xs">{s.rbi} RBI · {s.h} H</div>
                      </div>
                    </div>
                    <span className="font-display font-bold text-2xl text-yellow-400">{s.hr}</span>
                  </div>
                ))}
                {hrLeaders.length === 0 && <p className="text-gray-600 text-sm text-center py-2">No data yet</p>}
              </div>
            </div>

            {/* Strikeout Leaders */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-yellow-400 uppercase tracking-wider text-sm mb-4">Strikeouts (Pitching)</h3>
              <div className="space-y-3">
                {pitchingLeaders.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.1)', color: i === 0 ? '#0a0f0a' : '#9ca3af' }}>
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-white text-sm font-medium">{s.player?.name || 'Unknown'}</div>
                        <div className="text-gray-600 text-xs">{s.app} APP · {s.ip} IP</div>
                      </div>
                    </div>
                    <span className="font-display font-bold text-2xl text-yellow-400">{s.k}</span>
                  </div>
                ))}
                {pitchingLeaders.length === 0 && <p className="text-gray-600 text-sm text-center py-2">No data yet</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FULL STATS TABLE ────────────────────────────── */}
      {(battingStats.length > 0 || pitchingStats.length > 0) && (
        <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <h2 className="section-title">📋 Full Stats</h2>
          <StatsTable
            battingStats={battingStats}
            pitchingStats={pitchingStats}
            players={players}
            season={currentSeason}
          />
        </section>
      )}

      {/* ── GAME GALLERY ────────────────────────────────── */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">📷 Game Gallery</h2>
          {gamesWithPhotos.length > 6 && (
            <button
              onClick={() => setShowAllGames(!showAllGames)}
              className="text-sm font-semibold transition-colors"
              style={{ color: '#4ade80' }}
            >
              {showAllGames ? 'Show Less' : `View All ${gamesWithPhotos.length} Games`}
            </button>
          )}
        </div>

        {gamesWithPhotos.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <div className="text-4xl mb-3">📷</div>
            <p>No game photos yet. Run the migration script to import photos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                photos={getGamePhotos(game.id)}
                onPhotoClick={openLightbox}
              />
            ))}
          </div>
        )}
      </section>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          battingStats={battingStats}
          pitchingStats={pitchingStats}
          currentSeason={currentSeason}
          onClose={() => setSelectedPlayer(null)}
        />
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
