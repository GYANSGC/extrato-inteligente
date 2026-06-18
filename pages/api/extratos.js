import { withAuth } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'

export default withAuth(async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  const userId = req.user.id

  // ── GET: lista extratos do usuário ───────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('extratos')
      .select(`
        id,
        nome_arquivo,
        tipo_arquivo,
        periodo_inicio,
        periodo_fim,
        total_entradas,
        total_saidas,
        saldo,
        criado_em
      `)
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false })
      .limit(50)

    if (error) return res.status(500).json({ error: error.message })

    // Conta transações de cada extrato
    const extratos = await Promise.all(
      (data || []).map(async (e) => {
        const { count } = await supabase
          .from('transacoes')
          .select('*', { count: 'exact', head: true })
          .eq('extrato_id', e.id)

        return { ...e, num_transacoes: count || 0 }
      })
    )

    return res.status(200).json({ extratos })
  }

  // ── DELETE: remove extrato e suas transações ──────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'ID do extrato obrigatório' })

    // Verifica propriedade
    const { data: extrato } = await supabase
      .from('extratos')
      .select('id')
      .eq('id', id)
      .eq('usuario_id', userId)
      .single()

    if (!extrato) return res.status(404).json({ error: 'Extrato não encontrado' })

    // Deleta transações e extrato (cascade)
    await supabase.from('transacoes').delete().eq('extrato_id', id)
    await supabase.from('insights_cache').delete().eq('extrato_id', id)
    const { error } = await supabase.from('extratos').delete().eq('id', id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
})
