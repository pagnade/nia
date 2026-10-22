import { corridors } from '../lib/compare.js';

export function GET({ site }) {
  const paths = ['/', '/comment-ca-marche', '/mentions-legales', '/confidentialite', ...corridors().map((c) => `/envoyer/${c.slug}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
