import Stripe from 'stripe'
import { withAuth } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * POST /api/stripe/portal
 * Redireciona para o portal de gerenciamento de assinatura do Stripe.
 * Permite cancelar, trocar plano, atualizar cartão.
 */
export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Pagamentos não configurados.' })
  }

  const supabase = getSupabaseAdmin()
  const userId = req.user.id

  try {
    const { data: user } = await supabase
      .from('usuarios')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: 'Nenhuma assinatura ativa encontrada.' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?portal=retorno`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[Stripe/Portal]', err)
    return res.status(500).json({ error: 'Erro ao acessar portal de assinatura.' })
  }
})
