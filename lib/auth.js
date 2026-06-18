import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES = '7d'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

// Middleware helper: extrai usuário do cookie/header
export function getUserFromRequest(req) {
  const token =
    req.cookies?.token ||
    req.headers?.authorization?.replace('Bearer ', '')

  if (!token) return null
  return verifyToken(token)
}

// Proteção de rota API
export function withAuth(handler) {
  return async (req, res) => {
    const user = getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Não autorizado. Faça login.' })
    }
    req.user = user
    return handler(req, res)
  }
}

// Limite de uploads por plano
export const PLANO_LIMITES = {
  free: { uploads_mes: 3, historico_meses: 1, ia_insights: true, ia_chat: false },
  pro:  { uploads_mes: 999, historico_meses: 24, ia_insights: true, ia_chat: true },
}

export function withPlan(handler, requiredFeature) {
  return withAuth(async (req, res) => {
    const limites = PLANO_LIMITES[req.user.plano || 'free']
    if (!limites[requiredFeature]) {
      return res.status(403).json({
        error: 'Recurso disponível apenas no plano Pro.',
        upgrade: true
      })
    }
    req.limites = limites
    return handler(req, res)
  })
}
