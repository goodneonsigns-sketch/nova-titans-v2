import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/roster', label: 'Roster' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/stats', label: 'Stats' },
]

const bottomTabs = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/roster', label: 'Roster', icon: '👥' },
  { href: '/schedule', label: 'Schedule', icon: '📅' },
  { href: '/gallery', label: 'Gallery', icon: '📷' },
  { href: '/stats', label: 'Stats', icon: '📊' },
]

const affiliations = [
  { label: 'FHSAA', full: 'Florida High School Athletic Association', href: 'https://fhsaa.com/' },
  { label: 'HSBN', full: 'High School Baseball Network', href: 'https://www.browardhighschoolbaseball.com/' },
  { label: 'MaxPreps', full: 'CBS Sports MaxPreps', href: 'https://www.maxpreps.com/fl/davie/nova-titans/baseball/' },
  { label: 'BCPS', full: 'Broward County Public Schools', href: 'https://www.browardschools.com/' },
  { label: 'GameChanger', full: 'GameChanger', href: 'https://gc.com' },
]

const paymentMethods = ['Visa', 'Mastercard', 'Amex', 'Discover', 'Apple Pay', 'Google Pay']

function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account'
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-green-900/20"
        style={{ minHeight: '44px' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: '#006633', color: '#FFD700' }}
        >
          {initials || '?'}
        </div>
        <span className="text-sm text-gray-300 hidden sm:block max-w-[120px] truncate">{displayName}</span>
        <span className="text-gray-500 text-xs">▾</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-green-900/40 shadow-xl z-50 overflow-hidden py-1"
          style={{ backgroundColor: '#0f1a0f' }}
        >
          <div className="px-4 py-2 border-b border-green-900/20">
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link
            to="/order-success"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-green-900/20 transition-colors"
          >
            📦 My Orders
          </Link>
          <button
            onClick={() => { setOpen(false); onSignOut() }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-red-300 hover:bg-red-900/10 transition-colors text-left"
          >
            🚪 Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const location = useLocation()
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0f0a' }}>
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-green-900/50" style={{ backgroundColor: 'rgba(10,15,10,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: '#006633', color: '#FFD700' }}>
                NT
              </div>
              {/* Show full logo text on desktop; mobile only shows NT badge */}
              <div className="hidden sm:block">
                <div className="font-display font-bold text-white text-lg leading-tight tracking-wide">NOVA TITANS</div>
                <div className="text-xs leading-tight" style={{ color: '#FFD700' }}>BASEBALL</div>
              </div>
            </Link>

            {/* Desktop Nav + User Menu */}
            <div className="hidden md:flex items-center gap-1">
              <nav className="flex items-center gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-colors font-display uppercase ${
                      location.pathname === link.href
                        ? 'text-yellow-400 bg-green-900/40'
                        : 'text-gray-300 hover:text-white hover:bg-green-900/20'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Auth section — desktop */}
              <div className="ml-3 pl-3 border-l border-green-900/40">
                {!loading && (
                  user ? (
                    <UserMenu user={user} onSignOut={handleSignOut} />
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-4 py-2 rounded-md text-sm font-display font-bold uppercase tracking-wider transition-colors border"
                      style={{ borderColor: '#FFD700', color: '#FFD700', minHeight: '44px' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,215,0,0.08)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      Sign In
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Mobile: Sign In icon in header (only when not logged in) */}
            <div className="md:hidden">
              {!loading && (
                user ? (
                  <UserMenu user={user} onSignOut={handleSignOut} />
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider border transition-colors"
                    style={{ borderColor: '#FFD700', color: '#FFD700', minHeight: '44px' }}
                  >
                    <span>👤</span>
                    <span>Sign In</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — pb-20 on mobile to clear the bottom tab bar */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* ─── BOTTOM TAB BAR (mobile only) ─── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-green-900/50"
        style={{
          backgroundColor: 'rgba(10,15,10,0.97)',
          backdropFilter: 'blur(12px)',
          height: '56px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-stretch h-full">
          {bottomTabs.map(tab => {
            const isActive = location.pathname === tab.href
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
                style={{ minHeight: '44px' }}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span
                  className="font-display font-bold uppercase text-center leading-none"
                  style={{
                    fontSize: '0.55rem',
                    letterSpacing: '0.05em',
                    color: isActive ? '#FFD700' : '#6b7280',
                  }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 rounded-t-sm"
                    style={{
                      width: '24px',
                      height: '3px',
                      backgroundColor: '#FFD700',
                    }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-green-900/30 mt-16" style={{ backgroundColor: '#060c06' }}>

        {/* Main columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Column 1 — About */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4 group">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                  style={{ backgroundColor: '#006633', color: '#FFD700' }}
                >
                  NT
                </div>
                <div>
                  <div className="font-display font-bold text-white text-base leading-tight tracking-wide">NOVA TITANS</div>
                  <div className="text-xs font-semibold tracking-widest" style={{ color: '#FFD700' }}>BASEBALL</div>
                </div>
              </Link>
              <p className="text-gray-400 text-xs leading-relaxed">
                Nova High School<br />
                3600 College Ave · Davie, FL 33314
              </p>
              <p className="text-gray-500 text-xs mt-2">6A District 15 · Broward County Public Schools</p>
              <p className="text-xs mt-3 font-semibold" style={{ color: '#FFD700' }}>Spring 2026 Season</p>
            </div>

            {/* Column 2 — Quick Links */}
            <div>
              <h3 className="font-display font-bold text-white uppercase tracking-widest text-sm mb-4" style={{ color: '#FFD700' }}>
                Quick Links
              </h3>
              <ul className="space-y-2">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Legal */}
            <div>
              <h3 className="font-display font-bold uppercase tracking-widest text-sm mb-4" style={{ color: '#FFD700' }}>
                Legal
              </h3>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2">Privacy Policy</Link></li>
                <li><Link to="/photo-policy" className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2">Photo Usage Policy</Link></li>
                <li><Link to="/refund-policy" className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Column 4 — Connect */}
            <div>
              <h3 className="font-display font-bold uppercase tracking-widest text-sm mb-4" style={{ color: '#FFD700' }}>
                Connect
              </h3>
              <p className="text-gray-500 text-xs mb-3 uppercase tracking-wider">Follow Nova Baseball</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.maxpreps.com/fl/davie/nova-titans/baseball/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2 flex items-center gap-2"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: '#1a2a3a', color: '#4a9eff' }}>MP</span>
                    MaxPreps
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.browardhighschoolbaseball.com/team/nova-titans/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2 flex items-center gap-2"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: '#1a2a1a', color: '#44bb44' }}>HSBN</span>
                    HSBN Stats
                  </a>
                </li>
                <li>
                  <a
                    href="http://www.novatitanbaseball.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2 flex items-center gap-2"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: '#1a2a1a', color: '#FFD700' }}>NT</span>
                    Official Site
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtu.be/sjLH1aXugBw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 text-sm hover:text-white transition-colors hover:underline underline-offset-2 flex items-center gap-2"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: '#2a1a1a', color: '#ff4444' }}>▶</span>
                    HSBN Media Day
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-green-900/20" />

        {/* Affiliation badges row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-4 text-center">Affiliations &amp; Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {affiliations.map(org => (
              <a
                key={org.label}
                href={org.href}
                target="_blank"
                rel="noopener noreferrer"
                title={org.full}
                className="group"
              >
                <span
                  className="inline-block px-3 py-1.5 rounded border text-xs font-bold tracking-wider transition-all duration-200"
                  style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#555',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#ccc'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#555'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                  }}
                >
                  {org.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-green-900/20" />

        {/* Payment badges row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            {paymentMethods.map(pm => (
              <span
                key={pm}
                className="inline-block px-2 py-1 rounded border text-xs font-semibold tracking-wide"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: '#444',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  fontSize: '0.65rem',
                }}
              >
                {pm}
              </span>
            ))}
          </div>
          <p className="text-center text-gray-700 text-xs">🔒 Secure payments powered by Stripe</p>
        </div>

        {/* Divider */}
        <div className="border-t border-green-900/20" />

        {/* Copyright bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <span>© 2026 Nova Titans Baseball. All rights reserved.</span>
            <span>Photos by Dana Gonzalez. Built with ⚾ in Davie, FL.</span>
          </div>
        </div>

      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}
