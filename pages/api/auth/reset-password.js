import { getSupabaseAdmin } from '../../lib/supabase'
import { hashPassword } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { token, novaSenha } = req.body
  if (!token || !novaSenha || novaSenha.length < 8) {
    return res.status(400).json({ error: 'Dados inválidos. Senha mínimo 8 caracteres.' })
  }

  const supabase = getSupabaseAdmin()

  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, token_reset_exp')
      .eq('token_reset', token)
      .single()

    if (!usuario) return res.status(400).json({ error: 'Token inválido ou expirado.' })
    if (new Date(usuario.token_reset_exp) < new Date()) {
      return res.status(400).json({ error: 'Token expirado. Solicite um novo link.' })
    }

    const senhaHash = await hashPassword(novaSenha)
    await supabase.from('usuarios').update({
      senha_hash: senhaHash,
      token_reset: null,
      token_reset_exp: null,
    }).eq('id', usuario.id)

    return res.status(200).json({ message: 'Senha atualizada com sucesso!' })
  } catch (err) {
    console.error('[Auth/ResetPassword]', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
