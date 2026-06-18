import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../_app'

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#060e1a' }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #00D4FF07 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="animate-in" style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00D4FF, #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💳</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20 }}>Extrato<span style={{ color: '#00D4FF' }}>Inteligente</span></span>
          </div>
        </Link>
        <div className="card" style={{ padding: 36 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{title}</h1>
          <p style={{ color: '#475569', fontSize: 14, marginBottom: 28 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── LOGIN PAGE ─────────────────────────────────────────────────────────────
export function LoginPage() {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!form.email || !form.senha) return setError('Preencha todos os campos')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao entrar')
      } else {
        login(data.user, data.token)
        router.replace('/app')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <AuthLayout title="Bem-vindo de volta 👋" subtitle="Entre na sua conta para acessar seus extratos">
      <Field label="Email" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="seu@email.com" />
      <Field label="Senha" type="password" value={form.senha} onChange={v => setForm(p => ({ ...p, senha: v }))} placeholder="••••••••" onEnter={handleSubmit} />

      <div style={{ textAlign: 'right', marginBottom: 24, marginTop: -16 }}>
        <Link href="/auth/esqueci-senha" style={{ fontSize: 13, color: '#00D4FF' }}>Esqueceu a senha?</Link>
      </div>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 13, fontSize: 15 }}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#475569' }}>
        Não tem conta? <Link href="/auth/register" style={{ color: '#00D4FF', fontWeight: 600 }}>Criar grátis</Link>
      </p>
    </AuthLayout>
  )
}

// ── REGISTER PAGE ──────────────────────────────────────────────────────────
export function RegisterPage() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirma: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!form.nome || !form.email || !form.senha) return setError('Preencha todos os campos')
    if (form.senha !== form.confirma) return setError('As senhas não coincidem')
    if (form.senha.length < 8) return setError('Senha deve ter no mínimo 8 caracteres')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta')
      } else {
        login(data.user, data.token)
        router.replace('/app')
      }
    } catch {
      setError('Erro de conexão.')
    }
    setLoading(false)
  }

  return (
    <AuthLayout title="Criar sua conta" subtitle="Grátis para sempre • Sem cartão necessário">
      <Field label="Nome completo" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} placeholder="Maria Silva" />
      <Field label="Email" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="seu@email.com" />
      <Field label="Senha" type="password" value={form.senha} onChange={v => setForm(p => ({ ...p, senha: v }))} placeholder="Mínimo 8 caracteres" />
      <Field label="Confirmar senha" type="password" value={form.confirma} onChange={v => setForm(p => ({ ...p, confirma: v }))} placeholder="Repita a senha" onEnter={handleSubmit} />

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 13, fontSize: 15 }}>
        {loading ? 'Criando conta...' : 'Criar conta grátis 🚀'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
        Ao criar sua conta, você concorda com os{' '}
        <Link href="/termos" style={{ color: '#475569' }}>Termos de Uso</Link>{' e '}
        <Link href="/privacidade" style={{ color: '#475569' }}>Política de Privacidade</Link>
      </p>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#475569' }}>
        Já tem conta? <Link href="/auth/login" style={{ color: '#00D4FF', fontWeight: 600 }}>Entrar</Link>
      </p>
    </AuthLayout>
  )
}

// ── FORGOT PASSWORD PAGE ──────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <AuthLayout title="Recuperar senha" subtitle="Enviaremos um link para redefinir sua senha">
      {sent ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            Se o email <strong style={{ color: '#e2e8f0' }}>{email}</strong> estiver cadastrado, você receberá as instruções em breve.
          </p>
          <Link href="/auth/login">
            <button className="btn-ghost" style={{ marginTop: 24, width: '100%' }}>← Voltar ao login</button>
          </Link>
        </div>
      ) : (
        <>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" onEnter={handleSubmit} />
          <button className="btn-primary" onClick={handleSubmit} disabled={loading || !email} style={{ width: '100%', padding: 13 }}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
          <Link href="/auth/login">
            <button className="btn-ghost" style={{ width: '100%', marginTop: 10 }}>← Voltar</button>
          </Link>
        </>
      )}
    </AuthLayout>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, onEnter }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>{label}</label>
      <input
        className="input-field"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
      />
    </div>
  )
}

function ErrorMsg({ children }) {
  return (
    <div style={{ background: '#EF444422', border: '1px solid #EF444444', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16 }}>
      ⚠️ {children}
    </div>
  )
}

export default LoginPage
