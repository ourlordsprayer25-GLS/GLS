import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const slug = url.pathname.split('/').filter(Boolean).pop();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let product = null;

  // 1. Try Supabase first
  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          product = data[0];
        }
      }
    } catch (e) {
      console.error('Supabase fetch failed:', e.message);
    }
  }

  // 2. Fallback: read from data-store.json if Supabase didn't return anything
  if (!product) {
    try {
      const dataStorePath = path.join(process.cwd(), 'data-store.json');
      if (fs.existsSync(dataStorePath)) {
        const raw = fs.readFileSync(dataStorePath, 'utf-8');
        const store = JSON.parse(raw);
        const allProducts = store.products || [];
        product = allProducts.find(p => p.slug === slug) || null;
      }
    } catch (e) {
      console.error('data-store.json read failed:', e.message);
    }
  }

  // 3. Build OG tag values
  const siteName = 'GLADYNS';
  const title = product ? `${product.name} | ${siteName}` : `${siteName} — Curated Department Store`;
  const description = product
    ? (product.description || product.subtitle || 'View this product on GLADYNS.')
    : 'Curated multi-department store featuring musical instruments, precision audio electronics, smart home appliances, and timeless apparel.';

  // Resolve the product image — use primaryImage if it's a full URL
  let image = null;
  if (product) {
    const raw = product.primaryImage || (product.images && product.images[0]?.url);
    if (raw && raw.startsWith('http')) {
      image = raw;
    }
    // If it's a relative path (e.g. /assets/images/...) make it absolute
    if (raw && raw.startsWith('/')) {
      image = `https://${req.headers.host}${raw}`;
    }
  }

  // Final fallback image — store banner, not a random stock image
  if (!image) {
    image = `https://${req.headers.host}/og-banner.jpg`;
  }

  const productUrl = `https://${req.headers.host}/product/${slug}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <!-- Open Graph (WhatsApp, Facebook, Telegram) -->
    <meta property="og:site_name" content="${siteName}">
    <meta property="og:type" content="product">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${productUrl}">
    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
</head>
<body>
    <p>Redirecting to the GLADYNS store...</p>
    <script>
        window.location.replace("/product/${slug}?_r=1");
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cache for 60s so WhatsApp scraper gets it fast, but updates propagate within a minute
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
