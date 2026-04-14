import { useState, useEffect, useRef } from 'react'
import { PRINT_SIZES } from '../lib/prints'
import { useAuth } from '../contexts/AuthContext'

export default function PrintOrderModal({ photo, game, onClose }) {
  const { user } = useAuth()
  const [selectedSize, setSelectedSize] = useState(PRINT_SIZES[1]) // Default: 8x10
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const backdropRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose()
  }

  const gameInfo = game
    ? `vs ${game.opponent}${game.date ? ' · ' + new Date(game.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}`
    : ''

  const handleOrderPrint = async () => {
    setError('')
    setLoading(true)
    try {
      const resp = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          photoUrl: photo.url,
          gameInfo,
          printSize: selectedSize,
          customerEmail: user?.email || undefined,
        }),
      })
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.error || `Server error: ${resp.status}`)
      }
      const { url } = await resp.json()
      window.location.href = url
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-yellow-900/40 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#0f1a0f' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-900/30">
          <div>
            <h2 className="font-display font-bold text-white text-xl tracking-wide uppercase">
              🖨️ Order a Print
            </h2>
            {gameInfo && (
              <p className="text-xs text-gray-500 mt-0.5">{gameInfo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body — two-column on desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row gap-0">
          {/* Left: Photo preview */}
          <div className="md:w-56 flex-shrink-0 p-4 flex flex-col items-center gap-3 border-b md:border-b-0 md:border-r border-green-900/20">
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-black/40">
              {photo.url ? (
                <img
                  src={photo.url}
                  alt={photo.filename || 'Selected photo'}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-600 text-3xl">📷</div>'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-3xl">📷</div>
              )}
            </div>
            {photo.filename && (
              <p className="text-xs text-gray-600 text-center break-all">{photo.filename}</p>
            )}
            <div
              className="w-full text-center py-2 px-3 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: 'rgba(0,102,51,0.15)', color: '#4ade80' }}
            >
              ✓ Professional quality print
            </div>
          </div>

          {/* Right: Size selector */}
          <div className="flex-1 p-5 flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-display font-bold uppercase tracking-widest text-gray-400 mb-3">
                Select Print Size
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRINT_SIZES.map(size => {
                  const isSelected = selectedSize.id === size.id
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: isSelected ? '#FFD700' : 'rgba(0,102,51,0.25)',
                        backgroundColor: isSelected ? 'rgba(255,215,0,0.06)' : 'rgba(0,0,0,0.3)',
                        minHeight: '44px',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-display font-bold text-sm leading-tight"
                          style={{ color: isSelected ? '#FFD700' : 'white' }}
                        >
                          {size.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{size.description}</div>
                      </div>
                      <div
                        className="font-display font-bold text-lg shrink-0"
                        style={{ color: isSelected ? '#FFD700' : '#9ca3af' }}
                      >
                        {size.priceDisplay}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* What's included */}
            <div
              className="rounded-lg p-3 text-xs text-gray-500 space-y-1"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <p className="text-gray-400 font-semibold mb-1">What's included:</p>
              <p>✓ High-resolution photo print</p>
              <p>✓ Professional print lab quality</p>
              <p>✓ Ships within 3–5 business days</p>
              <p>✓ Secure checkout via Stripe</p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-red-300 text-sm bg-red-900/20 border border-red-800/40">
                {error}
              </div>
            )}

            {/* Order button */}
            <button
              onClick={handleOrderPrint}
              disabled={loading}
              className="w-full py-4 rounded-xl font-display font-bold uppercase tracking-wider text-base transition-all disabled:opacity-50 hover:brightness-110"
              style={{
                backgroundColor: '#FFD700',
                color: '#0a0f0a',
                minHeight: '52px',
              }}
            >
              {loading ? 'Redirecting to checkout...' : `Order Print — ${selectedSize.priceDisplay}`}
            </button>
            <p className="text-center text-gray-600 text-xs">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
