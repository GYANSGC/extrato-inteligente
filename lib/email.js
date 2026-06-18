// Serviço de email usando Resend (https://resend.com)
// Alternativa gratuita: até 3.000 emails/mês

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM || 'noreply@extratoInteligente.com.br'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY não configurada. Email não enviado:', subject)
    return { ok: true, simulated: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[Email] Erro ao enviar:', err)
    throw new Error('Falha ao enviar email')
  }

  return res.json()
}

// ─── Templates ───────────────────────────────────────────────────────────────
const baseStyle = `
  font-family: 'Segoe UI', sans-serif;
  background: #060e1a;
  color: #e2e8f0;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
`
const btnStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #00D4FF, #0066FF);
  color: #fff;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 16px;
  margin: 24px 0;
`

export async function sendVerificationEmail(email, nome, token) {
  const url = `${APP_URL}/auth/verificar?token=${token}`
  return sendEmail({
    to: email,
    subject: '✅ Confirme seu email — Extrato Inteligente',
    html: `
      <div style="${baseStyle}">
        <h1 style="color:#00D4FF;margin-bottom:8px">Extrato<span style="color:#fff">Inteligente</span></h1>
        <h2 style="font-size:22px;margin-bottom:16px">Olá, ${nome}! 👋</h2>
        <p style="color:#94a3b8;line-height:1.7">
          Você está quase lá! Confirme seu endereço de email para ativar sua conta
          e começar a analisar seus extratos bancários com IA.
        </p>
        <a href="${url}" style="${btnStyle}">✅ Confirmar Email</a>
        <p style="color:#475569;font-size:13px">
          Este link expira em 24 horas. Se não foi você, ignore este email.
        </p>
        <hr style="border-color:#1e293b;margin:32px 0"/>
        <p style="color:#334155;font-size:12px">
          © ${new Date().getFullYear()} Extrato Inteligente • Seus dados financeiros protegidos
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email, nome, token) {
  const url = `${APP_URL}/auth/nova-senha?token=${token}`
  return sendEmail({
    to: email,
    subject: '🔐 Redefinição de senha — Extrato Inteligente',
    html: `
      <div style="${baseStyle}">
        <h1 style="color:#00D4FF">Extrato<span style="color:#fff">Inteligente</span></h1>
        <h2 style="font-size:22px;margin-bottom:16px">Redefinir senha</h2>
        <p style="color:#94a3b8;line-height:1.7">
          Recebemos uma solicitação para redefinir a senha da conta associada a <strong>${email}</strong>.
        </p>
        <a href="${url}" style="${btnStyle}">🔐 Criar Nova Senha</a>
        <p style="color:#EF4444;font-size:13px">
          ⚠️ Este link expira em 1 hora. Se não foi você, sua senha está segura — ignore este email.
        </p>
        <hr style="border-color:#1e293b;margin:32px 0"/>
        <p style="color:#334155;font-size:12px">© ${new Date().getFullYear()} Extrato Inteligente</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email, nome) {
  return sendEmail({
    to: email,
    subject: '🎉 Bem-vindo ao Extrato Inteligente!',
    html: `
      <div style="${baseStyle}">
        <h1 style="color:#00D4FF">Extrato<span style="color:#fff">Inteligente</span></h1>
        <h2 style="font-size:22px;margin-bottom:16px">Sua conta está pronta, ${nome}! 🚀</h2>
        <p style="color:#94a3b8;line-height:1.7">
          Agora você pode importar seu extrato bancário e receber análises financeiras
          detalhadas com inteligência artificial.
        </p>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin:24px 0">
          <p style="color:#64748b;font-size:13px;margin-bottom:12px">PLANO GRATUITO INCLUI:</p>
          <p style="margin:6px 0">✅ Até 3 extratos por mês</p>
          <p style="margin:6px 0">✅ Categorização automática com IA</p>
          <p style="margin:6px 0">✅ Gráficos e dashboard completo</p>
          <p style="margin:6px 0">✅ Metas financeiras</p>
          <p style="margin:6px 0">🔒 Consultor IA (plano Pro)</p>
        </div>
        <a href="${APP_URL}" style="${btnStyle}">Acessar Minha Conta →</a>
        <hr style="border-color:#1e293b;margin:32px 0"/>
        <p style="color:#334155;font-size:12px">© ${new Date().getFullYear()} Extrato Inteligente • LGPD Compliant</p>
      </div>
    `,
  })
}

export async function sendProConfirmationEmail(email, nome) {
  return sendEmail({
    to: email,
    subject: '⭐ Bem-vindo ao Plano Pro!',
    html: `
      <div style="${baseStyle}">
        <h1 style="color:#00D4FF">Extrato<span style="color:#fff">Inteligente</span></h1>
        <h2 style="font-size:22px;margin-bottom:16px">Você é Pro agora, ${nome}! ⭐</h2>
        <p style="color:#94a3b8;line-height:1.7">
          Sua assinatura foi ativada com sucesso. Você agora tem acesso completo a todos os recursos.
        </p>
        <div style="background:#0f172a;border:1px solid #00D4FF44;border-radius:12px;padding:20px;margin:24px 0">
          <p style="color:#00D4FF;font-size:13px;margin-bottom:12px">PLANO PRO — RECURSOS DESBLOQUEADOS:</p>
          <p style="margin:6px 0">✅ Extratos ilimitados</p>
          <p style="margin:6px 0">✅ Consultor Financeiro IA (chat)</p>
          <p style="margin:6px 0">✅ Histórico de 24 meses</p>
          <p style="margin:6px 0">✅ Comparação mensal</p>
          <p style="margin:6px 0">✅ Exportação de relatórios</p>
          <p style="margin:6px 0">✅ Suporte prioritário</p>
        </div>
        <a href="${APP_URL}" style="${btnStyle}">Explorar Recursos Pro →</a>
        <hr style="border-color:#1e293b;margin:32px 0"/>
        <p style="color:#334155;font-size:12px">
          Dúvidas? Responda este email. © ${new Date().getFullYear()} Extrato Inteligente
        </p>
      </div>
    `,
  })
}
