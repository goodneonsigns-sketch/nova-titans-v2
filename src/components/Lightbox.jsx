import { useEffect, useState, useCallback, useRef } from 'react'

export default function Lightbox({ photos, initialIndex = 0, game, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef(null)

  const current = photos[index]

  const prev = useCallback(() => {
    setIndex(i => (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  const next = useCallback(() => {
    setIndex(i => (i + 1) % photos.length)
  }, [photos.length])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }
    touchStartX.current = null
  }

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-sm">
          {game && (
            <span className="text-gray-400">
              <span className="text-white font-semibold">vs {game.opponent}</span>
              {game.date && <span className="ml-2">{new Date(game.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm font-display font-bold">
            {index + 1} / {photos.length}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Prev button */}
        <button
          onClick={prev}
          className="absolute left-2 md:left-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 text-white text-xl transition-all hover:scale-110 border border-white/10"
        >
          ‹
        </button>

        {/* Image */}
        <img
          key={current.id || index}
          src={current.url || ''}
          alt={current.filename || `Photo ${index + 1}`}
          className="max-h-full max-w-full object-contain select-none"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
          draggable={false}
          onError={e => {
            e.target.style.display = 'none'
            e.target.parentElement.insertAdjacentHTML(
              'beforeend',
              '<div class="text-gray-600 text-center"><div class="text-4xl mb-2">📷</div><div>Image unavailable</div></div>'
            )
          }}
        />

        {/* Next button */}
        <button
          onClick={next}
          className="absolute right-2 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 text-white text-xl transition-all hover:scale-110 border border-white/10"
        >
          ›
        </button>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="border-t border-white/10 py-2 px-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {photos.map((photo, i) => (
              <button
                key={photo.id || i}
                onClick={() => setIndex(i)}
                className={`shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                  i === index ? 'border-yellow-400 scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={photo.url || ''}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={e => { e.target.parentElement.style.backgroundColor = '#1a2a1a' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
