export default function GameCard({ game, photos, onPhotoClick }) {
  const isWin = game.result?.includes('(W)')
  const isLoss = game.result?.includes('(L)')
  const isRainout = game.result?.includes('Rained Out')
  const isUpcoming = !game.result

  const resultColor = isWin
    ? '#4ade80'
    : isLoss
    ? '#f87171'
    : isRainout
    ? '#93c5fd'
    : '#fbbf24'

  const resultBg = isWin
    ? 'rgba(74,222,128,0.15)'
    : isLoss
    ? 'rgba(248,113,113,0.15)'
    : isRainout
    ? 'rgba(147,197,253,0.15)'
    : 'rgba(251,191,36,0.15)'

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="card">
      {/* Photo Thumbnails */}
      {photos && photos.length > 0 && (
        <div
          className="grid gap-0.5 cursor-pointer overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${Math.min(photos.length, 4)}, 1fr)`,
            maxHeight: '160px',
          }}
          onClick={() => onPhotoClick && onPhotoClick(game, photos, 0)}
        >
          {photos.slice(0, 4).map((photo, idx) => (
            <div key={photo.id || idx} className="relative overflow-hidden bg-gray-900" style={{ paddingBottom: '75%' }}>
              <img
                src={photo.url || photo.thumb_url || ''}
                alt={`Game photo ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.backgroundColor = '#1a2a1a'
                }}
              />
              {idx === 3 && photos.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="font-display font-bold text-white text-xl">+{photos.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No photos placeholder */}
      {(!photos || photos.length === 0) && (
        <div
          className="h-24 flex items-center justify-center cursor-default"
          style={{ backgroundColor: '#0d1a0d' }}
        >
          <span className="text-3xl opacity-20">⚾</span>
        </div>
      )}

      {/* Game Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-white text-base leading-tight truncate">
              vs {game.opponent}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span>{formatDate(game.date)}</span>
              {game.time && <span>· {game.time}</span>}
              {game.location && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-gray-400 capitalize">
                  {game.location}
                </span>
              )}
            </div>
          </div>

          {/* Result badge */}
          {game.result && (
            <div
              className="shrink-0 px-2.5 py-1 rounded-md text-sm font-bold font-display"
              style={{ color: resultColor, backgroundColor: resultBg }}
            >
              {isRainout ? '☔' : isWin ? 'W' : isLoss ? 'L' : game.result}
              {!isRainout && game.result && (
                <span className="ml-1 font-normal text-xs">{game.result.replace(' (W)', '').replace(' (L)', '')}</span>
              )}
            </div>
          )}

          {isUpcoming && (
            <div className="shrink-0 px-2.5 py-1 rounded-md text-sm font-bold font-display" style={{ color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.15)' }}>
              UPCOMING
            </div>
          )}
        </div>

        {/* Photo count */}
        {photos && photos.length > 0 && (
          <button
            onClick={() => onPhotoClick && onPhotoClick(game, photos, 0)}
            className="mt-3 text-xs flex items-center gap-1.5 transition-colors"
            style={{ color: '#4ade80' }}
          >
            <span>📷</span>
            <span>{photos.length} photos — click to view</span>
          </button>
        )}
      </div>
    </div>
  )
}
