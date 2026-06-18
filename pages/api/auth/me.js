import { getUserFromRequest } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/auth/me
 * Retorna dados atualizados do usuário autenticado.
 * Usado para restaurar sessão no _app.js sem depender só do localStorage.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const payload = getUserFromRequest(req)
  if (!payload) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, plano, verificado, assinatura_ativa, uploads_mes, uploads_reset_em')
      .eq('id', payload.id)
      .single()

    if (error || !user) return res.status(401).json({ error: 'Usuário não encontrado' })

    return res.status(200).json({ user })
  } catch (err) {
    console.error('[Auth/Me]', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
