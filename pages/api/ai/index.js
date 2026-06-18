import { withAuth, PLANO_LIMITES } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'
import { generateInsights, chatWithAdvisor } from '../../../lib/ai'

export default withAuth(async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  const userId = req.user.id
  const plano = req.user.plano || 'free'

  // ── POST /api/ai/insights ──────────────────────────────────────────────────
  if (req.method === 'POST' && req.url?.includes('insights')) {
    const { financialData, extratoId } = req.body

    try {
      // Cache: verifica se já gerou insights para este extrato
      if (extratoId) {
        const { data: cached } = await supabase
          .from('insights_cache')
          .select('insights')
          .eq('extrato_id', extratoId)
          .eq('usuario_id', userId)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single()

        if (cached?.insights) {
          return res.status(200).json({ insights: cached.insights, cached: true })
        }
      }

      const insights = await generateInsights(financialData)

      // Salva cache
      if (extratoId) {
        await supabase.from('insights_cache').insert({
          usuario_id: userId,
          extrato_id: extratoId,
          insights,
        }).catch(console.error)
      }

      return res.status(200).json({ insights })
    } catch (err) {
      console.error('[AI/Insights]', err)
      return res.status(500).json({ error: 'Erro ao gerar insights. Tente novamente.' })
    }
  }

  // ── POST /api/ai/chat ──────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url?.includes('chat')) {
    // Chat só disponível no plano Pro
    const limites = PLANO_LIMITES[plano]
    if (!limites.ia_chat) {
      return res.status(403).json({
        error: 'O Consultor Financeiro IA é exclusivo do plano Pro.',
        upgrade: true,
      })
    }

    const { messages, financialContext } = req.body

    try {
      const reply = await chatWithAdvisor(messages, financialContext)
      return res.status(200).json({ reply })
    } catch (err) {
      console.error('[AI/Chat]', err)
      return res.status(500).json({ error: 'Erro no consultor. Tente novamente.' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
})
