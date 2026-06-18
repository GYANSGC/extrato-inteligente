import Link from 'next/link'

export default function ServerError() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060e1a', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 72, marginBottom: 16 }}>⚡</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 72, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>500</h1>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Erro interno</h2>
        <p style={{ color: '#475569', fontSize: 15, marginBottom: 36 }}>
          Algo deu errado no servidor. Nossa equipe já foi notificada.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '11px 28px' }}>Tentar novamente</button>
          <Link href="/"><button className="btn-ghost" style={{ padding: '11px 28px' }}>← Início</button></Link>
        </div>
      </div>
    </div>
  )
}
