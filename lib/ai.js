// ─── Serviço de IA — SERVIDOR APENAS ─────────────────────────────────────────
// A chave da API nunca sai do backend. O frontend chama /api/ai/*

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(system, messages, maxTokens = 1000) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada no servidor.')
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.content?.map(b => b.text || '').join('') || ''
}

// ─── Geração de insights ──────────────────────────────────────────────────────
export async function generateInsights(financialData) {
  const { income, expense, balance, savingsPct, catSummary, topCategory, txCount } = financialData

  const system = `Você é um consultor financeiro expert brasileiro. Analise os dados do extrato bancário e gere exatamente 5 insights financeiros práticos, personalizados e acionáveis em português brasileiro.

REGRAS:
- Use valores reais dos dados fornecidos
- Seja específico e direto, sem evasivas
- Use emojis para tornar visual
- Inclua pelo menos 1 dica prática com valor em reais
- Retorne APENAS JSON válido, sem markdown, sem texto extra

FORMATO: {"insights": ["insight1", "insight2", "insight3", "insight4", "insight5"]}`

  const userMsg = `Dados do extrato:
- Receita total: R$${income.toFixed(2)}
- Despesas totais: R$${expense.toFixed(2)}
- Saldo: R$${balance.toFixed(2)}
- Taxa de economia: ${savingsPct}%
- Total de transações: ${txCount}
- Maior categoria de gasto: ${topCategory}
- Gastos por categoria: ${catSummary}`

  const text = await callClaude(system, [{ role: 'user', content: userMsg }], 800)
  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  return parsed.insights || []
}

// ─── Classificação de transação ───────────────────────────────────────────────
export async function classifyWithAI(description) {
  const categories = [
    'Alimentação','Mercado','Transporte','Combustível','Streaming','Assinaturas',
    'Moradia','Energia','Internet','Saúde','Academia','Educação','Compras',
    'Lazer','Restaurantes','Investimentos','Salário','Transferências','Água','Outros'
  ]

  const system = `Você é um classificador de transações bancárias brasileiras. Classifique a transação informada em UMA das categorias listadas.
Responda APENAS com o nome exato da categoria, sem pontuação, sem explicação.
Categorias: ${categories.join(', ')}`

  const text = await callClaude(system, [{ role: 'user', content: description }], 20)
  const cat = text.trim()
  return categories.includes(cat) ? cat : 'Outros'
}

// ─── Chat com contexto financeiro ─────────────────────────────────────────────
export async function chatWithAdvisor(messages, financialContext) {
  const { income, expense, balance, savingsPct, catSummary } = financialContext

  const system = `Você é um consultor financeiro pessoal chamado "Finn", especializado em finanças pessoais brasileiras. 
Você tem acesso aos dados financeiros do usuário e responde de forma amigável, direta e prática.

DADOS FINANCEIROS DO USUÁRIO:
- Receita mensal: R$${income.toFixed(2)}
- Despesas totais: R$${expense.toFixed(2)}
- Saldo: R$${balance.toFixed(2)}
- Taxa de economia: ${savingsPct}%
- Gastos por categoria: ${catSummary}

REGRAS:
- Responda em português brasileiro
- Seja direto e prático, máximo 3 parágrafos
- Use os dados reais do usuário nas respostas
- Use emojis para deixar mais visual
- Quando relevante, dê valores concretos e metas específicas
- Não invente dados que não foram fornecidos`

  return callClaude(system, messages, 800)
}

// ─── Geração de relatório PDF textual ────────────────────────────────────────
export async function generateReportSummary(financialData) {
  const system = `Você é um analista financeiro. Gere um relatório executivo conciso de análise financeira pessoal em português brasileiro. 
Use linguagem profissional mas acessível. Máximo 400 palavras. Estruture com: Resumo, Pontos Positivos, Pontos de Atenção, Recomendações.`

  const userMsg = `Dados: Receita R$${financialData.income.toFixed(2)}, Despesas R$${financialData.expense.toFixed(2)}, Saldo R$${financialData.balance.toFixed(2)}, Economia ${financialData.savingsPct}%. Categorias: ${financialData.catSummary}`

  return callClaude(system, [{ role: 'user', content: userMsg }], 600)
}
