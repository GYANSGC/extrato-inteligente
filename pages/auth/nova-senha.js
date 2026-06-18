import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function NovaSenha() {
  const router = useRouter()
  const { token } = router.query
  const [form, setForm] = useState({ novaSenha: '', confirma: '' })
  const [status, setStatus] = useState('form') // form | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (!form.novaSenha || !form.confirma) { setErrorMsg('Preencha todos os campos'); return }
    if (form.novaSenha.length < 8) { setErrorMsg('Senha deve ter no mínimo 8 caracteres'); return }
    if (form.novaSenha !== form.confirma) { setErrorMsg('As senhas não coincidem'); return }
    if (!token) { setErrorMsg('Token inválido'); return }

    setErrorMsg('')
    setStatus('loading')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha: form.novaSenha }),
      })
      const data = await res.json()

      if (res.ok) setStatus('success')
      else { setErrorMsg(data.error || 'Erro ao redefinir senha'); setStatus('form') }
    } catch {
      setErrorMsg('Erro de conexão. Tente novamente.')
      setStatus('form')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060e1a', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 36, cursor: 'pointer' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#00D4FF,#0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💳</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18 }}>Extrato<span style={{ color: '#00D4FF' }}>Inteligente</span></span>
          </div>
        </Link>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 18, padding: 36 }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Senha atualizada!</h2>
              <p style={{ color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>Sua senha foi redefinida com sucesso. Agora você pode entrar com a nova senha.</p>
              <Link href="/auth/login">
                <button className="btn-primary" style={{ width: '100%', padding: 13 }}>Fazer login →</button>
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>🔐 Nova senha</h1>
              <p style={{ color: '#475569', fontSize: 14, marginBottom: 28 }}>Escolha uma senha forte com no mínimo 8 caracteres.</p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Nova senha</label>
                <input
                  type="password"
                  value={form.novaSenha}
                  onChange={e => setForm(p => ({ ...p, novaSenha: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Confirmar nova senha</label>
                <input
                  type="password"
                  value={form.confirma}
                  onChange={e => setForm(p => ({ ...p, confirma: e.target.value }))}
                  placeholder="Repita a senha"
                  className="input-field"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {errorMsg && (
                <div style={{ background: '#EF444422', border: '1px solid #EF444444', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="btn-primary"
                style={{ width: '100%', padding: 13 }}
              >
                {status === 'loading' ? 'Salvando...' : 'Salvar nova senha'}
              </button>

              <Link href="/auth/login">
                <button className="btn-ghost" style={{ width: '100%', marginTop: 10 }}>← Voltar ao login</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
