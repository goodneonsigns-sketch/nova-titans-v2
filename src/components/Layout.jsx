import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/roster', label: 'Roster' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/stats', label: 'Stats' },
]

export default function Layout({ children }) {
  const location = useLocation()

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
              <div>
                <div className="font-display font-bold text-white text-lg leading-tight tracking-wide">NOVA TITANS</div>
                <div className="text-xs leading-tight" style={{ color: '#FFD700' }}>BASEBALL</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
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

            {/* Mobile Nav */}
            <nav className="flex md:hidden items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-2 py-1 rounded text-xs font-semibold tracking-wide transition-colors font-display uppercase ${
                    location.pathname === link.href
                      ? 'text-yellow-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-green-900/30 mt-16" style={{ backgroundColor: '#060c06' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#006633', color: '#FFD700' }}>
                NT
              </div>
              <div>
                <div className="font-display font-bold text-white text-sm tracking-wide">NOVA TITANS BASEBALL</div>
                <div className="text-xs text-gray-500">Nova High School · Davie, FL · 6A District 15</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 text-center">
              Spring 2026 Season · Go Titans! 🏆
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
