import { useState, useEffect, createContext, useContext } from 'react'
import Head from 'next/head'

// ─── Auth Context ──────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Tenta restaurar sessão do servidor primeiro (dados sempre frescos)
    const token = localStorage.getItem('ei_token')
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.user) {
            setUser(data.user)
            localStorage.setItem('ei_user', JSON.stringify(data.user))
          } else {
            // Token inválido — limpa
            localStorage.removeItem('ei_user')
            localStorage.removeItem('ei_token')
          }
        })
        .catch(() => {
          // Fallback para localStorage em caso de erro de rede
          try {
            const stored = localStorage.getItem('ei_user')
            if (stored) setUser(JSON.parse(stored))
          } catch {}
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('ei_user', JSON.stringify(userData))
    if (token) localStorage.setItem('ei_token', token)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    localStorage.removeItem('ei_user')
    localStorage.removeItem('ei_token')
    window.location.href = '/'
  }

  const getToken = () => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('ei_token') || ''
  }

  const authFetch = async (url, options = {}) => {
    const token = getToken()
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, authFetch, getToken }}>
      <Head>
        <title>Extrato Inteligente — Análise Financeira com IA</title>
        <meta name="description" content="Importe seu extrato bancário e receba análises financeiras detalhadas com inteligência artificial. Categorização automática, gráficos e insights personalizados." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style global jsx>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #060e1a;
          color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        input, select, textarea, button { font-family: 'DM Sans', sans-serif; }
        input:focus, textarea:focus, select:focus { outline: none; }
        a { color: inherit; text-decoration: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-in { animation: fadeIn 0.35s ease forwards; }
        .btn-primary {
          background: linear-gradient(135deg, #00D4FF, #0066FF);
          color: #fff; border: none; border-radius: 10px;
          padding: 11px 24px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 30px #00D4FF44; }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-ghost {
          background: transparent; color: #94a3b8;
          border: 1px solid #1e293b; border-radius: 10px;
          padding: 11px 24px; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #334155; color: #e2e8f0; background: #0f172a; }
        .card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 20px;
        }
        .input-field {
          width: 100%; background: #060e1a;
          border: 1px solid #1e293b; color: #e2e8f0;
          border-radius: 10px; padding: 12px 14px;
          font-size: 14px; transition: border 0.2s;
        }
        .input-field:focus { border-color: #00D4FF; }
        .input-field::placeholder { color: #334155; }
        .skeleton {
          background: linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        .toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          background: #0f172a; border: 1px solid #1e293b;
          border-radius: 12px; padding: 14px 20px;
          box-shadow: 0 20px 60px #00000066;
          animation: slideIn 0.3s ease;
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; max-width: 380px;
        }
      `}</style>
      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
          <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid #1e293b',borderTop:'3px solid #00D4FF',animation:'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <Component {...pageProps} />
      )}
    </AuthContext.Provider>
  )
}
