import { Link } from 'react-router-dom'

export default function PhotoPolicy() {
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
            Photo Usage Policy
          </h1>
          <p className="text-gray-500 text-sm">Last updated: April 2026</p>
          <div className="mt-4 h-1 w-16 rounded" style={{ backgroundColor: '#006633' }} />
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>

          {/* Intro */}
          <section>
            <p className="text-gray-400">
              All photographs on this site are the exclusive property of Nova Titans Baseball and the photographer, <strong className="text-gray-300">Dana Gonzalez</strong>. These photos are shared with the community in the spirit of celebrating Nova High School baseball. Please respect these guidelines to ensure photography access continues for everyone.
            </p>
          </section>

          {/* 1. Personal Use */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              1. Personal, Non-Commercial Use Only
            </h2>
            <p className="text-gray-400 mb-3">
              Photos available for free download are provided strictly for personal, non-commercial use. Permitted personal uses include:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Setting a photo as a phone or computer wallpaper</li>
              <li>Sharing on personal social media accounts (with credit)</li>
              <li>Saving for personal family memories and scrapbooks</li>
              <li>Printing at home for personal display</li>
              <li>Sharing with friends and family of players featured in the photo</li>
            </ul>
          </section>

          {/* 2. No Commercial Use */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              2. No Commercial Use Without Permission
            </h2>
            <p className="text-gray-400 mb-3">
              You may <strong className="text-gray-300">not</strong> use these photos for commercial purposes without prior written permission from Nova Titans Baseball. Commercial use includes, but is not limited to:
            </p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Using photos in advertisements, marketing materials, or promotions</li>
              <li>Publishing photos in newspapers, magazines, or commercial websites for profit</li>
              <li>Including photos in products for sale (t-shirts, mugs, calendars, etc.)</li>
              <li>Licensing or sublicensing photos to other parties</li>
              <li>Using photos to promote a business, organization, or brand</li>
            </ul>
            <p className="text-gray-400 mt-3">
              To request commercial use permission, please contact us through Nova High School.
            </p>
          </section>

          {/* 3. No Modification or Resale */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              3. No Modification or Resale
            </h2>
            <p className="text-gray-400 mb-3">You may not:</p>
            <ul className="text-gray-400 space-y-2 list-disc list-inside">
              <li>Edit, crop, filter, or alter photos in a way that changes their meaning or misrepresents the subject</li>
              <li>Remove or obscure any watermarks or copyright notices</li>
              <li>Sell or attempt to sell photos downloaded from this site</li>
              <li>Upload photos to stock photography platforms or image marketplaces</li>
              <li>Create derivative works (e.g., digital art, composites) for commercial distribution</li>
            </ul>
            <p className="text-gray-400 mt-3">
              Light personal edits (brightness, contrast, cropping for personal use) are acceptable, provided the photos remain for personal use only.
            </p>
          </section>

          {/* 4. Credit */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              4. Credit Appreciated
            </h2>
            <p className="text-gray-400 mb-3">
              While not strictly required for personal sharing, we greatly appreciate photo credit. When sharing on social media or other platforms, please credit:
            </p>
            <div
              className="rounded-lg px-6 py-4 text-sm font-mono border"
              style={{ backgroundColor: 'rgba(0,102,51,0.1)', borderColor: 'rgba(0,102,51,0.3)', color: '#88cc99' }}
            >
              📸 Photo: Nova Titans Baseball
            </div>
            <p className="text-gray-400 mt-3">
              Crediting the photographer and team helps grow the program's visibility and supports continued photography coverage.
            </p>
          </section>

          {/* 5. Print Purchases */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              5. Print Purchases
            </h2>
            <p className="text-gray-400 mb-3">
              Prints purchased through our site are for personal use only. When you purchase a print, you receive a high-quality physical reproduction for personal display, gifting to family and friends, or personal enjoyment.
            </p>
            <p className="text-gray-400">
              Purchased prints may not be reproduced, resold, or used for commercial purposes. The copyright in the underlying photograph remains with Nova Titans Baseball and the photographer — the print purchase is a license for personal display only.
            </p>
          </section>

          {/* 6. Copyright */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              6. Copyright Retention
            </h2>
            <p className="text-gray-400">
              The photographer, Dana Gonzalez, retains full copyright of all photographs. Nova Titans Baseball holds an exclusive license for all photos featured on this site. Downloading a photo, whether free or as part of a print purchase, does not transfer any copyright or ownership rights to you. All rights not expressly granted in this policy are reserved.
            </p>
          </section>

          {/* 7. Violations */}
          <section>
            <h2 className="font-display font-bold text-xl mb-3 uppercase tracking-wide" style={{ color: '#FFD700', fontFamily: 'Oswald, sans-serif' }}>
              7. Policy Violations
            </h2>
            <p className="text-gray-400">
              Unauthorized use of photos may result in removal of your account access and, where applicable, legal action under copyright law. If you see photos from this site being used in violation of this policy, please notify us so we can address it.
            </p>
          </section>

        </div>

        {/* Bottom nav */}
        <div className="mt-12 pt-8 border-t border-green-900/30 flex flex-wrap gap-4 text-xs text-gray-600">
          <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link to="/refund-policy" className="hover:text-gray-400 transition-colors">Refund Policy</Link>
        </div>

      </div>
    </div>
  )
}
