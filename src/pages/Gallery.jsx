import { useState } from 'react'
import GameCard from '../components/GameCard'
import Lightbox from '../components/Lightbox'

export default function Gallery({ data }) {
  const { games, photos } = data
  const [lightbox, setLightbox] = useState(null)

  const getGamePhotos = (gameId) => photos.filter(p => p.game_id === gameId)
  const gamesWithPhotos = games.filter(g => getGamePhotos(g.id).length > 0)
  const totalPhotos = photos.length

  const openLightbox = (game, gamePhotos, index) => {
    setLightbox({ game, photos: gamePhotos, index })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">📷 Photo Gallery</h1>
        <div className="text-gray-500 text-sm">{totalPhotos} photos across {gamesWithPhotos.length} games</div>
      </div>

      {gamesWithPhotos.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-lg mb-2">No photos yet</p>
          <p className="text-sm">Run <code className="bg-white/5 px-2 py-0.5 rounded">python3 scripts/migrate-data.py</code> to import game photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gamesWithPhotos.map(game => (
            <GameCard
              key={game.id}
              game={game}
              photos={getGamePhotos(game.id)}
              onPhotoClick={openLightbox}
            />
          ))}
        </div>
      )}

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
