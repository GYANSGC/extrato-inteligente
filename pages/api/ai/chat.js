import { withAuth, PLANO_LIMITES } from '../../lib/auth'
import { chatWithAdvisor } from '../../lib/ai'
import { rateLimit } from '../../lib/rateLimit'

const limiter = rateLimit({ windowMs: 60_000, max: 15, keyPrefix: 'ai_chat' })

/**
 * POST /api/ai/chat
 * Conversa com o Consultor Financeiro IA (plano Pro)
 */
export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Rate limit: 15 mensagens/min
  if (!limiter.check(req, res)) return

  const plano = req.user.plano || 'free'
  const limites = PLANO_LIMITES[plano]

  if (!limites.ia_chat) {
    return res.status(403).json({
      error: 'O Consultor Financeiro IA é exclusivo do plano Pro.',
      upgrade: true,
    })
  }

  const { messages, financialContext } = req.body

  if (!messages || !Array.isArray(messages) || !financialContext) {
    return res.status(400).json({ error: 'Dados inválidos' })
  }

  // Limita histórico para não explodir contexto
  const recentMessages = messages.slice(-12)

  try {
    const reply = await chatWithAdvisor(recentMessages, financialContext)
    return res.status(200).json({ reply })
  } catch (err) {
    console.error('[AI/Chat]', err)
    return res.status(500).json({ error: 'Erro no consultor IA. Tente novamente.' })
  }
})
