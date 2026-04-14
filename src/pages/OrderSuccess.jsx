import { useSearchParams, Link } from 'react-router-dom'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const printSize = searchParams.get('print_size')

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center"
      style={{ backgroundColor: '#0a0f0a' }}
    >
      {/* Success icon */}
      <div className="text-6xl mb-6 animate-bounce">🎉</div>

      {/* Heading */}
      <h1
        className="font-display font-bold text-4xl md:text-5xl uppercase tracking-wide mb-3"
        style={{ color: '#FFD700' }}
      >
        Order Confirmed!
      </h1>

      {/* Subheading */}
      <p className="text-xl text-white font-semibold mb-2">
        Your print is being prepared!
      </p>
      <p className="text-gray-400 text-base mb-8 max-w-md">
        We've received your order and our print lab is getting to work.
        You'll receive a confirmation email shortly.
      </p>

      {/* Order details card */}
      <div
        className="w-full max-w-sm rounded-2xl border border-green-900/40 p-6 mb-8 text-left"
        style={{ backgroundColor: '#0f1a0f' }}
      >
        <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm mb-4" style={{ color: '#FFD700' }}>
          Order Details
        </h2>

        <div className="space-y-3">
          {printSize && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Print Size</span>
              <span className="text-white font-semibold text-sm">{printSize}</span>
            </div>
          )}

          {sessionId && (
            <div className="flex items-start justify-between gap-3">
              <span className="text-gray-400 text-sm flex-shrink-0">Order ID</span>
              <span className="text-gray-600 text-xs font-mono text-right break-all">{sessionId.slice(0, 20)}…</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Status</span>
            <span className="text-green-400 font-semibold text-sm">✓ Payment received</span>
          </div>

          <div className="pt-2 border-t border-green-900/20">
            <p className="text-gray-500 text-xs">
              ⏱️ We'll have your print ready and shipped within 3–5 business days.
            </p>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to="/gallery"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-bold uppercase tracking-wider text-sm transition-all hover:brightness-110"
          style={{ backgroundColor: '#006633', color: '#fff', minHeight: '52px' }}
        >
          📷 Back to Gallery
        </Link>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-bold uppercase tracking-wider text-sm transition-all border hover:bg-white/5"
          style={{ borderColor: '#FFD700', color: '#FFD700', minHeight: '52px' }}
        >
          🏠 Browse More Photos
        </Link>
      </div>

      {/* Questions note */}
      <p className="text-gray-600 text-xs mt-8 max-w-sm">
        Questions about your order? Check our{' '}
        <Link to="/refund-policy" className="underline hover:text-gray-400 transition-colors">
          Refund Policy
        </Link>
        {' '}or contact us via the information on our site.
      </p>
    </div>
  )
}
