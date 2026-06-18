import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function VerificarEmail() {
  const router = useRouter()
  const { token, erro } = router.query
  const [status, setStatus] = useState('loading') // loading | success | error | already

  useEffect(() => {
    if (!router.isReady) return

    if (erro === 'token-invalido') { setStatus('error'); return }
    if (token) {
      // Redireciona para a rota de API que verifica o token
      window.location.href = `/api/auth/verify?token=${token}`
      return
    }

    // Se chegou aqui sem token é porque já foi verificado ou erro
    const params = new URLSearchParams(window.location.search)
    if (params.get('verificado') === 'true') setStatus('success')
    else if (params.get('verificado') === 'ja') setStatus('already')
    else setStatus('error')
  }, [router.isReady, token, erro])

  const configs = {
    loading: { icon: '⏳', title: 'Verificando...', color: '#00D4FF', text: 'Aguarde enquanto verificamos seu email.' },
    success: { icon: '✅', title: 'Email verificado!', color: '#10B981', text: 'Sua conta está ativa. Você já pode usar o Extrato Inteligente.' },
    already: { icon: '✅', title: 'Já verificado', color: '#10B981', text: 'Seu email já estava verificado. Você pode entrar normalmente.' },
    error:   { icon: '❌', title: 'Link inválido', color: '#EF4444', text: 'Este link de verificação é inválido ou expirou. Faça login e solicite um novo link.' },
  }

  const c = configs[status] || configs.loading

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060e1a', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <Link href="/">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#00D4FF,#0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>💳</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>Extrato<span style={{ color: '#00D4FF' }}>Inteligente</span></span>
          </div>
        </Link>

        <div style={{ background: '#0f172a', border: `1px solid ${c.color}33`, borderRadius: 20, padding: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>{c.icon}</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 12, color: c.color }}>{c.title}</h1>
          <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>{c.text}</p>

          {status === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #1e293b', borderTop: `3px solid ${c.color}`, animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {(status === 'success' || status === 'already') && (
            <Link href="/app">
              <button className="btn-primary" style={{ width: '100%', padding: 13 }}>
                Acessar minha conta →
              </button>
            </Link>
          )}

          {status === 'error' && (
            <Link href="/auth/login">
              <button className="btn-ghost" style={{ width: '100%', padding: 13 }}>
                Ir para o login
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
