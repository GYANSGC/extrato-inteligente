import { withAuth } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'

export default withAuth(async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  const userId = req.user.id

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ goals: data || [] })
  }

  if (req.method === 'POST') {
    const { nome, icone, valor_alvo, valor_atual, prazo } = req.body
    if (!nome || !valor_alvo) return res.status(400).json({ error: 'Nome e valor obrigatórios' })

    const { data, error } = await supabase
      .from('metas')
      .insert({ usuario_id: userId, nome, icone: icone || '🎯', valor_alvo, valor_atual: valor_atual || 0, prazo })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ goal: data })
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })

    const allowed = ['nome', 'icone', 'valor_alvo', 'valor_atual', 'prazo', 'concluida']
    const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))

    const { data, error } = await supabase
      .from('metas')
      .update(safe)
      .eq('id', id)
      .eq('usuario_id', userId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ goal: data })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await supabase.from('metas').delete().eq('id', id).eq('usuario_id', userId)
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
})
