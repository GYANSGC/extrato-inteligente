import { withPlan } from '../../lib/auth'
import { generateReportSummary } from '../../lib/ai'
import { rateLimit } from '../../lib/rateLimit'

const limiter = rateLimit({ windowMs: 60_000, max: 5, keyPrefix: 'ai_report' })

/**
 * POST /api/ai/report
 * Gera relatório financeiro textual (plano Pro)
 */
export default withPlan(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!limiter.check(req, res)) return

  const { financialData } = req.body
  if (!financialData) return res.status(400).json({ error: 'Dados obrigatórios' })

  try {
    const report = await generateReportSummary(financialData)
    return res.status(200).json({ report })
  } catch (err) {
    console.error('[AI/Report]', err)
    return res.status(500).json({ error: 'Erro ao gerar relatório.' })
  }
}, 'ia_chat')
