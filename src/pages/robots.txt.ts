export function GET({ site }: { site: URL | undefined }) {
  const origin = site ?? new URL('https://example.com');
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap-index.xml', origin)}\n`,
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    },
  );
}
