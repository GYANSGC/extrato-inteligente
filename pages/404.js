import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060e1a', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 80, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Página não encontrada</h2>
        <p style={{ color: '#475569', fontSize: 15, marginBottom: 36 }}>Esta página não existe ou foi movida.</p>
        <Link href="/">
          <button className="btn-primary" style={{ padding: '12px 32px' }}>← Voltar ao início</button>
        </Link>
      </div>
    </div>
  )
}
