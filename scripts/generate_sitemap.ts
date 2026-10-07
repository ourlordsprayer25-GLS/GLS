import fs from 'fs';
import path from 'path';

async function generateSitemap() {
  const dataPath = path.join(process.cwd(), 'data-store.json');
  let products: any[] = [];
  try {
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      products = data.products || [];
    }
  } catch (e) {
    console.error('Error reading data-store.json:', e);
  }

  const today = new Date().toISOString().split('T')[0];
  const baseUrl = 'https://www.gladyns.store';

  const staticRoutes = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
  ];

  const productRoutes = products.map((p) => ({
    loc: `${baseUrl}/product/${p.id || p.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const allRoutes = [...staticRoutes, ...productRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), xml, 'utf-8');
  console.log(`Generated public/sitemap.xml with ${allRoutes.length} URLs`);

  const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://www.gladyns.store/sitemap.xml
`;
  fs.writeFileSync(path.join(process.cwd(), 'public', 'robots.txt'), robots, 'utf-8');
  console.log('Generated public/robots.txt');
}

generateSitemap();
