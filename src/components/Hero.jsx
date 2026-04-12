import { Link } from 'react-router-dom'
import { computeRecord } from '../lib/queries'

const HERO_IMAGE_URL = 'https://hxrucwregtzirnesvhrj.supabase.co/storage/v1/object/public/game-photos/game-9/DSC07043.JPG'

export default function Hero({ teamInfo, games, photos }) {
  const record = computeRecord(games)
  const wins = parseInt(record.split('-')[0]) || 0
  const losses = parseInt(record.split('-')[1]) || 0

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: 'min(100vh, 700px)', display: 'flex', alignItems: 'center' }}
    >
      {/* Background photo — specific hero image (mid-swing batting shot) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HERO_IMAGE_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Strong dark overlay so gold text remains readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,15,10,0.65) 0%, rgba(10,15,10,0.80) 50%, rgba(10,15,10,0.97) 100%)',
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

      {/* Mobile: py-10, desktop: py-24 */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24 flex flex-col items-center text-center">
        {/* Season badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-5 sm:mb-8 text-xs sm:text-sm font-semibold border"
          style={{ borderColor: '#006633', color: '#FFD700', backgroundColor: 'rgba(0,102,51,0.25)' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FFD700' }} />
          Spring 2026 · Nova High School, Davie FL
        </div>

        {/* Team name — clamp handles both mobile and desktop naturally */}
        <h1
          className="font-display font-black uppercase tracking-widest mb-3 sm:mb-4 leading-none"
          style={{
            fontSize: 'clamp(2.5rem, 10vw, 8rem)',
            color: '#FFD700',
            textShadow: '0 0 40px rgba(255,215,0,0.5), 0 0 80px rgba(255,215,0,0.2)',
          }}
        >
          NOVA TITANS
        </h1>

        <p
          className="font-display font-bold uppercase tracking-[0.4em] mb-6 sm:mb-10"
          style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.6)' }}
        >
          Baseball
        </p>

        {/* Record display — smaller on mobile */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="text-center">
            <div
              className="font-display font-black leading-none"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', color: '#FFD700' }}
            >
              {wins}
            </div>
            <div className="font-display text-xs sm:text-sm uppercase tracking-widest mt-1" style={{ color: '#4ade80' }}>
              Wins
            </div>
          </div>
          <div
            className="font-display font-black text-gray-500"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 4rem)' }}
          >
            —
          </div>
          <div className="text-center">
            <div
              className="font-display font-black leading-none text-gray-300"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}
            >
              {losses}
            </div>
            <div className="font-display text-xs sm:text-sm uppercase tracking-widest mt-1 text-gray-500">
              Losses
            </div>
          </div>
        </div>

        {/* CTA Buttons — stack vertically full-width on mobile, inline on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 justify-center">
          <Link
            to="/roster"
            className="font-display font-bold uppercase tracking-widest px-8 py-3.5 sm:py-3 rounded-lg text-sm transition-all duration-200 hover:scale-105 text-center"
            style={{ backgroundColor: '#FFD700', color: '#0a0f0a', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            View Roster
          </Link>
          <Link
            to="/gallery"
            className="font-display font-bold uppercase tracking-widest px-8 py-3.5 sm:py-3 rounded-lg text-sm border-2 transition-all duration-200 hover:scale-105 text-center"
            style={{ borderColor: '#FFD700', color: '#FFD700', backgroundColor: 'transparent', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
