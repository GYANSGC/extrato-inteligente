/**
 * GET /sitemap.xml
 * Gera sitemap dinâmico para SEO
 */
export default function handler(req, res) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://extratoInteligente.com.br'

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/precos', priority: '0.9', changefreq: 'monthly' },
    { url: '/privacidade', priority: '0.4', changefreq: 'yearly' },
    { url: '/termos', priority: '0.4', changefreq: 'yearly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${base}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return res.status(200).send(xml)
}
