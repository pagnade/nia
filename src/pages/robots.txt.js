export function GET({ site }) {
  const sitemap = site ? `Sitemap: ${new URL('/sitemap.xml', site).href}\n` : '';
  return new Response(`User-agent: *\nDisallow: /go/\n${sitemap}`, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
