import Papa from 'papaparse'

// ─── Regras de categorização ─────────────────────────────────────────────────
const CATEGORY_RULES = [
  { keywords: ['ifood','rappi','delivery','uber eats','james','aiqfome','zé delivery'], category: 'Alimentação' },
  { keywords: ['mercado','supermercado','extra ','carrefour','pao de acucar','atacado','hortifruti','sacolao','dia %','assai'], category: 'Mercado' },
  { keywords: ['uber','99 ','taxi','cabify','onibus','metro','bilhete único','brt','stm'], category: 'Transporte' },
  { keywords: ['posto','combustivel','gasolina','shell','ipiranga','br distribui','petroleo','alcool'], category: 'Combustível' },
  { keywords: ['netflix','disney','hbo','youtube premium','globoplay','apple tv','paramount','star+'], category: 'Streaming' },
  { keywords: ['spotify','deezer','apple music','tidal','amazon music'], category: 'Streaming' },
  { keywords: ['assinatura','subscription','mensalidade recorrente'], category: 'Assinaturas' },
  { keywords: ['aluguel','condominio','iptu','habitacao','moradia'], category: 'Moradia' },
  { keywords: ['energia','eletrica','cemig','copel','cpfl','coelba','celpe','light ','enel','elektro'], category: 'Energia' },
  { keywords: ['internet','vivo fibra','claro net','tim live','oi fibra','net combo','banda larga'], category: 'Internet' },
  { keywords: ['vivo ','claro ','tim ','oi '], category: 'Internet' },
  { keywords: ['farmacia','drogaria','medico','hospital','clinica','laboratorio','exame','drogasil','ultrafarma','pacheco','raia','nissei'], category: 'Saúde' },
  { keywords: ['smart fit','academia','gym ','crossfit','bluefit','treino','bodytech'], category: 'Academia' },
  { keywords: ['escola','faculdade','curso','udemy','coursera','alura','universidade','colegio','duolingo','rocketseat'], category: 'Educação' },
  { keywords: ['mercado livre','shopee','amazon','magalu','magazine','americanas','casas bahia','submarino','aliexpress','shein'], category: 'Compras' },
  { keywords: ['cinema','teatro','show ','ingresso','jogo ','evento','lazer','parque','playstation','xbox','steam ','nintendo'], category: 'Lazer' },
  { keywords: ['restaurante','lanchonete','pizzaria','hamburger','sushi','churrasco','bar ','choperia','padaria','confeitaria'], category: 'Restaurantes' },
  { keywords: ['investimento','tesouro direto','acoes','cdb','fundo','xp ','rico ','clear ','btg','nuinvest','aplicacao','previdencia'], category: 'Investimentos' },
  { keywords: ['salario','pagamento','prolabore','remuneracao','holerite','folha'], category: 'Salário' },
  { keywords: ['pix ','ted ','doc ','transferencia','transf '], category: 'Transferências' },
  { keywords: ['sabesp','caesb','copasa','saneago','embasa','compesa','sanepar'], category: 'Água' },
]

export function classifyTransaction(description, userRules = {}) {
  const lower = description.toLowerCase()
  // Aprendizado do usuário tem prioridade
  for (const [keyword, category] of Object.entries(userRules)) {
    if (lower.includes(keyword)) return category
  }
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.category
  }
  return 'Outros'
}

// ─── Parser CSV ──────────────────────────────────────────────────────────────
export function parseCSV(content, userRules = {}) {
  const result = Papa.parse(content.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  const rows = result.data
  if (!rows.length) throw new Error('CSV vazio ou inválido')

  const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim())

  // Detecta colunas automaticamente por nome
  const findCol = (names) => {
    for (const name of names) {
      const found = headers.find(h => h.includes(name))
      if (found) return Object.keys(rows[0])[headers.indexOf(found)]
    }
    return null
  }

  const dateCol = findCol(['data', 'date', 'dt', 'vencimento'])
  const descCol = findCol(['descricao', 'descrição', 'historico', 'memo', 'description', 'lancamento'])
  const valCol  = findCol(['valor', 'value', 'amount', 'montante', 'debito', 'credito'])
  const typeCol = findCol(['tipo', 'type', 'natureza', 'd/c'])

  if (!dateCol || !descCol || !valCol) {
    // Fallback: assume posição
    return rows.map((row, i) => {
      const vals = Object.values(row)
      const rawVal = parseFloat(String(vals[2] || vals[1] || 0).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0
      return normalize(i, vals[0], vals[1], rawVal, null, userRules)
    }).filter(t => t.value !== 0)
  }

  return rows.map((row, i) => {
    const rawVal = String(row[valCol] || '0')
      .replace(/[^\d.,-]/g, '')
      .replace(',', '.')
    const value = parseFloat(rawVal) || 0
    return normalize(i, row[dateCol], row[descCol], value, row[typeCol], userRules)
  }).filter(t => t.value !== 0)
}

// ─── Parser OFX ──────────────────────────────────────────────────────────────
export function parseOFX(content, userRules = {}) {
  const transactions = []
  const txRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match

  while ((match = txRegex.exec(content)) !== null) {
    const block = match[1]
    const get = (tag) => {
      const m = new RegExp(`<${tag}>([^<\n\r]+)`, 'i').exec(block)
      return m ? m[1].trim() : ''
    }

    const dtRaw = get('DTPOSTED') || get('DTAVAIL') || ''
    const date = dtRaw
      ? `${dtRaw.slice(0,4)}-${dtRaw.slice(4,6)}-${dtRaw.slice(6,8)}`
      : new Date().toISOString().slice(0,10)

    const rawVal = parseFloat(get('TRNAMT') || '0') || 0
    const desc = get('MEMO') || get('NAME') || get('FITID') || 'Transação OFX'

    if (rawVal !== 0) {
      transactions.push(normalize(transactions.length, date, desc, rawVal, null, userRules))
    }
  }

  if (!transactions.length) throw new Error('Nenhuma transação encontrada no OFX')
  return transactions
}

// ─── Parser XLSX (server-side) ───────────────────────────────────────────────
export async function parseXLSX(buffer, userRules = {}) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  if (rows.length < 2) throw new Error('Planilha vazia')

  // Detecta linha de cabeçalho
  const headerRow = rows.findIndex(row =>
    row.some(cell => /data|date|descri|valor|amount/i.test(String(cell)))
  )
  const startRow = headerRow >= 0 ? headerRow + 1 : 1
  const headers = (rows[headerRow >= 0 ? headerRow : 0] || []).map(h => String(h).toLowerCase())

  const findIdx = (names) => {
    for (const name of names) {
      const idx = headers.findIndex(h => h.includes(name))
      if (idx >= 0) return idx
    }
    return -1
  }

  const dateIdx = findIdx(['data','date','dt'])
  const descIdx = findIdx(['descri','memo','historico','lancamento'])
  const valIdx  = findIdx(['valor','value','amount','montante'])

  const transactions = []
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every(c => !c)) continue

    const rawDate = row[dateIdx >= 0 ? dateIdx : 0]
    const desc    = String(row[descIdx >= 0 ? descIdx : 1] || '').trim()
    const rawVal  = row[valIdx >= 0 ? valIdx : 2]

    if (!desc) continue

    let date = new Date().toISOString().slice(0,10)
    if (rawDate instanceof Date) {
      date = rawDate.toISOString().slice(0,10)
    } else if (typeof rawDate === 'number') {
      const d = XLSX.SSF.parse_date_code(rawDate)
      date = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
    } else if (typeof rawDate === 'string' && rawDate) {
      const parts = rawDate.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
      if (parts) date = `${parts[3]}-${parts[2]}-${parts[1]}`
    }

    const value = parseFloat(String(rawVal || '0').replace(/[^\d.,-]/g, '').replace(',', '.')) || 0
    if (value !== 0) {
      transactions.push(normalize(i, date, desc, value, null, userRules))
    }
  }

  if (!transactions.length) throw new Error('Nenhuma transação encontrada na planilha')
  return transactions
}

// ─── Parser PDF (extrai texto e tenta interpretar) ────────────────────────────
export async function parsePDF(buffer, userRules = {}) {
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  const text = data.text

  const transactions = []
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Padrão brasileiro: DD/MM/YYYY ... R$ X.XXX,XX ou valor no final
  const patterns = [
    // Nubank / Inter / C6: "01/05/2025   IFOOD*PEDIDO   -R$ 42,50"
    /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([-+]?R?\$?\s*[\d.]+,\d{2})\s*$/,
    // Bradesco / Itaú: "01/05    COMPRA DÉBITO IFOOD     42,50"
    /(\d{2}\/\d{2})\s+(.+?)\s+([-+]?[\d.]+,\d{2})\s*$/,
    // Santander: "01/05/2025    42,50    IFOOD PAGAMENTOS"
    /(\d{2}\/\d{2}\/(?:\d{4}|\d{2}))\s+([-+]?[\d.,]+)\s+(.+)/,
  ]

  const currentYear = new Date().getFullYear()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let parsed = null

    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        let date, desc, rawVal

        if (pattern === patterns[2]) {
          [, date, rawVal, desc] = match
        } else {
          [, date, desc, rawVal] = match
        }

        // Normaliza data
        if (date.length === 5) date = `${date}/${currentYear}`
        const parts = date.match(/(\d{2})\/(\d{2})\/(\d{4})/)
        const isoDate = parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : new Date().toISOString().slice(0,10)

        // Normaliza valor
        const cleanVal = String(rawVal).replace(/R?\$\s*/i, '').replace(/\./g, '').replace(',', '.').trim()
        const value = parseFloat(cleanVal) || 0

        if (value !== 0 && desc.trim().length > 2) {
          parsed = normalize(transactions.length, isoDate, desc.trim(), value, null, userRules)
        }
        break
      }
    }

    if (parsed) transactions.push(parsed)
  }

  if (transactions.length < 2) {
    throw new Error(
      'Não conseguimos ler este PDF automaticamente. ' +
      'Por favor, exporte o extrato em CSV ou OFX pelo aplicativo do seu banco.'
    )
  }

  return transactions
}

// ─── Normalizador universal ───────────────────────────────────────────────────
function normalize(index, date, description, value, typeHint, userRules) {
  // Infere tipo pelo sinal ou hint
  let tipo
  if (typeHint) {
    const t = String(typeHint).toLowerCase()
    tipo = (t.includes('c') || t.includes('entrada') || t.includes('cred')) ? 'entrada' : 'saida'
  } else {
    tipo = value >= 0 ? 'entrada' : 'saida'
  }

  const absValue = Math.abs(value)

  // Normaliza data
  let isoDate = new Date().toISOString().slice(0,10)
  if (date) {
    const d = new Date(date)
    if (!isNaN(d)) isoDate = d.toISOString().slice(0,10)
  }

  return {
    id: `tx_${index}_${Date.now()}`,
    date: isoDate,
    description: String(description).trim().substring(0, 200),
    value: absValue,
    type: tipo,
    category: classifyTransaction(String(description), userRules),
  }
}

// ─── Dispatcher principal ─────────────────────────────────────────────────────
export async function parseFile(fileBuffer, fileName, mimeType, userRules = {}) {
  const ext = fileName.split('.').pop().toLowerCase()
  const mime = (mimeType || '').toLowerCase()

  if (ext === 'csv' || mime.includes('csv') || mime.includes('text/plain')) {
    const text = Buffer.isBuffer(fileBuffer)
      ? fileBuffer.toString('utf-8')
      : fileBuffer
    return parseCSV(text, userRules)
  }

  if (ext === 'ofx' || ext === 'qfx' || mime.includes('ofx')) {
    const text = Buffer.isBuffer(fileBuffer)
      ? fileBuffer.toString('utf-8')
      : fileBuffer
    return parseOFX(text, userRules)
  }

  if (ext === 'xlsx' || ext === 'xls' || mime.includes('spreadsheet') || mime.includes('excel')) {
    const buf = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer)
    return parseXLSX(buf, userRules)
  }

  if (ext === 'pdf' || mime.includes('pdf')) {
    const buf = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer)
    return parsePDF(buf, userRules)
  }

  throw new Error(`Formato não suportado: ${ext}. Use CSV, OFX, XLSX ou PDF.`)
}
