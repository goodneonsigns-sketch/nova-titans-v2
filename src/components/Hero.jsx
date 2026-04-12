import { Link } from 'react-router-dom'
import { computeRecord } from '../lib/queries'

export default function Hero({ teamInfo, games, photos }) {
  const record = computeRecord(games)
  const wins = parseInt(record.split('-')[0]) || 0
  const losses = parseInt(record.split('-')[1]) || 0

  // Find the most recent game that has photos
  const gamesWithPhotos = games
    .filter(g => photos && photos.some(p => p.game_id === g.id))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const heroGame = gamesWithPhotos[0]
  const heroPhoto = heroGame
    ? photos.find(p => p.game_id === heroGame.id)
    : null

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      {/* Background photo */}
      {heroPhoto ? (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${heroPhoto.url})` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #0a0f0a 0%, #051a0e 40%, #0a1a0a 100%)' }}
        />
      )}

      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: heroPhoto
            ? 'linear-gradient(to bottom, rgba(10,15,10,0.55) 0%, rgba(10,15,10,0.75) 50%, rgba(10,15,10,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(0,102,51,0.2) 0%, transparent 50%)',
        }}
      />

      {/* Diagonal stripe pattern on top for texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #006633 0px,
            #006633 1px,
            transparent 1px,
            transparent 40px
          )`,
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
        {/* Season badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-semibold border"
          style={{ borderColor: '#006633', color: '#FFD700', backgroundColor: 'rgba(0,102,51,0.25)' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FFD700' }} />
          Spring 2026 · Nova High School, Davie FL
        </div>

        {/* Team name */}
        <h1
          className="font-display font-black uppercase tracking-widest mb-4 leading-none"
          style={{
            fontSize: 'clamp(3.5rem, 12vw, 8rem)',
            color: '#FFD700',
            textShadow: '0 0 40px rgba(255,215,0,0.5), 0 0 80px rgba(255,215,0,0.2)',
          }}
        >
          NOVA TITANS
        </h1>

        <p
          className="font-display font-bold uppercase tracking-[0.4em] mb-10"
          style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.6)' }}
        >
          Baseball
        </p>

        {/* Record display */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="text-center">
            <div
              className="font-display font-black leading-none"
              style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', color: '#FFD700' }}
            >
              {wins}
            </div>
            <div className="font-display text-sm uppercase tracking-widest mt-1" style={{ color: '#4ade80' }}>
              Wins
            </div>
          </div>
          <div
            className="font-display font-black text-gray-500"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          >
            —
          </div>
          <div className="text-center">
            <div
              className="font-display font-black leading-none text-gray-300"
              style={{ fontSize: 'clamp(4rem, 10vw, 7rem)' }}
            >
              {losses}
            </div>
            <div className="font-display text-sm uppercase tracking-widest mt-1 text-gray-500">
              Losses
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/roster"
            className="font-display font-bold uppercase tracking-widest px-8 py-3 rounded-lg text-sm transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: '#FFD700', color: '#0a0f0a' }}
          >
            View Roster
          </Link>
          <Link
            to="/gallery"
            className="font-display font-bold uppercase tracking-widest px-8 py-3 rounded-lg text-sm border-2 transition-all duration-200 hover:scale-105"
            style={{ borderColor: '#FFD700', color: '#FFD700', backgroundColor: 'transparent' }}
          >
            Game Gallery
          </Link>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0a0f0a)' }}
      />
    </section>
  )
}
