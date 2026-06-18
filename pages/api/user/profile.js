import { withAuth } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'
import { hashPassword, comparePassword } from '../../../lib/auth'

export default withAuth(async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  const userId = req.user.id

  // ── GET: retorna dados do perfil ──────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, plano, verificado, assinatura_ativa, uploads_mes, uploads_reset_em, criado_em')
      .eq('id', userId)
      .single()

    if (error) return res.status(500).json({ error: 'Erro ao buscar perfil' })
    return res.status(200).json({ user: data })
  }

  // ── PATCH: atualiza nome ou senha ─────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { nome, senhaAtual, novaSenha } = req.body
    const updates = {}

    if (nome?.trim()) {
      updates.nome = nome.trim().substring(0, 100)
    }

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ error: 'Informe a senha atual para alterá-la.' })
      }
      if (novaSenha.length < 8) {
        return res.status(400).json({ error: 'Nova senha deve ter no mínimo 8 caracteres.' })
      }

      // Verifica senha atual
      const { data: user } = await supabase
        .from('usuarios')
        .select('senha_hash')
        .eq('id', userId)
        .single()

      const ok = await comparePassword(senhaAtual, user.senha_hash)
      if (!ok) return res.status(401).json({ error: 'Senha atual incorreta.' })

      updates.senha_hash = await hashPassword(novaSenha)
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar.' })
    }

    const { error } = await supabase.from('usuarios').update(updates).eq('id', userId)
    if (error) return res.status(500).json({ error: 'Erro ao atualizar perfil.' })

    return res.status(200).json({ ok: true, message: 'Perfil atualizado com sucesso.' })
  }

  // ── DELETE: apaga conta e todos os dados ─────────────────────────────────
  if (req.method === 'DELETE') {
    const { senha } = req.body
    if (!senha) return res.status(400).json({ error: 'Confirme sua senha para excluir a conta.' })

    const { data: user } = await supabase
      .from('usuarios')
      .select('senha_hash, stripe_subscription_id')
      .eq('id', userId)
      .single()

    const ok = await comparePassword(senha, user.senha_hash)
    if (!ok) return res.status(401).json({ error: 'Senha incorreta.' })

    // Cancela assinatura Stripe se existir
    if (user.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        await stripe.subscriptions.cancel(user.stripe_subscription_id)
      } catch (e) {
        console.warn('[Profile/Delete] Erro ao cancelar Stripe:', e.message)
      }
    }

    // Deleta todos os dados (cascade via FK)
    await supabase.from('usuarios').delete().eq('id', userId)

    // Limpa cookie
    res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax')

    return res.status(200).json({ ok: true, message: 'Conta excluída com sucesso.' })
  }

  return res.status(405).end()
})
