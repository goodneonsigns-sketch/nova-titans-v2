import { useState, useEffect } from 'react'
import GameCard from '../components/GameCard'
import Lightbox from '../components/Lightbox'
import { fetchPhotos } from '../lib/queries'

export default function Gallery({ data }) {
  const { games } = data
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    fetchPhotos().then(p => { setPhotos(p); setLoading(false) })
  }, [])

  const getGamePhotos = (gameId) => photos.filter(p => p.game_id === gameId)
  const gamesWithPhotos = games.filter(g => getGamePhotos(g.id).length > 0)
  const totalPhotos = photos.length

  const openLightbox = (game, gamePhotos, index) => {
    setLightbox({ game, photos: gamePhotos, index })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="font-display font-black uppercase tracking-widest text-xl sm:text-2xl" style={{ color: '#FFD700' }}>
          📷 Photo Gallery
        </h1>
        <div className="text-gray-500 text-xs sm:text-sm">{totalPhotos} photos · {gamesWithPhotos.length} games</div>
      </div>

      {gamesWithPhotos.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-gray-600">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-lg mb-2">No photos yet</p>
          <p className="text-sm">Run <code className="bg-white/5 px-2 py-0.5 rounded">python3 scripts/migrate-data.py</code> to import game photos.</p>
        </div>
      ) : (
        /* Single column on mobile, 2 on sm, 3 on lg */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
