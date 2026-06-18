import Stripe from 'stripe'
import { withAuth } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ── POST /api/stripe/checkout ─────────────────────────────────────────────────
export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = getSupabaseAdmin()
  const userId = req.user.id
  const { priceId, interval } = req.body // interval: 'monthly' | 'yearly'

  const priceIdToUse = priceId ||
    (interval === 'yearly'
      ? process.env.STRIPE_PRICE_PRO_YEARLY
      : process.env.STRIPE_PRICE_PRO_MONTHLY)

  try {
    // Busca ou cria customer Stripe
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('email, nome, stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = usuario?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: usuario.email,
        name: usuario.nome,
        metadata: { userId },
      })
      customerId = customer.id
      await supabase.from('usuarios').update({ stripe_customer_id: customerId }).eq('id', userId)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceIdToUse, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/precos`,
      metadata: { userId },
      locale: 'pt-BR',
      allow_promotion_codes: true,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[Stripe/Checkout]', err)
    return res.status(500).json({ error: 'Erro ao criar sessão de pagamento.' })
  }
})
