import { getSupabaseAdmin } from '../../lib/supabase'

/**
 * GET /api/health
 * Health check para monitoramento (UptimeRobot, etc.)
 */
export default async function handler(req, res) {
  const start = Date.now()

  const checks = {
    api: 'ok',
    database: 'unknown',
    anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing_key',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
    email: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
  }

  // Verifica conexão com Supabase
  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('usuarios').select('count').limit(1)
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  const allOk = checks.api === 'ok' && checks.database === 'ok'
  const responseTime = Date.now() - start

  return res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    checks,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
  })
}
