import Stripe from 'stripe'
import { getSupabaseAdmin } from '../../lib/supabase'
import { sendProConfirmationEmail } from '../../lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe/Webhook] Assinatura inválida:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  const supabase = getSupabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      const subscriptionId = session.subscription

      if (userId && subscriptionId) {
        await supabase.from('usuarios').update({
          plano: 'pro',
          assinatura_ativa: true,
          stripe_subscription_id: subscriptionId,
        }).eq('id', userId)

        // Email de boas-vindas Pro
        const { data: u } = await supabase.from('usuarios').select('email, nome').eq('id', userId).single()
        if (u) sendProConfirmationEmail(u.email, u.nome).catch(console.error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('stripe_subscription_id', sub.id)
        .single()

      if (usuario) {
        const ativa = sub.status === 'active' || sub.status === 'trialing'
        await supabase.from('usuarios').update({
          assinatura_ativa: ativa,
          plano: ativa ? 'pro' : 'free',
        }).eq('id', usuario.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('stripe_subscription_id', sub.id)
        .single()

      if (usuario) {
        await supabase.from('usuarios').update({
          plano: 'free',
          assinatura_ativa: false,
          stripe_subscription_id: null,
        }).eq('id', usuario.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      console.warn('[Stripe] Pagamento falhou para customer:', invoice.customer)
      break
    }
  }

  return res.status(200).json({ received: true })
}
