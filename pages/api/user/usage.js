import { withAuth, PLANO_LIMITES } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/user/usage
 * Retorna quantos uploads o usuário usou/restam no mês atual.
 */
export default withAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const supabase = getSupabaseAdmin()
  const userId = req.user.id
  const plano = req.user.plano || 'free'
  const limites = PLANO_LIMITES[plano]

  const { data: user } = await supabase
    .from('usuarios')
    .select('uploads_mes, uploads_reset_em')
    .eq('id', userId)
    .single()

  const agora = new Date()
  const resetEm = user?.uploads_reset_em ? new Date(user.uploads_reset_em) : new Date()
  const uploadsUsados = agora > resetEm ? 0 : (user?.uploads_mes || 0)
  const uploadsRestantes = Math.max(0, limites.uploads_mes - uploadsUsados)
  const diasParaReset = Math.ceil((resetEm - agora) / (1000 * 60 * 60 * 24))

  return res.status(200).json({
    plano,
    uploadsUsados,
    uploadsRestantes,
    uploadsLimite: limites.uploads_mes,
    uploadsIlimitado: limites.uploads_mes >= 999,
    resetEm: resetEm.toISOString(),
    diasParaReset: Math.max(0, diasParaReset),
    features: limites,
  })
})
