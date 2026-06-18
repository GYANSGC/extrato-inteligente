import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from './_app'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Alimentação', icon: '🍔', color: '#FF6B6B' },
  { name: 'Mercado', icon: '🛒', color: '#4ECDC4' },
  { name: 'Transporte', icon: '🚗', color: '#45B7D1' },
  { name: 'Combustível', icon: '⛽', color: '#96CEB4' },
  { name: 'Streaming', icon: '🎬', color: '#9B59B6' },
  { name: 'Assinaturas', icon: '📱', color: '#8E44AD' },
  { name: 'Moradia', icon: '🏠', color: '#E67E22' },
  { name: 'Energia', icon: '⚡', color: '#F1C40F' },
  { name: 'Internet', icon: '🌐', color: '#3498DB' },
  { name: 'Saúde', icon: '💊', color: '#E74C3C' },
  { name: 'Academia', icon: '💪', color: '#2ECC71' },
  { name: 'Educação', icon: '📚', color: '#1ABC9C' },
  { name: 'Compras', icon: '🛍️', color: '#E91E63' },
  { name: 'Lazer', icon: '🎮', color: '#FF9800' },
  { name: 'Restaurantes', icon: '🍽️', color: '#FF5722' },
  { name: 'Investimentos', icon: '📈', color: '#27AE60' },
  { name: 'Salário', icon: '💰', color: '#2ECC71' },
  { name: 'Transferências', icon: '↔️', color: '#95A5A6' },
  { name: 'Água', icon: '💧', color: '#5DADE2' },
  { name: 'Outros', icon: '📦', color: '#7F8C8D' },
]

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(v || 0))

const catInfo = (name) => CATEGORIES.find(c => c.name === name) || { color: '#7F8C8D', icon: '📦' }

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_TX = [
  { id: '1', date: '2025-05-01', descricao: 'SALÁRIO EMPRESA ABC', valor: 5800, tipo: 'entrada', categoria: 'Salário' },
  { id: '2', date: '2025-05-02', descricao: 'IFOOD PEDIDOS', valor: 42.50, tipo: 'saida', categoria: 'Alimentação' },
  { id: '3', date: '2025-05-02', descricao: 'UBER VIAGEM', valor: 18.90, tipo: 'saida', categoria: 'Transporte' },
  { id: '4', date: '2025-05-03', descricao: 'SUPERMERCADO CARREFOUR', valor: 215.80, tipo: 'saida', categoria: 'Mercado' },
  { id: '5', date: '2025-05-04', descricao: 'NETFLIX ASSINATURA', valor: 55.90, tipo: 'saida', categoria: 'Streaming' },
  { id: '6', date: '2025-05-05', descricao: 'SMART FIT ACADEMIA', valor: 99.90, tipo: 'saida', categoria: 'Academia' },
  { id: '7', date: '2025-05-06', descricao: 'POSTO IPIRANGA', valor: 180.00, tipo: 'saida', categoria: 'Combustível' },
  { id: '8', date: '2025-05-07', descricao: 'DROGASIL FARMACIA', valor: 65.40, tipo: 'saida', categoria: 'Saúde' },
  { id: '9', date: '2025-05-09', descricao: 'RESTAURANTE OUTBACK', valor: 120.00, tipo: 'saida', categoria: 'Restaurantes' },
  { id: '10', date: '2025-05-10', descricao: 'SPOTIFY PREMIUM', valor: 21.90, tipo: 'saida', categoria: 'Streaming' },
  { id: '11', date: '2025-05-11', descricao: 'IFOOD PIZZA', valor: 58.00, tipo: 'saida', categoria: 'Alimentação' },
  { id: '12', date: '2025-05-12', descricao: 'ENEL ENERGIA ELÉTRICA', valor: 145.00, tipo: 'saida', categoria: 'Energia' },
  { id: '13', date: '2025-05-13', descricao: 'SABESP ÁGUA', valor: 78.50, tipo: 'saida', categoria: 'Água' },
  { id: '14', date: '2025-05-15', descricao: 'FREELANCE CLIENTE XYZ', valor: 1200.00, tipo: 'entrada', categoria: 'Salário' },
  { id: '15', date: '2025-05-16', descricao: 'MERCADO LIVRE COMPRA', valor: 189.90, tipo: 'saida', categoria: 'Compras' },
  { id: '16', date: '2025-05-18', descricao: 'CINEMA SHOPPING', valor: 72.00, tipo: 'saida', categoria: 'Lazer' },
  { id: '17', date: '2025-05-19', descricao: 'CURSO UDEMY', valor: 49.90, tipo: 'saida', categoria: 'Educação' },
  { id: '18', date: '2025-05-20', descricao: 'ALUGUEL APARTAMENTO', valor: 1500.00, tipo: 'saida', categoria: 'Moradia' },
  { id: '19', date: '2025-05-21', descricao: 'VIVO INTERNET FIBRA', valor: 99.90, tipo: 'saida', categoria: 'Internet' },
  { id: '20', date: '2025-05-23', descricao: 'TESOURO DIRETO', valor: 500.00, tipo: 'saida', categoria: 'Investimentos' },
  { id: '21', date: '2025-05-24', descricao: 'SUPERMERCADO EXTRA', valor: 310.00, tipo: 'saida', categoria: 'Mercado' },
  { id: '22', date: '2025-05-26', descricao: 'RESTAURANTE PIZZA', valor: 88.00, tipo: 'saida', categoria: 'Restaurantes' },
  { id: '23', date: '2025-05-27', descricao: 'SHOPEE PRODUTO', valor: 67.50, tipo: 'saida', categoria: 'Compras' },
  { id: '24', date: '2025-05-29', descricao: 'IFOOD ACAI', valor: 52.00, tipo: 'saida', categoria: 'Alimentação' },
]

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function AppPage() {
  const { user, logout, authFetch } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('dashboard')
  const [transactions, setTransactions] = useState(DEMO_TX)
  const [goals, setGoals] = useState([
    { id: '1', nome: 'Reserva de Emergência', icone: '🛡️', valor_alvo: 15000, valor_atual: 4200 },
    { id: '2', nome: 'Viagem Europa', icone: '✈️', valor_alvo: 12000, valor_atual: 1800 },
    { id: '3', nome: 'Notebook Novo', icone: '💻', valor_alvo: 5000, valor_atual: 3500 },
  ])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [insights, setInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [chat, setChat] = useState([{ role: 'assistant', content: 'Olá! Sou o Finn, seu Consultor Financeiro IA 🤖\n\nPosso analisar seu extrato e responder perguntas como:\n• "Onde estou gastando mais?"\n• "Como economizar R$500/mês?"\n• "Quanto posso investir?"\n\nComo posso ajudar?' }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [filterCat, setFilterCat] = useState('todas')
  const [toast, setToast] = useState(null)
  const [goalForm, setGoalForm] = useState(null)
  const [isDemo, setIsDemo] = useState(true)
  const fileRef = useRef()
  const chatEndRef = useRef()

  useEffect(() => { if (!user) router.replace('/auth/login') }, [user])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])
  useEffect(() => { if (router.query.upgraded) showToast('⭐ Plano Pro ativado! Bem-vindo!', 'success') }, [router.query])

  // ── Financials ──
  const income = transactions.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
  const expense = transactions.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
  const balance = income - expense
  const savingsPct = income > 0 ? ((balance / income) * 100).toFixed(1) : '0.0'

  const catData = CATEGORIES.map(cat => {
    const total = transactions.filter(t => t.tipo === 'saida' && t.categoria === cat.name).reduce((s, t) => s + t.valor, 0)
    return { name: cat.name, value: total, color: cat.color, icon: cat.icon }
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  const lineData = (() => {
    const days = {}
    transactions.forEach(t => {
      const d = t.date?.slice(0, 10) || t.data?.slice(0, 10) || ''
      if (!d) return
      if (!days[d]) days[d] = { date: d.slice(5), receitas: 0, despesas: 0 }
      if (t.tipo === 'entrada') days[d].receitas += t.valor
      else days[d].despesas += t.valor
    })
    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date))
  })()

  const filtered = transactions
    .filter(t => {
      const desc = (t.descricao || t.description || '').toLowerCase()
      return (
        desc.includes(search.toLowerCase()) &&
        (filterType === 'todos' || t.tipo === filterType) &&
        (filterCat === 'todas' || t.categoria === filterCat)
      )
    })
    .sort((a, b) => (b.date || b.data || '').localeCompare(a.date || a.data || ''))

  // ── Toast ──
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ── File Upload ──
  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadError('')

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, fileBase64: base64 }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.upgrade) {
          showToast('⚠️ ' + data.error, 'warning')
        } else {
          setUploadError(data.error || 'Erro ao processar arquivo')
        }
      } else {
        // Normaliza field names
        const normalized = data.transactions.map((t, i) => ({
          id: t.id || String(i),
          date: t.date || t.data,
          descricao: t.description || t.descricao,
          valor: t.value || t.valor,
          tipo: t.type || t.tipo,
          categoria: t.category || t.categoria,
        }))
        setTransactions(normalized)
        setIsDemo(false)
        setInsights(null)
        showToast(`✅ ${data.count} transações importadas!`, 'success')
        setTab('dashboard')
        // Auto-generate insights
        generateInsights(normalized, data.extrato?.id)
      }
    } catch (err) {
      setUploadError('Erro ao ler o arquivo. Tente CSV ou OFX.')
    }

    setUploading(false)
    e.target.value = ''
  }

  // ── AI Insights ──
  const generateInsights = async (txns = transactions, extratoId = null) => {
    setInsightsLoading(true)
    setInsights(null)

    const inc = txns.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
    const exp = txns.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
    const bal = inc - exp
    const pct = inc > 0 ? ((bal / inc) * 100).toFixed(1) : 0
    const cats = CATEGORIES.map(c => {
      const total = txns.filter(t => t.tipo === 'saida' && t.categoria === c.name).reduce((s, t) => s + t.valor, 0)
      return total > 0 ? `${c.name}: R$${total.toFixed(0)}` : null
    }).filter(Boolean).join(', ')
    const topCat = catData[0]?.name || 'Outros'

    try {
      const res = await authFetch('/api/ai/insights', {

        method: 'POST',
        body: JSON.stringify({
          extratoId,
          financialData: { income: inc, expense: exp, balance: bal, savingsPct: pct, catSummary: cats, topCategory: topCat, txCount: txns.length }
        })
      })
      const data = await res.json()
      if (res.ok) setInsights(data.insights)
      else throw new Error(data.error)
    } catch {
      setInsights([
        `💡 Você gastou ${((expense / income) * 100).toFixed(0)}% da sua renda em despesas este mês.`,
        `🍔 Sua maior categoria foi ${catData[0]?.name || 'Outros'} com ${fmt(catData[0]?.value || 0)}.`,
        `💰 Você economizou ${savingsPct}% do que recebeu. Meta recomendada: 20%.`,
        `📊 Foram ${transactions.length} transações no período analisado.`,
        `🎯 Se reduzir 20% nos gastos variáveis, pode poupar até ${fmt(expense * 0.1)} extras por mês.`,
      ])
    }
    setInsightsLoading(false)
  }

  // ── AI Chat ──
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim()
    setChatInput('')
    const newMessages = [...chat, { role: 'user', content: msg }]
    setChat(newMessages)
    setChatLoading(true)

    if (user?.plano !== 'pro') {
      setChat(prev => [...prev, { role: 'assistant', content: '🔒 O Consultor Financeiro IA é exclusivo do plano Pro.\n\nFaça upgrade para conversar com a IA sobre seus dados financeiros!' }])
      setChatLoading(false)
      return
    }

    const cats = catData.slice(0, 8).map(c => `${c.name}: ${fmt(c.value)}`).join(', ')
    try {
      const res = await authFetch('/api/ai/chat', {  // rota dedicada
        method: 'POST',
        body: JSON.stringify({
          messages: newMessages.slice(-10),
          financialContext: { income, expense, balance, savingsPct, catSummary: cats }
        })
      })
      const data = await res.json()
      if (res.ok) {
        setChat(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setChat(prev => [...prev, { role: 'assistant', content: data.error || 'Erro ao processar.' }])
      }
    } catch {
      setChat(prev => [...prev, { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }])
    }
    setChatLoading(false)
  }

  // ── Category update ──
  const updateCategory = async (id, newCat) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, categoria: newCat } : t))
    if (!isDemo) {
      await authFetch('/api/transactions', {
        method: 'PATCH',
        body: JSON.stringify({ id, categoria: newCat })
      }).catch(console.error)
    }
  }

  // ── Goals ──
  const saveGoal = async (goalData) => {
    if (isDemo) {
      const newGoal = { id: String(Date.now()), ...goalData }
      if (goalData.id) {
        setGoals(prev => prev.map(g => g.id === goalData.id ? { ...g, ...goalData } : g))
      } else {
        setGoals(prev => [...prev, newGoal])
      }
    } else {
      const method = goalData.id ? 'PATCH' : 'POST'
      const res = await authFetch('/api/goals', { method, body: JSON.stringify(goalData) })
      const data = await res.json()
      if (res.ok) {
        if (goalData.id) setGoals(prev => prev.map(g => g.id === goalData.id ? data.goal : g))
        else setGoals(prev => [...prev, data.goal])
      }
    }
    setGoalForm(null)
    showToast('Meta salva!', 'success')
  }

  const deleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
    if (!isDemo) await authFetch(`/api/goals?id=${id}`, { method: 'DELETE' }).catch(console.error)
  }

  if (!user) return null

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Extrato', icon: '📋' },
    { id: 'charts', label: 'Gráficos', icon: '📈' },
    { id: 'goals', label: 'Metas', icon: '🎯' },
    { id: 'ai', label: 'Consultor IA', icon: '🤖' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060e1a' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#060e1af0', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 60, gap: 12
      }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#00D4FF,#0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💳</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, display: 'none' }} className="hide-mobile">Extrato<span style={{ color: '#00D4FF' }}>Inteligente</span></span>
          </div>
        </Link>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? '#1e293b' : 'transparent',
              color: tab === t.id ? '#00D4FF' : '#64748b',
              border: 'none', cursor: 'pointer', padding: '6px 12px',
              borderRadius: 8, fontSize: 13, fontWeight: 500,
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span>{t.icon}</span>
              <span style={{ display: 'none' }} className="show-md">{t.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Plan badge */}
          {user.plano === 'pro'
            ? <span style={{ fontSize: 11, background: '#00D4FF22', color: '#00D4FF', border: '1px solid #00D4FF33', borderRadius: 20, padding: '3px 10px', fontWeight: 700 }}>⭐ Pro</span>
            : <Link href="/precos"><span style={{ fontSize: 11, background: '#1e293b', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}>Upgrade</span></Link>
          }

          {/* Upload button */}
          <label>
            <input ref={fileRef} type="file" accept=".csv,.pdf,.ofx,.xlsx,.xls" onChange={handleFile} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} className="btn-primary" style={{ padding: '6px 14px', fontSize: 13 }} disabled={uploading}>
              {uploading ? '⏳' : '⬆'} {uploading ? 'Lendo...' : 'Importar'}
            </button>
          </label>

          {/* User menu */}
          <Link href="/perfil">
            <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, padding: '4px 6px', display: 'flex', alignItems: 'center' }} title="Perfil">
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00D4FF' }}>
                {user.nome?.[0]?.toUpperCase() || '?'}
              </div>
            </button>
          </Link>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 11, padding: '6px 4px' }} title="Sair">Sair</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {/* Demo banner */}
        {isDemo && (
          <div style={{ background: '#F59E0B11', border: '1px solid #F59E0B33', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#F59E0B' }}>📋 Você está vendo dados de demonstração. Importe seu extrato para ver sua análise real.</span>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept=".csv,.pdf,.ofx,.xlsx,.xls" onChange={handleFile} style={{ display: 'none' }} />
              <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Importar agora →</span>
            </label>
          </div>
        )}

        {uploadError && (
          <div style={{ background: '#EF444411', border: '1px solid #EF444433', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#EF4444' }}>
            ⚠️ {uploadError} <button onClick={() => setUploadError('')} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', marginLeft: 8 }}>✕</button>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="animate-in">
            <SectionHeader title="Visão Geral" sub="Maio 2025 • Análise completa do seu extrato" />

            {/* Stat cards */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              <StatCard label="Total Recebido" value={fmt(income)} sub="Receitas do período" color="#10B981" icon="💚" />
              <StatCard label="Total Gasto" value={fmt(expense)} sub="Despesas do período" color="#EF4444" icon="🔴" />
              <StatCard label="Saldo Final" value={fmt(balance)} sub={balance >= 0 ? 'Positivo ✓' : '⚠️ Negativo'} color={balance >= 0 ? '#00D4FF' : '#F59E0B'} icon="💎" />
              <StatCard label="Taxa de Economia" value={`${savingsPct}%`} sub={Number(savingsPct) >= 20 ? '✓ Meta atingida!' : 'Meta: 20%'} color="#A78BFA" icon="📊" />
            </div>

            {/* AI Insights */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>🤖 Insights da IA</h2>
                <button onClick={() => generateInsights()} className="btn-ghost" style={{ padding: '5px 14px', fontSize: 12 }}>↺ Atualizar</button>
              </div>
              {insightsLoading ? <LoadingDots label="Analisando com IA..." /> :
               insights ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {insights.map((ins, i) => (
                    <div key={i} style={{ background: '#060e1a', border: '1px solid #1e293b', borderLeft: '3px solid #00D4FF', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#cbd5e1', animation: `fadeIn 0.4s ease ${i * 0.07}s both` }}>
                      {ins}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <button onClick={() => generateInsights()} className="btn-primary" style={{ padding: '10px 24px' }}>✨ Gerar Insights com IA</button>
                </div>
              )}
            </div>

            {/* Mini charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#94a3b8' }}>Gastos por Categoria</h3>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={catData.slice(0, 7)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} strokeWidth={2} stroke="#060e1a">
                      {catData.slice(0, 7).map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CT />} />
                    <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#94a3b8' }}>Top Categorias</h3>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={catData.slice(0, 5)} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={85} axisLine={false} tickLine={false} />
                    <Tooltip content={<CT />} />
                    <Bar dataKey="value" radius={4}>
                      {catData.slice(0, 5).map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>Últimas Movimentações</h3>
                <button onClick={() => setTab('transactions')} style={{ background: 'none', border: 'none', color: '#00D4FF', fontSize: 12, cursor: 'pointer' }}>Ver todas →</button>
              </div>
              {transactions.slice(0, 6).map(t => <TxRow key={t.id} tx={t} onCatChange={updateCategory} compact />)}
            </div>

            {/* Upload zone */}
            <label style={{ display: 'block', marginTop: 20, cursor: 'pointer' }}>
              <input type="file" accept=".csv,.pdf,.ofx,.xlsx,.xls" onChange={handleFile} style={{ display: 'none' }} />
              <div style={{
                border: '2px dashed #1e293b', borderRadius: 14, padding: 24,
                textAlign: 'center', transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#00D4FF44'; e.currentTarget.style.background = '#00D4FF05' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                <p style={{ fontSize: 13, color: '#64748b' }}>Arraste seu extrato ou <span style={{ color: '#00D4FF' }}>clique aqui</span></p>
                <p style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>PDF, OFX, CSV, Excel • Máx. 10MB • Dados protegidos</p>
              </div>
            </label>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab === 'transactions' && (
          <div className="animate-in">
            <SectionHeader title="Extrato Completo" sub={`${filtered.length} transações`} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar transação..." className="input-field" style={{ flex: 2, minWidth: 160 }} />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field" style={{ flex: 1, minWidth: 120, cursor: 'pointer' }}>
                <option value="todos">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="saida">Saídas</option>
              </select>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input-field" style={{ flex: 1, minWidth: 140, cursor: 'pointer' }}>
                <option value="todas">Todas categorias</option>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#060e1a' }}>
                      {['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} style={{ borderTop: '1px solid #1e293b' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0f172a80'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '11px 16px', fontSize: 12, color: '#64748b', fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}>{(t.date || t.data || '').slice(0, 10)}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13, maxWidth: 220 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descricao || t.description}</div>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <select value={t.categoria} onChange={e => updateCategory(t.id, e.target.value)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: catInfo(t.categoria).color }}>
                            {CATEGORIES.map(c => <option key={c.name} value={c.name} style={{ background: '#0f172a' }}>{c.icon} {c.name}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: t.tipo === 'entrada' ? '#10B98122' : '#EF444422', color: t.tipo === 'entrada' ? '#10B981' : '#EF4444' }}>
                            {t.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 16px', fontWeight: 700, fontSize: 14, fontFamily: "'DM Mono',monospace", color: t.tipo === 'entrada' ? '#10B981' : '#EF4444', whiteSpace: 'nowrap' }}>
                          {t.tipo === 'entrada' ? '+' : '-'}{fmt(t.valor)}
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Nenhuma transação encontrada</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CHARTS ── */}
        {tab === 'charts' && (
          <div className="animate-in">
            <SectionHeader title="Análise Gráfica" sub="Visualize seus padrões financeiros" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#94a3b8' }}>🍕 Distribuição de Gastos</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={45} strokeWidth={2} stroke="#060e1a">
                      {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CT />} />
                    <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#94a3b8' }}>📊 Maiores Gastos</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={catData.slice(0, 7)}>
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} />
                    <Tooltip content={<CT />} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                      {catData.slice(0, 7).map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#94a3b8' }}>📈 Evolução Financeira no Mês</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData}>
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip content={<CT />} />
                  <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v === 'receitas' ? 'Receitas' : 'Despesas'}</span>} />
                  <Line type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={2.5} dot={false} name="receitas" />
                  <Line type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={2.5} dot={false} name="despesas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#94a3b8' }}>Detalhamento por Categoria</h3>
              {catData.map(cat => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13 }}>{cat.name}</span>
                      <span style={{ fontSize: 13, color: cat.color, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{fmt(cat.value)}</span>
                    </div>
                    <div style={{ height: 6, background: '#1e293b', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${(cat.value / expense * 100).toFixed(0)}%`, background: cat.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#475569', width: 34, textAlign: 'right' }}>{(cat.value / expense * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GOALS ── */}
        {tab === 'goals' && (
          <div className="animate-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <SectionHeader title="Metas Financeiras" sub="Acompanhe seus objetivos" noMargin />
              <button onClick={() => setGoalForm({ nome: '', icone: '🎯', valor_alvo: '', valor_atual: '' })} className="btn-primary">+ Nova Meta</button>
            </div>

            {goalForm && (
              <div className="card" style={{ marginBottom: 20, borderColor: '#00D4FF33' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{goalForm.id ? 'Editar Meta' : 'Nova Meta'}</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input value={goalForm.icone} onChange={e => setGoalForm(p => ({ ...p, icone: e.target.value }))} placeholder="🎯" className="input-field" style={{ width: 60, textAlign: 'center', fontSize: 20 }} />
                  <input value={goalForm.nome} onChange={e => setGoalForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome da meta (ex: Viagem)" className="input-field" style={{ flex: 2, minWidth: 140 }} />
                  <input type="number" value={goalForm.valor_alvo} onChange={e => setGoalForm(p => ({ ...p, valor_alvo: e.target.value }))} placeholder="Valor alvo (R$)" className="input-field" style={{ flex: 1, minWidth: 120 }} />
                  <input type="number" value={goalForm.valor_atual} onChange={e => setGoalForm(p => ({ ...p, valor_atual: e.target.value }))} placeholder="Já guardou (R$)" className="input-field" style={{ flex: 1, minWidth: 120 }} />
                  <button onClick={() => saveGoal({ ...goalForm, valor_alvo: parseFloat(goalForm.valor_alvo), valor_atual: parseFloat(goalForm.valor_atual || 0) })} className="btn-primary">Salvar</button>
                  <button onClick={() => setGoalForm(null)} className="btn-ghost">Cancelar</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
              {goals.map(goal => {
                const pct = Math.min(100, (goal.valor_atual / goal.valor_alvo * 100))
                const remaining = goal.valor_alvo - goal.valor_atual
                const months = balance > 0 ? Math.ceil(remaining / balance) : null
                return (
                  <div key={goal.id} className="card" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
                      <button onClick={() => setGoalForm(goal)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 14 }}>✏️</button>
                      <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 14 }}>✕</button>
                    </div>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{goal.icone}</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{goal.nome}</h3>
                    <p style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>
                      {fmt(goal.valor_atual)} de {fmt(goal.valor_alvo)} • Falta {fmt(remaining)}
                    </p>
                    <div style={{ height: 10, background: '#1e293b', borderRadius: 5, marginBottom: 12 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#00D4FF,#0066FF)', borderRadius: 5, transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: 30, fontWeight: 800, color: '#00D4FF', fontFamily: "'DM Mono',monospace" }}>{pct.toFixed(0)}%</span>
                      {months && <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#475569' }}>Estimativa</div>
                        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{months} {months === 1 ? 'mês' : 'meses'}</div>
                      </div>}
                    </div>
                    {pct >= 100 && <div style={{ marginTop: 12, background: '#10B98122', border: '1px solid #10B98144', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#10B981', textAlign: 'center' }}>🎉 Meta atingida!</div>}
                  </div>
                )
              })}
              {!goals.length && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#475569' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                <p>Crie sua primeira meta financeira!</p>
              </div>}
            </div>
          </div>
        )}

        {/* ── AI CHAT ── */}
        {tab === 'ai' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
            <SectionHeader title="🤖 Consultor Financeiro IA" sub="Finn analisa seus dados e responde suas dúvidas financeiras" />

            {user?.plano !== 'pro' && (
              <div style={{ background: '#F59E0B11', border: '1px solid #F59E0B33', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#F59E0B' }}>🔒 O chat com IA é exclusivo do plano Pro. Você pode ver a interface, mas precisa de Pro para conversar.</span>
                <Link href="/precos"><button className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>Ver planos ⭐</button></Link>
              </div>
            )}

            {/* Quick prompts */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {['Onde estou gastando mais?', 'Como economizar R$500/mês?', 'Quanto gasto com delivery?', 'Quanto posso investir?', 'Analise meu perfil financeiro'].map(p => (
                <button key={p} onClick={() => setChatInput(p)} style={{ background: '#0f172a', border: '1px solid #1e293b', color: '#94a3b8', borderRadius: 20, padding: '6px 14px', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.target.style.borderColor = '#00D4FF44'; e.target.style.color = '#00D4FF' }}
                  onMouseLeave={e => { e.target.style.borderColor = '#1e293b'; e.target.style.color = '#94a3b8' }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 12 }}>
              {chat.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    maxWidth: '82%', padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? '#00D4FF1a' : '#1e293b',
                    border: `1px solid ${msg.role === 'user' ? '#00D4FF33' : '#334155'}`,
                    fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap'
                  }}>
                    {msg.role === 'assistant' && <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 700, marginBottom: 6 }}>🤖 Finn — Consultor IA</div>}
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && <div style={{ display: 'flex', gap: 5, padding: '6px 14px' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: `pulse 1s ease ${i * 0.2}s infinite` }} />)}
              </div>}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()} placeholder="Pergunte algo sobre suas finanças..." className="input-field" style={{ flex: 1, padding: '12px 16px', borderRadius: 12 }} />
              <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} className="btn-primary" style={{ padding: '0 24px', fontSize: 20, borderRadius: 12, minWidth: 56 }}>↑</button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ borderColor: toast.type === 'success' ? '#10B98144' : toast.type === 'warning' ? '#F59E0B44' : '#1e293b' }}>
          <span style={{ flex: 1 }}>{toast.msg}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ title, sub, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 24 }}>
      <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800 }}>{title}</h1>
      {sub && <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', border: `1px solid ${color}33`, borderRadius: 16, padding: '18px 22px', flex: 1, minWidth: 150, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color + '12' }} />
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ color, fontSize: 20, fontWeight: 800, marginTop: 3, fontFamily: "'DM Mono',monospace" }}>{value}</div>
      {sub && <div style={{ color: '#475569', fontSize: 11, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function TxRow({ tx, onCatChange, compact }) {
  const cat = catInfo(tx.categoria)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 8px', borderRadius: 8, transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 18 }}>{cat.icon}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.descricao || tx.description}</div>
          <div style={{ fontSize: 11, color: '#475569' }}>{(tx.date || tx.data || '').slice(0, 10)} • {tx.categoria}</div>
        </div>
      </div>
      <div style={{ color: tx.tipo === 'entrada' ? '#10B981' : '#EF4444', fontWeight: 700, fontSize: 14, fontFamily: "'DM Mono',monospace" }}>
        {tx.tipo === 'entrada' ? '+' : '-'}{fmt(tx.valor)}
      </div>
    </div>
  )
}

function CT({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '9px 13px' }}>
      {label && <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color || '#00D4FF', fontWeight: 700, fontSize: 13 }}>{fmt(p.value)}</p>)}
    </div>
  )
}

function LoadingDots({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 28 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
      </div>
      {label && <p style={{ color: '#475569', fontSize: 13 }}>{label}</p>}
    </div>
  )
}
