import { getSupabaseAdmin } from '../../lib/supabase'
import { sendPasswordResetEmail } from '../../lib/email'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email obrigatório' })

  const supabase = getSupabaseAdmin()

  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    // Responde com sucesso mesmo se email não existir (segurança)
    if (usuario) {
      const token = uuidv4()
      const exp = new Date(Date.now() + 3600 * 1000) // 1 hora

      await supabase.from('usuarios').update({
        token_reset: token,
        token_reset_exp: exp.toISOString(),
      }).eq('id', usuario.id)

      sendPasswordResetEmail(usuario.email, usuario.nome, token).catch(console.error)
    }

    return res.status(200).json({ message: 'Se o email existir, você receberá as instruções.' })
  } catch (err) {
    console.error('[Auth/ForgotPassword]', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
