/**
 * Vercel Serverless Function: Stripe Webhook
 * POST /api/stripe-webhook
 * Handles checkout.session.completed events — creates order in Supabase
 */

import { buffer } from 'micro'

export const config = {
  api: {
    bodyParser: false, // Stripe needs raw body for signature verification
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!STRIPE_SECRET || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  try {
    const stripe = (await import('stripe')).default(STRIPE_SECRET)
    const buf = await buffer(req)
    
    let event
    if (STRIPE_WEBHOOK_SECRET) {
      const sig = req.headers['stripe-signature']
      event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET)
    } else {
      event = JSON.parse(buf.toString())
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Create order in Supabase
      const orderData = {
        photo_id: parseInt(session.metadata.photo_id),
        print_size: session.metadata.print_size,
        price_cents: session.amount_total,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        status: 'paid',
        customer_name: session.customer_details?.name || '',
        customer_email: session.customer_details?.email || session.customer_email || '',
        shipping_address: session.customer_details?.address || null,
      }

      const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(orderData),
      })

      if (!resp.ok) {
        console.error('Failed to create order:', await resp.text())
      } else {
        console.log('✅ Order created:', session.id)
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(400).json({ error: error.message })
  }
}
