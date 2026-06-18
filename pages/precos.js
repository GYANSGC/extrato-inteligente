import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from './_app'

export default function Precos() {
  const { user, authFetch } = useAuth()
  const [interval, setInterval] = useState('monthly')
  const [loading, setLoading] = useState(null)

  const handleCheckout = async (plan) => {
    if (plan === 'free') {
      window.location.href = user ? '/app' : '/auth/register'
      return
    }
    if (!user) {
      window.location.href = '/auth/register'
      return
    }
    setLoading(plan)
    try {
      const res = await authFetch('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ interval }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      alert('Erro ao redirecionar para pagamento. Tente novamente.')
    }
    setLoading(null)
  }

  const price = interval === 'yearly' ? 'R$14' : 'R$19'
  const period = interval === 'yearly' ? '/mês (cobrado anualmente)' : '/mês'
  const savings = interval === 'yearly' ? ' • 26% de desconto' : ''

  return (
    <div style={{ minHeight: '100vh', background: '#060e1a' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 70, borderBottom: '1px solid #1e293b1a' }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#00D4FF,#0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>💳</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>Extrato<span style={{ color: '#00D4FF' }}>Inteligente</span></span>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          {user ? <Link href="/app"><button className="btn-primary">Ir para o app</button></Link> : (
            <>
              <Link href="/auth/login"><button className="btn-ghost">Entrar</button></Link>
              <Link href="/auth/register"><button className="btn-primary">Criar conta</button></Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 44, fontWeight: 800, marginBottom: 16 }}>
            Planos <span style={{ color: '#00D4FF' }}>simples e transparentes</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, marginBottom: 36 }}>
            Comece grátis. Faça upgrade quando precisar de mais.
          </p>

          {/* Interval toggle */}
          <div style={{ display: 'inline-flex', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 4, gap: 4 }}>
            <button onClick={() => setInterval('monthly')} style={{ background: interval === 'monthly' ? '#1e293b' : 'transparent', border: 'none', color: interval === 'monthly' ? '#e2e8f0' : '#475569', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}>Mensal</button>
            <button onClick={() => setInterval('yearly')} style={{ background: interval === 'yearly' ? '#1e293b' : 'transparent', border: 'none', color: interval === 'yearly' ? '#e2e8f0' : '#475569', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              Anual {interval === 'yearly' && <span style={{ background: '#10B98122', color: '#10B981', fontSize: 10, padding: '1px 7px', borderRadius: 20, fontWeight: 700 }}>-26%</span>}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Free */}
          <div className="card" style={{ padding: 36 }}>
            <div style={{ marginBottom: 4, fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Grátis</div>
            <div style={{ fontSize: 44, fontFamily: "'Syne',sans-serif", fontWeight: 800, margin: '8px 0 4px' }}>R$0<span style={{ fontSize: 16, color: '#64748b', fontFamily: "'DM Sans',sans-serif" }}> para sempre</span></div>
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Perfeito para começar a organizar suas finanças pessoais.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                ['✅', '3 extratos por mês'],
                ['✅', 'PDF, CSV, OFX, Excel'],
                ['✅', 'Categorização com IA'],
                ['✅', 'Dashboard completo'],
                ['✅', 'Gráficos interativos'],
                ['✅', 'Metas financeiras'],
                ['❌', 'Consultor IA (chat)'],
                ['❌', 'Histórico completo'],
                ['❌', 'Exportação de relatórios'],
              ].map(([icon, text], i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: icon === '❌' ? '#334155' : '#94a3b8' }}>
                  <span>{icon}</span>{text}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout('free')} className="btn-ghost" style={{ width: '100%', padding: 13 }}>
              {user ? 'Continuar no Grátis' : 'Começar grátis'}
            </button>
          </div>

          {/* Pro */}
          <div style={{ background: 'linear-gradient(135deg,#00D4FF08,#0066FF08)', border: '1px solid #00D4FF44', borderRadius: 16, padding: 36, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#00D4FF,#0066FF)', borderRadius: 20, padding: '5px 20px', fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
              ⭐ MAIS POPULAR
            </div>
            <div style={{ marginBottom: 4, fontSize: 13, color: '#00D4FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Pro</div>
            <div style={{ fontSize: 44, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#00D4FF', margin: '8px 0 4px' }}>
              {price}<span style={{ fontSize: 16, color: '#64748b', fontFamily: "'DM Sans',sans-serif" }}>{period}</span>
            </div>
            {savings && <div style={{ fontSize: 12, color: '#10B981', marginBottom: 4, fontWeight: 600 }}>{savings}</div>}
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Para quem quer controle financeiro completo com o poder da IA.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                ['✅', 'Extratos ilimitados'],
                ['✅', 'PDF, CSV, OFX, Excel'],
                ['✅', 'Categorização com IA'],
                ['✅', 'Dashboard completo'],
                ['✅', 'Gráficos interativos'],
                ['✅', 'Metas financeiras'],
                ['✅', 'Consultor Financeiro IA (chat)'],
                ['✅', 'Histórico de 24 meses'],
                ['✅', 'Comparação mensal'],
                ['✅', 'Exportação de relatórios'],
                ['✅', 'Suporte prioritário por email'],
              ].map(([icon, text], i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#94a3b8' }}>
                  <span>{icon}</span>{text}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout('pro')} disabled={loading === 'pro' || user?.plano === 'pro'} className="btn-primary" style={{ width: '100%', padding: 13, fontSize: 15, boxShadow: '0 8px 30px #00D4FF33' }}>
              {user?.plano === 'pro' ? '✓ Plano Atual' : loading === 'pro' ? 'Redirecionando...' : 'Assinar Pro →'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#334155' }}>Cancele quando quiser • Sem fidelidade</p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 70 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, textAlign: 'center', marginBottom: 36 }}>Perguntas frequentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Meus dados financeiros são seguros?', 'Sim. Usamos criptografia AES-256 em trânsito e em repouso, HTTPS obrigatório, e seguimos rigorosamente a LGPD. Seus dados nunca são compartilhados ou vendidos.'],
              ['Posso cancelar quando quiser?', 'Sim, sem burocracia. Cancele a qualquer momento pelo painel e você manterá o acesso Pro até o fim do período já pago.'],
              ['Quais bancos são suportados?', 'Todos os bancos brasileiros que exportam em CSV, OFX ou PDF. Nubank, Itaú, Bradesco, Santander, C6, Inter, Caixa, BB, BTG, XP, e muitos outros.'],
              ['O que acontece se eu ultrapassar o limite do plano grátis?', 'Você recebe um aviso e pode continuar usando os extratos já importados, mas novos uploads ficarão bloqueados até o próximo mês ou até fazer upgrade.'],
              ['Tem versão para empresa?', 'No momento oferecemos apenas planos para pessoa física. Entre em contato para soluções empresariais customizadas.'],
            ].map(([q, a]) => (
              <details key={q} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '16px 20px', cursor: 'pointer' }}>
                <summary style={{ fontSize: 15, fontWeight: 600, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {q} <span style={{ color: '#475569' }}>+</span>
                </summary>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #1e293b', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: '#334155', fontSize: 12 }}>© {new Date().getFullYear()} Extrato Inteligente</p>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#334155' }}>
          <Link href="/termos">Termos</Link>
          <Link href="/privacidade">Privacidade</Link>
        </div>
      </footer>
    </div>
  )
}
