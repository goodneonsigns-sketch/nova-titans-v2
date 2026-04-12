import { Link } from 'react-router-dom'

export default function Terms() {
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
            Terms of Service
          </h1>
          <p className="text-gray-500 text-sm">Last updated: April 2026</p>
          <div className="mt-4 h-1 w-16 rounded" style={{ backgroundColor: '#006633' }} />
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>

          {/* 1. Acceptance */}
          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-400">
              By accessing or using the Nova Titans Baseball photography website ("the Site"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Site. These terms apply to all visitors, users, and anyone who accesses or uses our services.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              2. Description of Service
            </h2>
            <p className="text-gray-400 mb-3">
              Nova Titans Baseball provides a sports photography platform for Nova High School baseball. Our services include:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Free browsing and downloading of game and team photography</li>
              <li>Purchasing high-quality printed photographs in various sizes</li>
              <li>Access to team rosters, schedules, game statistics, and news</li>
              <li>Optional user accounts for managing orders and saved photos</li>
            </ul>
            <p className="text-gray-400 mt-3">
              We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice.
            </p>
          </section>

          {/* 3. User Accounts */}
          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              3. User Accounts and Responsibilities
            </h2>
            <p className="text-gray-400 mb-3">
              Certain features of the Site may require you to create an account. When creating an account, you agree to:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly notify us of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Not create accounts for others without their express consent</li>
            </ul>
            <p className="text-gray-400 mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive, fraudulent, or harmful behavior.
            </p>
          </section>

          {/* 4. Intellectual Property */}
          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              4. Intellectual Property
            </h2>
            <p className="text-gray-400 mb-3">
              All photographs, images, graphics, text, and other content on the Site are owned by or licensed to Nova Titans Baseball and the photographer (Dana Gonzalez). These materials are protected by United States and international copyright laws.
            </p>
            <p className="text-gray-400 mb-3">
              Free downloads are granted for personal, non-commercial use only. You may not:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Use photos for commercial purposes without written permission</li>
              <li>Sell, sublicense, or redistribute photos</li>
              <li>Modify or create derivative works from photos</li>
              <li>Remove or alter any copyright notices or watermarks</li>
            </ul>
            <p className="text-gray-400 mt-3">
              We appreciate credit when sharing: <strong className="text-gray-300">"Photo: Nova Titans Baseball"</strong>
            </p>
          </section>

          {/* 5. Print Orders */}
          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              5. Print Orders — Pricing, Fulfillment & Shipping
            </h2>
            <p className="text-gray-400 mb-3">
              Prints are fulfilled by a third-party print lab. By placing a print order, you agree to the following:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li><strong className="text-gray-300">Pricing:</strong> All prices are listed in USD. Prices may change without notice but will be confirmed before purchase.</li>
              <li><strong className="text-gray-300">Fulfillment:</strong> Orders are typically fulfilled within 3–7 business days after payment is confirmed.</li>
              <li><strong className="text-gray-300">Shipping:</strong> Shipping times vary by carrier and destination. We are not responsible for carrier delays.</li>
              <li><strong className="text-gray-300">Quality:</strong> We strive for professional print quality. If your print arrives damaged or defective, please see our Refund Policy.</li>
              <li><strong className="text-gray-300">Personal Use:</strong> Prints are for personal use only and may not be resold.</li>
            </ul>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              6. Limitation of Liability
            </h2>
            <p className="text-gray-400 mb-3">
              The Site and its content are provided "as is" without warranties of any kind, either express or implied. To the fullest extent permitted by law, Nova Titans Baseball and its affiliates shall not be liable for:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Any indirect, incidental, special, or consequential damages</li>
              <li>Loss of data, profits, or business opportunities</li>
              <li>Errors, interruptions, or unavailability of the Site</li>
              <li>Actions or content of third-party services linked from the Site</li>
            </ul>
            <p className="text-gray-400 mt-3">
              Our total liability to you for any claim arising from these terms or your use of the Site shall not exceed the amount you paid for the specific service or product giving rise to the claim.
            </p>
          </section>

          {/* 7. Changes to Terms */}
          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              7. Changes to Terms
            </h2>
            <p className="text-gray-400">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site following any changes constitutes your acceptance of the new terms. We encourage you to review these terms periodically.
            </p>
          </section>

          {/* 8. Contact */}
          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              8. Contact
            </h2>
            <p className="text-gray-400">
              Questions about these Terms of Service can be directed to Nova Titans Baseball through Nova High School:
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
          <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link to="/photo-policy" className="hover:text-gray-400 transition-colors">Photo Usage Policy</Link>
          <Link to="/refund-policy" className="hover:text-gray-400 transition-colors">Refund Policy</Link>
        </div>

      </div>
    </div>
  )
}
