import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ onClose, initialTab = 'signin', message }) {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState(initialTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up form state
  const [fullName, setFullName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const backdropRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose()
  }

  const switchTab = (newTab) => {
    setTab(newTab)
    setError('')
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(signInEmail, signInPassword)
    setLoading(false)
    if (error) {
      setError(error.message || 'Sign in failed. Please try again.')
    } else {
      onClose()
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { error } = await signUp(signUpEmail, signUpPassword, fullName)
    setLoading(false)
    if (error) {
      setError(error.message || 'Sign up failed. Please try again.')
    } else {
      // Supabase may require email confirmation; show a success note
      setError('')
      onClose()
    }
  }

  const inputClass = `
    w-full px-4 py-3 rounded-lg text-white text-sm
    border border-green-900/50 focus:border-yellow-400 focus:outline-none
    transition-colors placeholder-gray-600
  `

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-green-900/40 shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#0f1a0f' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-green-900/30">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: '#006633', color: '#FFD700' }}
            >
              NT
            </div>
            <div>
              <div className="font-display font-bold text-white text-base leading-tight tracking-wide">
                NOVA TITANS
              </div>
              <div className="text-xs font-semibold tracking-widest" style={{ color: '#FFD700' }}>
                BASEBALL
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Optional message banner */}
        {message && (
          <div
            className="px-6 py-3 text-sm text-center font-semibold"
            style={{ backgroundColor: 'rgba(0,102,51,0.3)', color: '#FFD700' }}
          >
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-green-900/30">
          <button
            onClick={() => switchTab('signin')}
            className={`flex-1 py-3 text-sm font-display font-bold uppercase tracking-wider transition-colors ${
              tab === 'signin'
                ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab('signup')}
            className={`flex-1 py-3 text-sm font-display font-bold uppercase tracking-wider transition-colors ${
              tab === 'signup'
                ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <div className="p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-red-300 text-sm bg-red-900/20 border border-red-800/40">
              {error}
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={e => setSignInEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                  style={{ backgroundColor: '#0a0f0a' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                  style={{ backgroundColor: '#0a0f0a' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-display font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-50"
                style={{ backgroundColor: '#006633', color: '#FFD700', minHeight: '44px' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              <p className="text-center text-gray-500 text-xs">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="font-semibold hover:underline"
                  style={{ color: '#FFD700' }}
                >
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className={inputClass}
                  style={{ backgroundColor: '#0a0f0a' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={e => setSignUpEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                  style={{ backgroundColor: '#0a0f0a' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={e => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                  style={{ backgroundColor: '#0a0f0a' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                  style={{ backgroundColor: '#0a0f0a' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-display font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-50"
                style={{ backgroundColor: '#006633', color: '#FFD700', minHeight: '44px' }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p className="text-center text-gray-500 text-xs">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className="font-semibold hover:underline"
                  style={{ color: '#FFD700' }}
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
