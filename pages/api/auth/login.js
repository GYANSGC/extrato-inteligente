import { getSupabaseAdmin } from '../../lib/supabase'
import { comparePassword, signToken } from '../../lib/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'Email ou senha inválidos' })

  const { email, senha } = parse.data
  const supabase = getSupabaseAdmin()

  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nome, email, senha_hash, plano, verificado, assinatura_ativa')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!usuario) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' })
    }

    const senhaOk = await comparePassword(senha, usuario.senha_hash)
    if (!senhaOk) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' })
    }

    const token = signToken({
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      plano: usuario.plano,
    })

    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)

    return res.status(200).json({
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        plano: usuario.plano,
        verificado: usuario.verificado,
      },
      token,
    })

  } catch (err) {
    console.error('[Auth/Login]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
