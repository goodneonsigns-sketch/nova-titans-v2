/**
 * Vercel Serverless Function: Create Stripe Checkout Session
 * POST /api/create-checkout
 * Body: { photoId, photoUrl, gameInfo, printSize, priceId, customerEmail }
 */

const PRINT_PRICES = {
  '5x7': { amount: 1200, name: '5×7" Print' },
  '8x10': { amount: 2000, name: '8×10" Print' },
  '11x14': { amount: 3000, name: '11×14" Print' },
  '16x20_canvas': { amount: 6000, name: '16×20" Canvas Print' },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY
  if (!STRIPE_SECRET) {
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  try {
    const { photoId, photoUrl, gameInfo, printSize, customerEmail } = req.body

    const price = PRINT_PRICES[printSize]
    if (!price) {
      return res.status(400).json({ error: 'Invalid print size' })
    }

    // Dynamic import for stripe
    const stripe = (await import('stripe')).default(STRIPE_SECRET)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${price.name} — Nova Titans Baseball`,
              description: gameInfo || 'Game photo print',
              images: photoUrl ? [photoUrl] : [],
            },
            unit_amount: price.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://nova-titans-v2.vercel.app'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://nova-titans-v2.vercel.app'}/gallery`,
      metadata: {
        photo_id: String(photoId),
        print_size: printSize,
        game_info: gameInfo || '',
      },
    })

    return res.status(200).json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ error: error.message })
  }
}
