export function GET({ site }) {
  return new Response(`User-agent: *\nDisallow: /go/\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
