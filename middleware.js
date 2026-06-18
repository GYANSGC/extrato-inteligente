import { NextResponse } from 'next/server'

// Rotas que exigem autenticação
const PROTECTED = ['/app']
// Rotas que redirecionam para /app se já logado
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Redireciona para login se tentar acessar área protegida sem token
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redireciona para app se já está logado e tenta acessar login/register
  if (AUTH_ROUTES.some(p => pathname.startsWith(p))) {
    if (token) {
      const url = request.nextUrl.clone()
      url.pathname = '/app'
      return NextResponse.redirect(url)
    }
  }

  // Headers de segurança em todas as respostas
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.anthropic.com https://*.supabase.co https://api.stripe.com https://api.resend.com",
      "frame-src https://js.stripe.com",
    ].join('; ')
  )

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)',
  ],
}
