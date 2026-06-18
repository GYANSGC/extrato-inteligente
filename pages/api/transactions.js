import { withAuth } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'

export default withAuth(async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  const userId = req.user.id

  // ── GET: lista transações ─────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { extrato_id, categoria, tipo, search, limit = 200, offset = 0 } = req.query

    let query = supabase
      .from('transacoes')
      .select('*', { count: 'exact' })
      .eq('usuario_id', userId)
      .order('data', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    if (extrato_id) query = query.eq('extrato_id', extrato_id)
    if (categoria && categoria !== 'todas') query = query.eq('categoria', categoria)
    if (tipo && tipo !== 'todos') query = query.eq('tipo', tipo)
    if (search) query = query.ilike('descricao', `%${search}%`)

    const { data, error, count } = await query
    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ transactions: data || [], total: count })
  }

  // ── PATCH: atualiza categoria (com aprendizado) ───────────────────────────
  if (req.method === 'PATCH') {
    const { id, categoria } = req.body
    if (!id || !categoria) return res.status(400).json({ error: 'Dados inválidos' })

    // Atualiza transação
    const { data: tx, error } = await supabase
      .from('transacoes')
      .update({ categoria, categoria_editada: true })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select('descricao')
      .single()

    if (error) return res.status(500).json({ error: error.message })

    // Aprende: salva a primeira palavra como regra
    if (tx?.descricao) {
      const keyword = tx.descricao.split(/\s+/)[0].toLowerCase().trim()
      if (keyword.length >= 3) {
        await supabase
          .from('aprendizado_categorias')
          .upsert(
            { usuario_id: userId, palavra_chave: keyword, categoria },
            { onConflict: 'usuario_id,palavra_chave' }
          )
          .catch(console.error)
      }
    }

    return res.status(200).json({ ok: true })
  }

  // ── DELETE: remove transação ──────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })

    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
})
