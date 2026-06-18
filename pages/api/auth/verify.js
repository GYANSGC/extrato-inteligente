import { getSupabaseAdmin } from '../../lib/supabase'
import { signToken } from '../../lib/auth'
import { sendWelcomeEmail } from '../../lib/email'

/**
 * GET /api/auth/verify?token=xxx
 * Verifica o email do usuário via token enviado por email.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token não fornecido' })

  const supabase = getSupabaseAdmin()

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, plano, verificado')
      .eq('token_verificacao', token)
      .single()

    if (error || !user) {
      // Redireciona para login com mensagem de erro
      return res.redirect(302, '/auth/login?erro=token-invalido')
    }

    if (user.verificado) {
      return res.redirect(302, '/app?verificado=ja')
    }

    // Marca como verificado
    await supabase
      .from('usuarios')
      .update({ verificado: true, token_verificacao: null })
      .eq('id', user.id)

    // Envia email de boas-vindas
    sendWelcomeEmail(user.email, user.nome).catch(console.error)

    // Gera JWT e faz login automático
    const jwtToken = signToken({ id: user.id, email: user.email, nome: user.nome, plano: user.plano })
    res.setHeader('Set-Cookie', `token=${jwtToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)

    return res.redirect(302, '/app?verificado=true')
  } catch (err) {
    console.error('[Auth/Verify]', err)
    return res.redirect(302, '/auth/login?erro=servidor')
  }
}
