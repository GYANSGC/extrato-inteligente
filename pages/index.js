import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from './_app'

export default function Landing() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.replace('/app')
  }, [user])

  return (
    <div style={{ minHeight: '100vh', background: '#060e1a', overflowX: 'hidden' }}>
      {/* ── NAV ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 70, position: 'sticky', top: 0, zIndex: 100,
        background: '#060e1acc', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1e293b1a'
      }}>
        <Logo />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/auth/login"><button className="btn-ghost" style={{ padding: '8px 20px' }}>Entrar</button></Link>
          <Link href="/auth/register"><button className="btn-primary" style={{ padding: '8px 20px' }}>Criar conta grátis</button></Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', position: 'relative' }}>
        <Glow />
        <div className="animate-in" style={{ animationDelay: '0s' }}>
          <Pill>✨ Powered by Claude AI • Análise em segundos</Pill>
        </div>
        <h1 className="animate-in" style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(38px, 6.5vw, 76px)',
          fontWeight: 800, lineHeight: 1.08,
          margin: '28px auto 24px', maxWidth: 860,
          animationDelay: '0.08s'
        }}>
          Seu extrato bancário<br />
          <span style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #0066FF 50%, #A78BFA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            analisado pela IA
          </span>
        </h1>
        <p className="animate-in" style={{ fontSize: 19, color: '#64748b', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7, animationDelay: '0.16s' }}>
          Importe seu extrato em PDF, CSV, OFX ou Excel e receba categorização automática, gráficos interativos e insights financeiros personalizados.
        </p>
        <div className="animate-in" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.24s' }}>
          <Link href="/auth/register">
            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px', boxShadow: '0 12px 40px #00D4FF33' }}>
              Analisar meu extrato grátis 🚀
            </button>
          </Link>
          <Link href="/precos">
            <button className="btn-ghost" style={{ fontSize: 16, padding: '14px 36px' }}>Ver planos</button>
          </Link>
        </div>
        <p style={{ fontSize: 12, color: '#334155', marginTop: 16 }}>
          Sem cartão • 3 extratos grátis/mês • LGPD compliant
        </p>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 48 }}>
          Tudo que você precisa para <span style={{ color: '#00D4FF' }}>entender suas finanças</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { icon: '📂', title: 'Importa qualquer formato', desc: 'PDF, CSV, OFX, Excel. Compatível com Nubank, Itaú, Bradesco, C6, Inter e todos os bancos brasileiros.', highlight: false },
            { icon: '🤖', title: 'IA categoriza tudo', desc: 'Cada transação é classificada automaticamente em 20 categorias. A IA aprende suas correções.', highlight: true },
            { icon: '📊', title: 'Dashboard completo', desc: 'Cards de resumo, gráficos de pizza, barras e linha temporal. Visão clara do seu dinheiro.', highlight: false },
            { icon: '💬', title: 'Consultor Financeiro IA', desc: 'Converse com nossa IA e tire dúvidas sobre seus gastos. "Onde estou gastando mais?" e muito mais.', highlight: true },
            { icon: '🎯', title: 'Metas financeiras', desc: 'Crie metas e acompanhe o progresso. A IA estima em quantos meses você chegará lá.', highlight: false },
            { icon: '🔒', title: 'Segurança total', desc: 'Criptografia AES-256, HTTPS, JWT, e conformidade com a LGPD. Seus dados financeiros protegidos.', highlight: false },
          ].map(f => (
            <div key={f.title} style={{
              background: f.highlight ? 'linear-gradient(135deg, #00D4FF0a, #0066FF0a)' : '#0f172a',
              border: `1px solid ${f.highlight ? '#00D4FF33' : '#1e293b'}`,
              borderRadius: 18, padding: 28,
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#00D4FF44' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = f.highlight ? '#00D4FF33' : '#1e293b' }}
            >
              <div style={{ fontSize: 38, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ background: '#0f172a', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#475569', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>Compatível com todos os principais bancos</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', color: '#94a3b8', fontSize: 15, fontWeight: 600 }}>
            {['Nubank', 'Itaú', 'Bradesco', 'Santander', 'C6 Bank', 'Inter', 'Caixa', 'BB', 'BTG', 'XP', 'NuInvest', 'Sicoob'].map(b => (
              <span key={b} style={{ background: '#1e293b', borderRadius: 8, padding: '8px 18px', fontSize: 13 }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 48 }}>
          Simples e <span style={{ color: '#00D4FF' }}>transparente</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <PriceCard
            name="Grátis" price="R$0" period="para sempre"
            features={['3 extratos por mês', 'Categorização com IA', 'Dashboard completo', 'Gráficos interativos', 'Metas financeiras']}
            cta="Começar grátis" href="/auth/register" primary={false}
          />
          <PriceCard
            name="Pro" price="R$19" period="/mês"
            features={['Extratos ilimitados', 'Consultor Financeiro IA', 'Histórico de 24 meses', 'Comparação mensal', 'Exportação PDF', 'Suporte prioritário']}
            cta="Assinar Pro" href="/precos" primary={true}
          />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px', borderTop: '1px solid #1e293b' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
          Comece agora, é <span style={{ color: '#00D4FF' }}>gratuito</span>
        </h2>
        <p style={{ color: '#64748b', marginBottom: 32, fontSize: 16 }}>Importe seu extrato e tenha clareza financeira em minutos</p>
        <Link href="/auth/register">
          <button className="btn-primary" style={{ fontSize: 16, padding: '14px 40px', boxShadow: '0 12px 40px #00D4FF33' }}>
            Criar conta grátis →
          </button>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Logo />
        <div style={{ display: 'flex', gap: 24, color: '#475569', fontSize: 13 }}>
          <Link href="/termos" style={{ color: '#475569' }}>Termos de Uso</Link>
          <Link href="/privacidade" style={{ color: '#475569' }}>Privacidade</Link>
          <Link href="/precos" style={{ color: '#475569' }}>Preços</Link>
        </div>
        <p style={{ color: '#334155', fontSize: 12 }}>© {new Date().getFullYear()} Extrato Inteligente • LGPD Compliant</p>
      </footer>
    </div>
  )
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #00D4FF, #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💳</div>
      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17 }}>Extrato<span style={{ color: '#00D4FF' }}>Inteligente</span></span>
    </div>
  )
}

function Glow() {
  return <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #00D4FF07 0%, transparent 70%)', pointerEvents: 'none' }} />
}

function Pill({ children }) {
  return <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#00D4FF11', border: '1px solid #00D4FF33', borderRadius: 20, padding: '6px 18px', fontSize: 13, color: '#00D4FF', fontWeight: 600 }}>{children}</div>
}

function PriceCard({ name, price, period, features, cta, href, primary }) {
  return (
    <div style={{
      background: primary ? 'linear-gradient(135deg, #00D4FF08, #0066FF08)' : '#0f172a',
      border: `1px solid ${primary ? '#00D4FF44' : '#1e293b'}`,
      borderRadius: 18, padding: 28, position: 'relative'
    }}>
      {primary && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #00D4FF, #0066FF)', borderRadius: 20, padding: '4px 16px', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>MAIS POPULAR</div>}
      <div style={{ marginBottom: 4, fontSize: 14, color: '#64748b', fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: 38, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: primary ? '#00D4FF' : '#e2e8f0' }}>{price}<span style={{ fontSize: 16, color: '#64748b' }}>{period}</span></div>
      <ul style={{ listStyle: 'none', margin: '20px 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map(f => <li key={f} style={{ fontSize: 13, color: '#94a3b8', display: 'flex', gap: 8 }}><span style={{ color: '#10B981' }}>✓</span>{f}</li>)}
      </ul>
      <Link href={href}>
        <button className={primary ? 'btn-primary' : 'btn-ghost'} style={{ width: '100%' }}>{cta}</button>
      </Link>
    </div>
  )
}
