import { withAuth } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'
import { generateInsights } from '../../lib/ai'
import { rateLimit } from '../../lib/rateLimit'

const limiter = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: 'ai_insights' })

/**
 * POST /api/ai/insights
 * Gera insights financeiros via IA com cache por extrato
 */
export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!limiter.check(req, res)) return

  const { financialData, extratoId } = req.body

  if (!financialData) {
    return res.status(400).json({ error: 'Dados financeiros obrigatórios' })
  }

  const supabase = getSupabaseAdmin()
  const userId = req.user.id

  // Verifica cache
  if (extratoId) {
    try {
      const { data: cached } = await supabase
        .from('insights_cache')
        .select('insights, criado_em')
        .eq('extrato_id', extratoId)
        .eq('usuario_id', userId)
        .order('criado_em', { ascending: false })
        .limit(1)
        .single()

      // Cache válido por 24h
      if (cached?.insights) {
        const age = Date.now() - new Date(cached.criado_em).getTime()
        if (age < 24 * 60 * 60 * 1000) {
          return res.status(200).json({ insights: cached.insights, cached: true })
        }
      }
    } catch { /* cache miss — gera novos */ }
  }

  try {
    const insights = await generateInsights(financialData)

    // Salva cache
    if (extratoId) {
      await supabase.from('insights_cache').upsert({
        usuario_id: userId,
        extrato_id: extratoId,
        insights,
        criado_em: new Date().toISOString(),
      }, { onConflict: 'usuario_id,extrato_id' }).catch(console.error)
    }

    return res.status(200).json({ insights })
  } catch (err) {
    console.error('[AI/Insights]', err)
    return res.status(500).json({ error: 'Erro ao gerar insights. Tente novamente.' })
  }
})
