# 🚀 Extrato Inteligente — Guia Completo de Deploy

## O que está incluído neste projeto

```
extrato-inteligente/
├── pages/
│   ├── _app.js                  # Auth context global
│   ├── index.js                 # Landing page
│   ├── app.js                   # App principal (dashboard)
│   ├── precos.js                # Página de planos
│   ├── privacidade.js           # Política de privacidade (LGPD)
│   ├── termos.js                # Termos de uso
│   ├── auth/
│   │   ├── login.js             # Login
│   │   ├── register.js          # Cadastro
│   │   └── esqueci-senha.js     # Recuperação de senha
│   └── api/
│       ├── auth/
│       │   ├── login.js         # POST /api/auth/login
│       │   ├── register.js      # POST /api/auth/register
│       │   ├── logout.js        # POST /api/auth/logout
│       │   ├── forgot-password.js
│       │   └── reset-password.js
│       ├── upload.js            # POST /api/upload (parseia PDF/OFX/CSV/XLSX)
│       ├── transactions.js      # GET/PATCH/DELETE transações
│       ├── goals.js             # CRUD metas
│       ├── ai/index.js          # POST /api/ai/insights e /api/ai/chat
│       └── stripe/
│           ├── checkout.js      # Cria sessão de pagamento
│           └── webhook.js       # Webhook Stripe (ativa/desativa Pro)
├── lib/
│   ├── supabase.js              # Cliente Supabase (público + admin)
│   ├── auth.js                  # JWT, bcrypt, middleware de autenticação
│   ├── parsers.js               # Parsers PDF, OFX, CSV, XLSX
│   ├── ai.js                    # Serviço Claude API (SERVER ONLY)
│   └── email.js                 # Emails transacionais (Resend)
├── supabase-schema.sql          # Schema completo do banco de dados
├── .env.local.example           # Template de variáveis de ambiente
└── package.json
```

---

## 📋 Passo a passo para colocar no ar

### ETAPA 1 — Supabase (banco de dados)

1. Acesse https://app.supabase.com e crie um projeto gratuito
2. Vá em **SQL Editor → New query**
3. Cole o conteúdo de `supabase-schema.sql` e execute
4. Vá em **Settings → API** e copie:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### ETAPA 2 — Anthropic API (IA)

1. Acesse https://console.anthropic.com
2. Crie uma API Key
3. Guarde como `ANTHROPIC_API_KEY`
4. ⚠️ Esta chave NUNCA vai para o frontend — só fica em variáveis de servidor

### ETAPA 3 — Resend (emails) — opcional mas recomendado

1. Acesse https://resend.com e crie conta gratuita (3.000 emails/mês)
2. Adicione e verifique seu domínio
3. Crie uma API Key
4. Guarde como `RESEND_API_KEY`
5. Configure `EMAIL_FROM=noreply@seudominio.com.br`

### ETAPA 4 — Stripe (pagamentos) — só se for cobrar

1. Acesse https://dashboard.stripe.com
2. Crie dois produtos:
   - **Pro Mensal** → R$19/mês → copie o `price_id`
   - **Pro Anual** → R$168/ano → copie o `price_id`
3. Copie a **Publishable key** e **Secret key**
4. Configure o webhook apontando para `https://seudominio.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### ETAPA 5 — Deploy na Vercel

```bash
# 1. Instale o Vercel CLI
npm i -g vercel

# 2. Faça login
vercel login

# 3. Na pasta do projeto, rode:
vercel

# 4. Configure as variáveis de ambiente no dashboard:
# https://vercel.com → seu projeto → Settings → Environment Variables
# Cole todas as variáveis do .env.local.example preenchidas
```

Ou via interface:
1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub
3. Configure as variáveis de ambiente
4. Deploy automático!

### ETAPA 6 — Domínio personalizado

1. Na Vercel: **Settings → Domains → Add**
2. Aponte o DNS do seu domínio para a Vercel
3. SSL é configurado automaticamente

---

## 🔐 Segurança implementada

| Recurso | Implementação |
|---------|---------------|
| Senhas | bcrypt hash (salt 12) |
| Autenticação | JWT HttpOnly cookie + Bearer token |
| Autorização | Middleware `withAuth` em todas as rotas |
| Banco | Row Level Security (RLS) — cada user só vê seus dados |
| API Key IA | Somente no servidor (nunca exposta ao browser) |
| Comunicação | HTTPS obrigatório em produção |
| Dados financeiros | Nunca logados, processados em memória |
| LGPD | Política de privacidade + Termos + DPO definido |
| Upload | Limite de tamanho (10MB) + validação de tipo |
| Rate limit | Via Vercel Edge (configure em vercel.json) |

---

## 💰 Custos mensais estimados

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Hobby (até 100GB) | Grátis |
| Supabase | Free (500MB, 50MB transfer) | Grátis |
| Resend | Free (3.000 emails/mês) | Grátis |
| Anthropic | Pay per use (~$3/1M tokens) | ~R$5-50/mês |
| Stripe | 2,9% + R$0,40 por transação | Por venda |
| Domínio .com.br | | ~R$40/ano |
| **Total inicial** | | **~R$5-50/mês** |

---

## 📊 Limites dos planos

| Recurso | Grátis | Pro |
|---------|--------|-----|
| Extratos/mês | 3 | Ilimitado |
| Histórico | 1 mês | 24 meses |
| Insights IA | ✅ | ✅ |
| Chat com IA | ❌ | ✅ |
| Exportação | ❌ | ✅ |
| Suporte | Comunidade | Email prioritário |

---

## 🛠️ Rodando localmente

```bash
# Clone / entre na pasta
cd extrato-inteligente

# Instale dependências
npm install

# Copie e preencha as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas chaves

# Rode em desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

---

## 📝 Variáveis obrigatórias vs opcionais

**Obrigatórias para funcionar:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (gere com: `openssl rand -base64 64`)
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

**Opcionais (features específicas):**
- `RESEND_API_KEY` — emails transacionais
- `STRIPE_*` — sistema de pagamentos
- `EMAIL_FROM` — remetente de emails

---

## 🚨 Checklist antes de lançar

- [ ] Schema SQL executado no Supabase
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Domínio personalizado configurado
- [ ] SSL ativo (automático na Vercel)
- [ ] Webhook do Stripe configurado e testado
- [ ] Email de verificação testado
- [ ] Upload de CSV testado
- [ ] Compra do plano Pro testada (modo teste do Stripe)
- [ ] Política de Privacidade publicada
- [ ] Termos de Uso publicados
- [ ] Google Analytics ou Posthog configurado (opcional)
