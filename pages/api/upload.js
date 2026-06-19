import { withAuth, PLANO_LIMITES } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'
import { parseFile } from '../../lib/parsers'

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
}

export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = getSupabaseAdmin()
  const userId = req.user.id
  const plano = req.user.plano || 'free'
  const limites = PLANO_LIMITES[plano]

  try {
    // ── Verifica limite de uploads ──
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('uploads_mes, uploads_reset_em')
      .eq('id', userId)
      .single()

    if (usuario) {
      const agora = new Date()
      const resetEm = new Date(usuario.uploads_reset_em)

      let uploadsAtual = usuario.uploads_mes
      if (agora > resetEm) {
        // Reseta contador mensal
        uploadsAtual = 0
        await supabase.from('usuarios').update({
          uploads_mes: 0,
          uploads_reset_em: new Date(agora.getFullYear(), agora.getMonth() + 1, 1).toISOString()
        }).eq('id', userId)
      }

      if (uploadsAtual >= limites.uploads_mes) {
        return res.status(403).json({
          error: `Limite de ${limites.uploads_mes} extratos por mês atingido. Faça upgrade para o plano Pro.`,
          upgrade: true,
          limit: limites.uploads_mes,
        })
      }
    }

    // ── Recebe o arquivo como base64 ──
    const { fileName, mimeType, fileBase64 } = req.body
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'Arquivo não recebido.' })
    }

    const fileBuffer = Buffer.from(fileBase64, 'base64')

    // ── Busca regras de aprendizado do usuário ──
    const { data: learningRules } = await supabase
      .from('aprendizado_categorias')
      .select('palavra_chave, categoria')
      .eq('usuario_id', userId)

    const userRules = {}
    if (learningRules) {
      learningRules.forEach(r => { userRules[r.palavra_chave] = r.categoria })
    }

    // ── Parseia o arquivo ──
    const transactions = await parseFile(fileBuffer, fileName, mimeType, userRules)

    if (!transactions.length) {
      return res.status(422).json({ error: 'Nenhuma transação encontrada no arquivo.' })
    }

    // ── Calcula totais ──
    const income  = transactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.value, 0)
    const expense = transactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.value, 0)
    const balance = income - expense

    const dates = transactions.map(t => t.date).sort()

    // ── Salva extrato ──
    const { data: extrato, error: extratoErr } = await supabase
      .from('extratos')
      .insert({
        usuario_id: userId,
        nome_arquivo: fileName,
        tipo_arquivo: fileName.split('.').pop().toLowerCase(),
        periodo_inicio: dates[0],
        periodo_fim: dates[dates.length - 1],
        total_entradas: income,
        total_saidas: expense,
        saldo: balance,
      })
      .select('id')
      .single()

    if (extratoErr) throw extratoErr

    // ── Salva transações em batch ──
    const txToInsert = transactions.map(t => ({
      usuario_id: userId,
      extrato_id: extrato.id,
      data: t.date,
      descricao: t.description,
      valor: t.value,
      tipo: t.type,
      categoria: t.category,
    }))

    // Insere em chunks de 500
    for (let i = 0; i < txToInsert.length; i += 500) {
      const chunk = txToInsert.slice(i, i + 500)
      const { error: txErr } = await supabase.from('transacoes').insert(chunk)
      if (txErr) throw txErr
    }

   // ── Incrementa contador de uploads ──
    await supabase.from('usuarios').update({ uploads_mes: (usuario?.uploads_mes || 0) + 1 }).eq('id', userId)
    })

    return res.status(200).json({
      extrato: { id: extrato.id, nome: fileName, income, expense, balance },
      transactions,
      count: transactions.length,
    })

  } catch (err) {
    console.error('[Upload]', err)
    return res.status(500).json({ error: err.message || 'Erro ao processar arquivo.' })
  }
})

 
