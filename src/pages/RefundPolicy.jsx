import { Link } from 'react-router-dom'

export default function RefundPolicy() {
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
            Refund Policy
          </h1>
          <p className="text-gray-500 text-sm">Last updated: April 2026</p>
          <div className="mt-4 h-1 w-16 rounded" style={{ backgroundColor: '#006633' }} />
        </div>

        {/* Summary callout */}
        <div
          className="rounded-lg px-6 py-4 mb-10 border text-sm"
          style={{ backgroundColor: 'rgba(0,102,51,0.1)', borderColor: 'rgba(0,102,51,0.3)', color: '#88cc99' }}
        >
          <strong>The short version:</strong> If your print arrives damaged or defective, we'll make it right — replacement or refund within 14 days. Digital downloads are free and non-refundable.
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>

          {/* 1. Print Orders */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              1. Print Orders — Refunds and Replacements
            </h2>
            <p className="text-gray-400 mb-3">
              We take print quality seriously. If your print order arrives damaged, defective, or significantly different from what was shown on our site, you are eligible for a full refund or replacement print.
            </p>
            <h3 className="text-gray-300 font-semibold mb-2">Eligibility</h3>
            <ul className="text-gray-400 space-y-2 list-disc list-inside mb-4">
              <li>Refund or replacement requests must be submitted within <strong className="text-gray-300">14 days</strong> of receiving your order</li>
              <li>The print must be damaged, defective, or have significant quality issues (color problems, printing errors, physical damage)</li>
              <li>You must provide your order number and, when possible, a photo of the issue</li>
            </ul>
            <h3 className="text-gray-300 font-semibold mb-2">What We Cover</h3>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Prints damaged during shipping</li>
              <li>Printing defects (color banding, blurry output, incorrect image)</li>
              <li>Wrong size or product received</li>
              <li>Prints that arrive in unacceptable condition</li>
            </ul>
          </section>

          {/* 2. Digital Downloads */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              2. Digital Downloads
            </h2>
            <p className="text-gray-400">
              Digital photo downloads on our site are provided <strong className="text-gray-300">free of charge</strong>. Because no payment is made for digital downloads, there is nothing to refund. If you experience a technical issue with a download (e.g., corrupted file, failed download), please contact us and we'll ensure you can access the photo.
            </p>
          </section>

          {/* 3. How to Request */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              3. How to Request a Refund or Replacement
            </h2>
            <p className="text-gray-400 mb-3">To initiate a refund or replacement request:</p>
            <ol className="text-gray-400 space-y-3 list-decimal list-inside">
              <li>
                <strong className="text-gray-300">Locate your order number</strong> — found in your order confirmation email or your account's order history.
              </li>
              <li>
                <strong className="text-gray-300">Document the issue</strong> — take a clear photo of the damaged or defective print if possible.
              </li>
              <li>
                <strong className="text-gray-300">Contact us</strong> — reach out through Nova High School with your order number, description of the issue, and any photos of the problem.
              </li>
              <li>
                <strong className="text-gray-300">We'll respond within 2–3 business days</strong> with resolution options (replacement shipment or refund to original payment method).
              </li>
            </ol>
            <p className="text-gray-400 mt-4">
              Refunds are processed back to the original payment method. Please allow 5–10 business days for the refund to appear, depending on your bank.
            </p>
          </section>

          {/* 4. Replacement Prints */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              4. Replacement Prints
            </h2>
            <p className="text-gray-400">
              For quality issues, we are happy to send a replacement print at no additional cost. Replacement prints go through the same fulfillment process as original orders and typically ship within 3–7 business days of your replacement request being approved. We may ask you to return or destroy the defective print before a replacement is issued.
            </p>
          </section>

          {/* 5. No Buyer's Remorse */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              5. Non-Refundable Situations
            </h2>
            <p className="text-gray-400 mb-3">
              We are unable to offer refunds in the following situations:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>
                <strong className="text-gray-300">Size selection regret:</strong> Please review print sizes carefully before ordering. Refunds are not available if you ordered the wrong size and the print itself is not defective.
              </li>
              <li>
                <strong className="text-gray-300">Change of mind:</strong> Once a print order is placed and sent to the fulfillment lab, we cannot cancel or refund for reasons other than defects.
              </li>
              <li>
                <strong className="text-gray-300">Requests after 14 days:</strong> Refund and replacement requests must be made within 14 days of receiving your order.
              </li>
              <li>
                <strong className="text-gray-300">Damage caused by the customer:</strong> We are not responsible for prints damaged after delivery.
              </li>
            </ul>
          </section>

          {/* 6. Contact */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              6. Contact Us
            </h2>
            <p className="text-gray-400">
              For refund and replacement inquiries, please contact us through Nova High School. Have your order number ready to speed up the process.
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
          <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link to="/photo-policy" className="hover:text-gray-400 transition-colors">Photo Usage Policy</Link>
        </div>

      </div>
    </div>
  )
}
