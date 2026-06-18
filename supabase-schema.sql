-- ============================================================
-- MEU EXTRATO INTELIGENTE — Schema completo do banco de dados
-- Execute este SQL no Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- ─── Extensões ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tabela: usuarios ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  senha_hash    TEXT NOT NULL,
  plano         TEXT NOT NULL DEFAULT 'free' CHECK (plano IN ('free','pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  assinatura_ativa BOOLEAN DEFAULT false,
  uploads_mes   INTEGER DEFAULT 0,
  uploads_reset_em TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
  verificado    BOOLEAN DEFAULT false,
  token_verificacao TEXT,
  token_reset   TEXT,
  token_reset_exp TIMESTAMP WITH TIME ZONE,
  criado_em     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Tabela: extratos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS extratos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome_arquivo  TEXT NOT NULL,
  tipo_arquivo  TEXT NOT NULL,
  periodo_inicio DATE,
  periodo_fim   DATE,
  total_entradas DECIMAL(12,2) DEFAULT 0,
  total_saidas  DECIMAL(12,2) DEFAULT 0,
  saldo         DECIMAL(12,2) DEFAULT 0,
  criado_em     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Tabela: transacoes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS transacoes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  extrato_id    UUID REFERENCES extratos(id) ON DELETE CASCADE,
  data          DATE NOT NULL,
  descricao     TEXT NOT NULL,
  valor         DECIMAL(12,2) NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('entrada','saida')),
  categoria     TEXT NOT NULL DEFAULT 'Outros',
  categoria_editada BOOLEAN DEFAULT false,
  criado_em     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Tabela: aprendizado_categorias ──────────────────────────
-- Guarda o aprendizado de categoria por usuário
CREATE TABLE IF NOT EXISTS aprendizado_categorias (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  palavra_chave TEXT NOT NULL,
  categoria     TEXT NOT NULL,
  criado_em     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, palavra_chave)
);

-- ─── Tabela: metas ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  icone         TEXT DEFAULT '🎯',
  valor_alvo    DECIMAL(12,2) NOT NULL,
  valor_atual   DECIMAL(12,2) DEFAULT 0,
  concluida     BOOLEAN DEFAULT false,
  prazo         DATE,
  criado_em     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Tabela: insights_cache ──────────────────────────────────
-- Cache de insights gerados pela IA para não recalcular sempre
CREATE TABLE IF NOT EXISTS insights_cache (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  extrato_id    UUID REFERENCES extratos(id) ON DELETE CASCADE,
  insights      JSONB NOT NULL,
  criado_em     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Índices para performance ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario ON transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_extrato ON transacoes(extrato_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_metas_usuario ON metas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_extratos_usuario ON extratos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_aprendizado_usuario ON aprendizado_categorias(usuario_id);

-- ─── Row Level Security (RLS) ────────────────────────────────
-- Garante que cada usuário só acessa seus próprios dados
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE extratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aprendizado_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights_cache ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário só vê seus dados (via JWT com user_id)
CREATE POLICY "usuarios_own" ON usuarios FOR ALL USING (id::text = current_setting('app.user_id', true));
CREATE POLICY "extratos_own" ON extratos FOR ALL USING (usuario_id::text = current_setting('app.user_id', true));
CREATE POLICY "transacoes_own" ON transacoes FOR ALL USING (usuario_id::text = current_setting('app.user_id', true));
CREATE POLICY "metas_own" ON metas FOR ALL USING (usuario_id::text = current_setting('app.user_id', true));
CREATE POLICY "aprendizado_own" ON aprendizado_categorias FOR ALL USING (usuario_id::text = current_setting('app.user_id', true));
CREATE POLICY "insights_own" ON insights_cache FOR ALL USING (usuario_id::text = current_setting('app.user_id', true));

-- ─── Trigger: atualiza updated_at automaticamente ────────────
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_atualizado_em_usuarios BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();
CREATE TRIGGER set_atualizado_em_metas BEFORE UPDATE ON metas
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- ─── View: resumo_mensal ─────────────────────────────────────
CREATE OR REPLACE VIEW resumo_mensal AS
SELECT
  usuario_id,
  DATE_TRUNC('month', data) AS mes,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) AS total_entradas,
  SUM(CASE WHEN tipo = 'saida' THEN ABS(valor) ELSE 0 END) AS total_saidas,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -ABS(valor) END) AS saldo,
  COUNT(*) AS num_transacoes
FROM transacoes
GROUP BY usuario_id, DATE_TRUNC('month', data);
