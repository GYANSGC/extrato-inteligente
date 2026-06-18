import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from './_app'

export default function Perfil() {
  const { user, logout, authFetch, login } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('conta')
  const [usage, setUsage] = useState(null)
  const [extratos, setExtratos] = useState([])
  const [form, setForm] = useState({ nome: '', senhaAtual: '', novaSenha: '', confirma: '' })
  const [deleteForm, setDeleteForm] = useState({ senha: '', confirma: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => { if (!user) router.replace('/auth/login') }, [user])

  useEffect(() => {
    if (!user) return
    setForm(p => ({ ...p, nome: user.nome || '' }))
    loadUsage()
    loadExtratos()
  }, [user])

  const loadUsage = async () => {
    const res = await authFetch('/api/user/usage')
    if (res.ok) setUsage(await res.json())
  }

  const loadExtratos = async () => {
    const res = await authFetch('/api/extratos')
    if (res.ok) { const d = await res.json(); setExtratos(d.extratos || []) }
  }

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 4000)
  }

  const saveProfile = async () => {
    if (form.novaSenha && form.novaSenha !== form.confirma) {
      return showMsg('As senhas não coincidem', 'error')
    }
    setLoading(true)
    const res = await authFetch('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ nome: form.nome, senhaAtual: form.senhaAtual || undefined, novaSenha: form.novaSenha || undefined }),
    })
    const data = await res.json()
    if (res.ok) {
      showMsg('Perfil atualizado!')
      login({ ...user, nome: form.nome }, localStorage.getItem('ei_token'))
      setForm(p => ({ ...p, senhaAtual: '', novaSenha: '', confirma: '' }))
    } else {
      showMsg(data.error || 'Erro ao salvar', 'error')
    }
    setLoading(false)
  }

  const deleteExtrato = async (id) => {
    if (!confirm('Remover este extrato e todas as suas transações?')) return
    await authFetch(`/api/extratos?id=${id}`, { method: 'DELETE' })
    setExtratos(prev => prev.filter(e => e.id !== id))
    showMsg('Extrato removido.')
  }

  const exportar = async (extratoId) => {
    const res = await authFetch(`/api/transactions/export?extrato_id=${extratoId}&format=csv`)
    if (!res.ok) { showMsg('Exportação disponível no plano Pro', 'error'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'extrato.csv'; a.click()
  }

  const openPortal = async () => {
    setPortalLoading(true)
    const res = await authFetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else showMsg(data.error || 'Erro ao abrir portal', 'error')
    setPortalLoading(false)
  }

  const deleteAccount = async () => {
    if (deleteForm.confirma !== 'EXCLUIR') {
      return showMsg('Digite EXCLUIR para confirmar', 'error')
    }
    if (!deleteForm.senha) return showMsg('Informe sua senha', 'error')
    setLoading(true)
    const res = await authFetch('/api/user/profile', {
      method: 'DELETE',
      body: JSON.stringify({ senha: deleteForm.senha }),
    })
    if (res.ok) logout()
    else { const d = await res.json(); showMsg(d.error || 'Erro', 'error') }
    setLoading(false)
  }

  if (!user) return null

  const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
  const tabs = [
    { id: 'conta', label: '👤 Conta' },
    { id: 'historico', label: '📂 Histórico' },
    { id: 'assinatura', label: '💳 Assinatura' },
    { id: 'perigo', label: '⚠️ Zona de perigo' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060e1a' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#060e1af0', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 60 }}>
        <Link href="/app"><button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>← App</button></Link>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>Configurações</span>
        <div />
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        {/* Header do usuário */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#00D4FF,#0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
            {user.nome?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user.nome}</div>
            <div style={{ color: '#475569', fontSize: 13 }}>{user.email}</div>
          </div>
          <div style={{ background: user.plano === 'pro' ? '#00D4FF22' : '#1e293b', color: user.plano === 'pro' ? '#00D4FF' : '#64748b', border: `1px solid ${user.plano === 'pro' ? '#00D4FF44' : '#1e293b'}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>
            {user.plano === 'pro' ? '⭐ Pro' : 'Grátis'}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? '#1e293b' : 'transparent', color: tab === t.id ? '#e2e8f0' : '#64748b', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ background: msg.type === 'error' ? '#EF444422' : '#10B98122', border: `1px solid ${msg.type === 'error' ? '#EF444444' : '#10B98144'}`, borderRadius: 10, padding: '11px 16px', fontSize: 13, color: msg.type === 'error' ? '#EF4444' : '#10B981', marginBottom: 16 }}>
            {msg.text}
          </div>
        )}

        {/* ── CONTA ── */}
        {tab === 'conta' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Dados da conta</h2>

            <Field label="Nome" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} />
            <Field label="Email" value={user.email} disabled />

            <hr style={{ border: 'none', borderTop: '1px solid #1e293b' }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>Alterar senha</h3>
            <Field label="Senha atual" type="password" value={form.senhaAtual} onChange={v => setForm(p => ({ ...p, senhaAtual: v }))} placeholder="Deixe em branco para não alterar" />
            <Field label="Nova senha" type="password" value={form.novaSenha} onChange={v => setForm(p => ({ ...p, novaSenha: v }))} placeholder="Mínimo 8 caracteres" />
            <Field label="Confirmar nova senha" type="password" value={form.confirma} onChange={v => setForm(p => ({ ...p, confirma: v }))} placeholder="Repita a nova senha" />

            <button onClick={saveProfile} disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {tab === 'historico' && (
          <div>
            {/* Usage bar */}
            {usage && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Uploads este mês</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {usage.uploadsIlimitado ? `${usage.uploadsUsados} (ilimitado)` : `${usage.uploadsUsados}/${usage.uploadsLimite}`}
                  </span>
                </div>
                {!usage.uploadsIlimitado && (
                  <div style={{ height: 8, background: '#1e293b', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (usage.uploadsUsados / usage.uploadsLimite) * 100)}%`, background: 'linear-gradient(90deg,#00D4FF,#0066FF)', borderRadius: 4 }} />
                  </div>
                )}
                <p style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
                  Renova em {usage.diasParaReset} {usage.diasParaReset === 1 ? 'dia' : 'dias'}
                  {!usage.uploadsIlimitado && <> • <Link href="/precos" style={{ color: '#00D4FF' }}>Upgrade para ilimitado</Link></>}
                </p>
              </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {extratos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#475569' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                  <p>Nenhum extrato importado ainda</p>
                </div>
              ) : extratos.map((e, i) => (
                <div key={e.id} style={{ padding: '14px 18px', borderBottom: i < extratos.length - 1 ? '1px solid #1e293b' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.nome_arquivo}</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                      {e.periodo_inicio} → {e.periodo_fim} • {e.num_transacoes} transações
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: (e.saldo >= 0) ? '#10B981' : '#EF4444' }}>{fmt(e.saldo)}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => exportar(e.id)} style={{ background: 'none', border: '1px solid #1e293b', color: '#64748b', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>↓ CSV</button>
                      <button onClick={() => deleteExtrato(e.id)} style={{ background: 'none', border: '1px solid #EF444433', color: '#EF4444', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>Remover</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ASSINATURA ── */}
        {tab === 'assinatura' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Plano atual</h2>
              <span style={{ fontWeight: 700, color: user.plano === 'pro' ? '#00D4FF' : '#64748b' }}>
                {user.plano === 'pro' ? '⭐ Pro' : 'Grátis'}
              </span>
            </div>

            {user.plano === 'pro' ? (
              <>
                <div style={{ background: '#00D4FF08', border: '1px solid #00D4FF22', borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
                    Você está no plano Pro com acesso a todos os recursos: extratos ilimitados, Consultor IA, histórico de 24 meses e exportação de relatórios.
                  </p>
                </div>
                <button onClick={openPortal} disabled={portalLoading} className="btn-ghost" style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: 13 }}>
                  {portalLoading ? 'Abrindo...' : '💳 Gerenciar assinatura (cancelar, trocar cartão)'}
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>
                  No plano Grátis você tem 3 extratos/mês. Faça upgrade para o Pro e desbloqueie todos os recursos.
                </p>
                <Link href="/precos">
                  <button className="btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px', boxShadow: '0 8px 24px #00D4FF22' }}>
                    ⭐ Fazer upgrade para Pro
                  </button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* ── ZONA DE PERIGO ── */}
        {tab === 'perigo' && (
          <div className="card" style={{ border: '1px solid #EF444433' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#EF4444', marginBottom: 8 }}>⚠️ Excluir conta</h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
              Esta ação é <strong style={{ color: '#EF4444' }}>irreversível</strong>. Todos os seus dados (perfil, extratos, transações e metas) serão permanentemente removidos em até 30 dias conforme nossa Política de Privacidade.
            </p>

            <Field label="Sua senha" type="password" value={deleteForm.senha} onChange={v => setDeleteForm(p => ({ ...p, senha: v }))} placeholder="Digite sua senha para confirmar" />
            <Field label='Digite "EXCLUIR" para confirmar' value={deleteForm.confirma} onChange={v => setDeleteForm(p => ({ ...p, confirma: v }))} placeholder="EXCLUIR" />

            <button
              onClick={deleteAccount}
              disabled={loading || deleteForm.confirma !== 'EXCLUIR' || !deleteForm.senha}
              style={{ marginTop: 8, background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444', borderRadius: 10, padding: '11px 24px', cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: (deleteForm.confirma !== 'EXCLUIR' || !deleteForm.senha) ? 0.4 : 1, transition: 'opacity 0.2s' }}
            >
              {loading ? 'Excluindo...' : 'Excluir minha conta permanentemente'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="input-field"
        style={{ opacity: disabled ? 0.5 : 1 }}
      />
    </div>
  )
}
