import { getSupabaseAdmin } from '../../lib/supabase'
import { hashPassword, signToken } from '../../lib/auth'
import { sendVerificationEmail } from '../../lib/email'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const schema = z.object({
  nome:  z.string().min(2, 'Nome muito curto').max(100),
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const parse = schema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.errors[0].message })
  }

  const { nome, email, senha } = parse.data
  const supabase = getSupabaseAdmin()

  try {
    // Verifica se email já existe
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' })
    }

    const senhaHash = await hashPassword(senha)
    const tokenVerificacao = uuidv4()

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert({
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha_hash: senhaHash,
        token_verificacao: tokenVerificacao,
        plano: 'free',
        verificado: false,
      })
      .select('id, nome, email, plano, verificado')
      .single()

    if (error) throw error

    // Envia email de verificação (não bloqueia o cadastro)
    sendVerificationEmail(email, nome, tokenVerificacao).catch(console.error)

    // Gera token JWT
    const token = signToken({
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      plano: usuario.plano,
    })

    // Cookie HTTP-only seguro
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)

    return res.status(201).json({
      user: { id: usuario.id, nome: usuario.nome, email: usuario.email, plano: usuario.plano },
      token,
      message: 'Conta criada! Verifique seu email para ativar.'
    })

  } catch (err) {
    console.error('[Auth/Register]', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
