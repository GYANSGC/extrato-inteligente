import { withPlan } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'

export const config = { api: { responseLimit: '8mb' } }

/**
 * GET /api/transactions/export?extrato_id=xxx&format=csv
 * Exporta transações como CSV ou JSON (plano Pro)
 */
export default withPlan(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const supabase = getSupabaseAdmin()
  const userId = req.user.id
  const { extrato_id, format = 'csv' } = req.query

  let query = supabase
    .from('transacoes')
    .select('data, descricao, valor, tipo, categoria')
    .eq('usuario_id', userId)
    .order('data', { ascending: false })
    .limit(10000)

  if (extrato_id) query = query.eq('extrato_id', extrato_id)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  const rows = data || []

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename="extrato.json"')
    return res.status(200).json(rows)
  }

  // Gera CSV
  const header = 'Data,Descrição,Valor,Tipo,Categoria'
  const lines = rows.map(r =>
    [
      r.data,
      `"${(r.descricao || '').replace(/"/g, '""')}"`,
      r.valor.toFixed(2).replace('.', ','),
      r.tipo === 'entrada' ? 'Entrada' : 'Saída',
      r.categoria,
    ].join(',')
  )

  const csv = [header, ...lines].join('\n')
  const bom = '\uFEFF' // BOM para Excel abrir UTF-8 corretamente

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="extrato_${new Date().toISOString().slice(0, 10)}.csv"`)
  return res.status(200).send(bom + csv)
}, 'ia_chat') // reutiliza flag "ia_chat" como proxy para plano Pro
