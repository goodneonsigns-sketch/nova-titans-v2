import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#0a0f0a', color: '#e5e7eb' }}>
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display font-bold text-4xl text-white tracking-wide mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm">Last updated: April 2026</p>
          <div className="mt-4 h-1 w-16 rounded" style={{ backgroundColor: '#006633' }} />
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>

          {/* Intro */}
          <section>
            <p className="text-gray-400">
              Nova Titans Baseball ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our services. Please read this policy carefully.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              1. Information We Collect
            </h2>
            <p className="text-gray-400 mb-3">We collect the following types of information:</p>
            <h3 className="text-gray-300 font-semibold mb-2">Account Information</h3>
            <ul className="text-gray-400 space-y-1 list-disc list-inside mb-4">
              <li>Name and email address (when you create an account)</li>
              <li>Password (stored securely as a hashed value — never in plain text)</li>
            </ul>
            <h3 className="text-gray-300 font-semibold mb-2">Order Information</h3>
            <ul className="text-gray-400 space-y-1 list-disc list-inside mb-4">
              <li>Shipping address for print orders</li>
              <li>Order history and selected photos</li>
              <li>Payment confirmation (not card details — see Stripe section below)</li>
            </ul>
            <h3 className="text-gray-300 font-semibold mb-2">Usage Information</h3>
            <ul className="text-gray-400 space-y-1 list-disc list-inside">
              <li>Pages visited and photos viewed</li>
              <li>Browser type and device information</li>
              <li>IP address (for security and analytics purposes)</li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              2. How We Use Your Information
            </h2>
            <p className="text-gray-400 mb-3">We use the information we collect to:</p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Create and manage your user account</li>
              <li>Process and fulfill print orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your questions and support requests</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-gray-400 mt-3">
              We do not use your information for advertising or marketing purposes beyond direct communications about your orders or account.
            </p>
          </section>

          {/* 3. Stripe */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              3. Payment Processing (Stripe)
            </h2>
            <p className="text-gray-400 mb-3">
              All payment processing is handled by <strong className="text-gray-300">Stripe</strong>, a PCI-compliant payment processor. We never see, store, or have access to your full credit card number, CVV, or other sensitive payment details.
            </p>
            <p className="text-gray-400">
              When you make a purchase, your payment information is entered directly into Stripe's secure system. We only receive a transaction confirmation and a tokenized reference to your payment method. Stripe's privacy policy is available at{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-gray-300 hover:text-white">stripe.com/privacy</a>.
            </p>
          </section>

          {/* 4. Supabase */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              4. Data Storage (Supabase)
            </h2>
            <p className="text-gray-400">
              User account data, order history, and site content are stored using <strong className="text-gray-300">Supabase</strong>, a secure cloud database platform. Data is encrypted at rest and in transit. Supabase operates in compliance with industry security standards. Their privacy policy is available at{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-gray-300 hover:text-white">supabase.com/privacy</a>.
            </p>
          </section>

          {/* 5. No Selling of Data */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              5. We Do Not Sell Your Data
            </h2>
            <p className="text-gray-400">
              We do not sell, rent, trade, or otherwise transfer your personal information to third parties for commercial purposes. We do not share your data with advertisers or data brokers.
            </p>
          </section>

          {/* 6. Cookies */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              6. Cookies
            </h2>
            <p className="text-gray-400 mb-3">
              We use minimal cookies. Specifically:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li><strong className="text-gray-300">Authentication session cookie:</strong> Used to keep you logged in to your account. This cookie is essential for the service and cannot be disabled if you wish to use account features.</li>
            </ul>
            <p className="text-gray-400 mt-3">
              We do not use tracking cookies, advertising cookies, or analytics cookies that follow you across the web. If you disable cookies entirely, you can still browse and download photos freely — you just won't be able to log in to an account.
            </p>
          </section>

          {/* 7. Children's Privacy */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              7. Children's Privacy (COPPA)
            </h2>
            <p className="text-gray-400 mb-3">
              We are aware that our site features photos of student athletes, many of whom are minors. We take children's privacy seriously and comply with the Children's Online Privacy Protection Act (COPPA).
            </p>
            <p className="text-gray-400 mb-3">
              <strong className="text-gray-300">Users under 13:</strong> We do not knowingly collect personal information from children under the age of 13 without verifiable parental consent. If you are under 13, please do not create an account or submit personal information without a parent or guardian's involvement.
            </p>
            <p className="text-gray-400">
              If we become aware that we have inadvertently collected personal information from a child under 13 without parental consent, we will promptly delete that information. Parents or guardians who believe their child's information has been collected should contact us immediately.
            </p>
          </section>

          {/* 8. Data Retention and Deletion */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              8. Data Retention and Deletion
            </h2>
            <p className="text-gray-400 mb-3">
              We retain your account and order information for as long as your account is active or as needed to fulfill orders and comply with legal obligations.
            </p>
            <p className="text-gray-400">
              You may request deletion of your account and personal data at any time by contacting us. Upon deletion request, we will remove your personal information within 30 days, except where retention is required by law (e.g., financial records for completed transactions).
            </p>
          </section>

          {/* 9. Contact */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              9. Contact
            </h2>
            <p className="text-gray-400">
              For privacy-related questions, requests, or concerns, please contact us through Nova High School:
            </p>
            <address className="not-italic mt-3 text-gray-500">
              Nova High School<br />
              3600 College Ave<br />
              Davie, FL 33314<br />
              Broward County Public Schools
            </address>
          </section>

        </div>

        {/* Bottom nav */}
        <div className="mt-12 pt-8 border-t border-green-900/30 flex flex-wrap gap-4 text-xs text-gray-600">
          <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          <Link to="/photo-policy" className="hover:text-gray-400 transition-colors">Photo Usage Policy</Link>
          <Link to="/refund-policy" className="hover:text-gray-400 transition-colors">Refund Policy</Link>
        </div>

      </div>
    </div>
  )
}
