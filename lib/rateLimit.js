/**
 * Rate limiter leve em memória para API routes do Next.js.
 * Em produção com múltiplas instâncias, prefira Redis (Upstash).
 * Para Vercel Hobby (single instance), este funciona perfeitamente.
 */

const store = new Map()

/**
 * @param {object} options
 * @param {number} options.windowMs  - Janela de tempo em ms (default: 60.000 = 1 min)
 * @param {number} options.max       - Máximo de requests na janela (default: 20)
 * @param {string} [options.keyPrefix] - Prefixo para separar limiters diferentes
 */
export function rateLimit({ windowMs = 60_000, max = 20, keyPrefix = 'rl' } = {}) {
  return {
    check(req, res) {
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown'

      const key = `${keyPrefix}:${ip}`
      const now = Date.now()

      let record = store.get(key)

      if (!record || now > record.resetAt) {
        record = { count: 0, resetAt: now + windowMs }
        store.set(key, record)
      }

      record.count++

      const remaining = Math.max(0, max - record.count)
      const resetIn = Math.ceil((record.resetAt - now) / 1000)

      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', remaining)
      res.setHeader('X-RateLimit-Reset', resetIn)

      if (record.count > max) {
        res.status(429).json({
          error: 'Muitas requisições. Aguarde alguns segundos e tente novamente.',
          retryAfter: resetIn,
        })
        return false // bloqueado
      }

      return true // permitido
    },
  }
}

// Limpa entradas expiradas periodicamente (evita leak de memória)
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key)
  }
}, 5 * 60_000) // a cada 5 min
