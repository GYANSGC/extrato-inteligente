import Link from 'next/link'

function LegalLayout({ title, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#060e1a' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 70, borderBottom: '1px solid #1e293b' }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#00D4FF,#0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💳</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16 }}>Extrato<span style={{ color: '#00D4FF' }}>Inteligente</span></span>
          </div>
        </Link>
        <Link href="/"><button className="btn-ghost" style={{ padding: '6px 16px', fontSize: 13 }}>← Voltar</button></Link>
      </nav>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '60px 24px 80px' }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 8 }}>{title}</h1>
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 48 }}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, color: '#94a3b8', lineHeight: 1.8, fontSize: 15 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  )
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidade">
      <p>A <strong style={{ color: '#e2e8f0' }}>Extrato Inteligente</strong> está comprometida com a proteção da sua privacidade e com o cumprimento da Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).</p>

      <Section title="1. Dados que coletamos">
        <p><strong style={{ color: '#e2e8f0' }}>Dados de cadastro:</strong> nome e endereço de email, utilizados para criar e gerenciar sua conta.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: '#e2e8f0' }}>Dados financeiros:</strong> transações do seu extrato bancário (datas, descrições, valores). Esses dados são processados exclusivamente para gerar sua análise financeira e nunca são compartilhados com terceiros.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: '#e2e8f0' }}>Dados de uso:</strong> logs técnicos de acesso para segurança e diagnóstico.</p>
      </Section>

      <Section title="2. Como usamos seus dados">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Fornecer e melhorar o serviço de análise financeira</li>
          <li>Classificar automaticamente suas transações com IA</li>
          <li>Enviar comunicações sobre sua conta (verificação, recuperação de senha)</li>
          <li>Cumprir obrigações legais e regulatórias</li>
        </ul>
        <p style={{ marginTop: 12 }}>Seus dados financeiros <strong style={{ color: '#e2e8f0' }}>não são usados para publicidade</strong>, não são vendidos, e não são compartilhados com anunciantes.</p>
      </Section>

      <Section title="3. Base legal (LGPD)">
        <p>Processamos seus dados com base em:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong style={{ color: '#e2e8f0' }}>Consentimento</strong> — ao criar sua conta, você consente com esta política</li>
          <li><strong style={{ color: '#e2e8f0' }}>Execução de contrato</strong> — para fornecer o serviço contratado</li>
          <li><strong style={{ color: '#e2e8f0' }}>Interesse legítimo</strong> — segurança da plataforma e prevenção a fraudes</li>
        </ul>
      </Section>

      <Section title="4. Segurança dos dados">
        <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Criptografia AES-256 para dados em repouso</li>
          <li>HTTPS/TLS para dados em trânsito</li>
          <li>Senhas armazenadas com hash bcrypt (salt 12)</li>
          <li>Autenticação via JWT com expiração de 7 dias</li>
          <li>Row Level Security no banco de dados (cada usuário acessa apenas seus dados)</li>
          <li>Auditoria de acesso e logs de segurança</li>
        </ul>
      </Section>

      <Section title="5. Retenção de dados">
        <p>Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar exclusão da conta, todos os seus dados pessoais e financeiros são removidos permanentemente em até 30 dias.</p>
      </Section>

      <Section title="6. Seus direitos (LGPD)">
        <p>Você tem direito a:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong style={{ color: '#e2e8f0' }}>Acesso</strong> — solicitar cópia dos seus dados</li>
          <li><strong style={{ color: '#e2e8f0' }}>Correção</strong> — corrigir dados incorretos</li>
          <li><strong style={{ color: '#e2e8f0' }}>Exclusão</strong> — excluir sua conta e todos os dados</li>
          <li><strong style={{ color: '#e2e8f0' }}>Portabilidade</strong> — exportar seus dados em formato legível</li>
          <li><strong style={{ color: '#e2e8f0' }}>Revogação</strong> — revogar consentimento a qualquer momento</li>
        </ul>
        <p style={{ marginTop: 12 }}>Para exercer esses direitos, entre em contato: <strong style={{ color: '#00D4FF' }}>privacidade@extratoInteligente.com.br</strong></p>
      </Section>

      <Section title="7. Cookies">
        <p>Utilizamos apenas cookies funcionais essenciais para manter sua sessão autenticada. Não utilizamos cookies de rastreamento ou publicidade.</p>
      </Section>

      <Section title="8. Contato">
        <p>Encarregado de Dados (DPO): <strong style={{ color: '#00D4FF' }}>privacidade@extratoInteligente.com.br</strong></p>
      </Section>
    </LegalLayout>
  )
}

export function TermsPage() {
  return (
    <LegalLayout title="Termos de Uso">
      <p>Ao utilizar o <strong style={{ color: '#e2e8f0' }}>Extrato Inteligente</strong>, você concorda com estes Termos de Uso. Leia com atenção.</p>

      <Section title="1. O Serviço">
        <p>O Extrato Inteligente é uma plataforma de análise financeira pessoal que permite importar extratos bancários e visualizar análises automáticas com inteligência artificial. O serviço é fornecido "como está".</p>
      </Section>

      <Section title="2. Elegibilidade">
        <p>O serviço é destinado a pessoas físicas maiores de 18 anos residentes no Brasil. Ao criar uma conta, você declara ser maior de idade e ter capacidade legal para aceitar estes termos.</p>
      </Section>

      <Section title="3. Conta do usuário">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Você é responsável por manter a confidencialidade da sua senha</li>
          <li>É proibido compartilhar credenciais de acesso</li>
          <li>Você é responsável por todas as atividades realizadas na sua conta</li>
          <li>Nos reserve o direito de suspender contas com uso abusivo</li>
        </ul>
      </Section>

      <Section title="4. Planos e pagamentos">
        <p>O plano Grátis inclui 3 extratos por mês. O plano Pro é cobrado mensalmente ou anualmente conforme escolha no checkout. O cancelamento pode ser feito a qualquer momento, com acesso mantido até o fim do período pago. Não há reembolso proporcional.</p>
      </Section>

      <Section title="5. Uso aceitável">
        <p>É proibido:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Usar o serviço para fins ilegais</li>
          <li>Tentar acessar dados de outros usuários</li>
          <li>Realizar engenharia reversa ou scraping da plataforma</li>
          <li>Sobrecarregar os servidores com requisições automatizadas</li>
        </ul>
      </Section>

      <Section title="6. Limitação de responsabilidade">
        <p>O Extrato Inteligente é uma ferramenta de auxílio à gestão financeira pessoal. As análises e insights gerados por IA são informativos e não constituem assessoria financeira profissional. Não nos responsabilizamos por decisões financeiras tomadas com base nas análises da plataforma.</p>
      </Section>

      <Section title="7. Disponibilidade">
        <p>Nos esforçamos para manter o serviço disponível, mas não garantimos disponibilidade ininterrupta. Realizamos manutenções programadas com aviso prévio.</p>
      </Section>

      <Section title="8. Modificações">
        <p>Podemos atualizar estes termos com aviso de 15 dias por email. O uso continuado do serviço após as modificações implica aceitação dos novos termos.</p>
      </Section>

      <Section title="9. Lei aplicável">
        <p>Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca de São Paulo/SP para dirimir eventuais disputas.</p>
      </Section>

      <Section title="10. Contato">
        <p>Para dúvidas sobre estes termos: <strong style={{ color: '#00D4FF' }}>suporte@extratoInteligente.com.br</strong></p>
      </Section>
    </LegalLayout>
  )
}

export default PrivacyPage
