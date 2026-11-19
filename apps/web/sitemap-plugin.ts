import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

/** Canonical address of the public site. */
export const SITE_URL = 'https://muvance.com';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/services', priority: '0.9' },
  { path: '/how-we-work', priority: '0.8' },
  { path: '/about', priority: '0.8' },
  { path: '/get-funded', priority: '0.8' },
  { path: '/training', priority: '0.7' },
  { path: '/blog', priority: '0.8' },
  { path: '/book', priority: '0.7' },
];

/** Industry pages (/services/<slug>), read from their content file. */
function readIndustries(industriesFile: string) {
  const source = readFileSync(industriesFile, 'utf8');
  return [...source.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]!);
}

/** Reads each blog post's slug and date straight from its source, so new posts are always listed. */
function readPosts(postsDir: string) {
  return readdirSync(postsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      const source = readFileSync(join(postsDir, d.name, 'index.ts'), 'utf8');
      const slug = /slug:\s*['"]([^'"]+)['"]/.exec(source)?.[1];
      const published = /published:\s*['"]([^'"]+)['"]/.exec(source)?.[1];
      return slug ? [{ slug, published }] : [];
    });
}

function buildSitemap(postsDir: string) {
  const industriesFile = join(postsDir, '../../company/content/industries.ts');
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...STATIC_ROUTES.map((r) => ({
      loc: `${SITE_URL}${r.path}`,
      lastmod: today,
      priority: r.priority,
    })),
    ...readIndustries(industriesFile).map((slug) => ({
      loc: `${SITE_URL}/services/${slug}`,
      lastmod: today,
      priority: '0.8',
    })),
    ...readPosts(postsDir).map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: p.published ?? today,
      priority: '0.6',
    })),
  ];
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

/** Emits /sitemap.xml at build time, and serves it in dev too. */
export function sitemap(postsDir: string): Plugin {
  return {
    name: 'muvance-sitemap',
    configureServer(server) {
      server.middlewares.use('/sitemap.xml', (_req, res) => {
        res.setHeader('Content-Type', 'application/xml');
        res.end(buildSitemap(postsDir));
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(postsDir) });
    },
  };
}
