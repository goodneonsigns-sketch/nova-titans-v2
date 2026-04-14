import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { trackDownload } from '../lib/auth'
import AuthModal from './AuthModal'
import PrintOrderModal from './PrintOrderModal'

export default function Lightbox({ photos, initialIndex = 0, game, onClose }) {
  const { user } = useAuth()
  const [index, setIndex] = useState(initialIndex)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
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
      if (e.key === 'Escape') {
        // If sub-modals are open, let them handle Escape
        if (!showAuthModal && !showPrintModal) onClose()
      }
      if (e.key === 'ArrowLeft' && !showAuthModal && !showPrintModal) prev()
      if (e.key === 'ArrowRight' && !showAuthModal && !showPrintModal) next()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next, showAuthModal, showPrintModal])

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

  const handleDownload = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setDownloadLoading(true)
    try {
      await trackDownload(current.id)
      const a = document.createElement('a')
      a.href = current.url
      a.download = current.filename || 'nova-titans-photo.jpg'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloadLoading(false)
    }
  }

  if (!current) return null

  return (
    <>
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
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {/* Layout: [prev btn] [image] [next btn] — buttons never overlap image */}
          <button
            onClick={prev}
            className="shrink-0 w-10 h-10 md:w-12 md:h-12 mx-1 md:mx-3 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 text-white text-xl transition-all hover:scale-110 border border-white/10"
            style={{ minWidth: '40px' }}
          >
            ‹
          </button>

          {/* Image — takes remaining space */}
          <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <img
              key={current.id || index}
              src={current.url || ''}
              alt={current.filename || `Photo ${index + 1}`}
              className="max-h-full max-w-full object-contain select-none"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
              draggable={false}
              onError={e => {
                e.target.style.display = 'none'
                e.target.parentElement.insertAdjacentHTML(
                  'beforeend',
                  '<div class="text-gray-600 text-center"><div class="text-4xl mb-2">📷</div><div>Image unavailable</div></div>'
                )
              }}
            />
          </div>

          <button
            onClick={next}
            className="shrink-0 w-10 h-10 md:w-12 md:h-12 mx-1 md:mx-3 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 text-white text-xl transition-all hover:scale-110 border border-white/10"
            style={{ minWidth: '40px' }}
          >
            ›
          </button>
        </div>

        {/* ─── ACTION BUTTONS ─── */}
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-white/10">
          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloadLoading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold uppercase tracking-wider text-sm transition-all hover:brightness-110 disabled:opacity-60"
            style={{
              backgroundColor: '#006633',
              color: '#fff',
              minHeight: '48px',
              minWidth: '140px',
            }}
          >
            {downloadLoading ? (
              <>⏳ Downloading...</>
            ) : (
              <>⬇️ {user ? 'Download' : 'Sign In to Download'}</>
            )}
          </button>

          {/* Buy Print button */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold uppercase tracking-wider text-sm transition-all hover:brightness-110"
            style={{
              backgroundColor: '#FFD700',
              color: '#0a0f0a',
              minHeight: '48px',
              minWidth: '140px',
            }}
          >
            🖨️ Buy Print
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

      {/* Auth Modal (for download gating) */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          message="Sign in to download photos for free!"
          initialTab="signin"
        />
      )}

      {/* Print Order Modal */}
      {showPrintModal && (
        <PrintOrderModal
          photo={current}
          game={game}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </>
  )
}
