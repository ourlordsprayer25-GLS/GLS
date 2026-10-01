import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'gls-sepia.vercel.app';
  const url = new URL(req.url, `https://${host}`);
  const slug = url.pathname.split('/').filter(Boolean).pop();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let product = null;

  // 1. Try Supabase first — matching BOTH id and slug (case insensitive)
  if (supabaseUrl && supabaseKey && slug) {
    try {
      const encoded = encodeURIComponent(slug);
      const queryUrl = `${supabaseUrl}/rest/v1/products?or=(id.eq.${encoded},slug.eq.${encoded})&select=*`;
      const response = await fetch(queryUrl, {
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
      console.error('Supabase fetch failed in api/product:', e.message);
    }
  }

  // 2. Fallback: read from data-store.json if Supabase didn't return anything
  if (!product && slug) {
    try {
      const dataStorePath = path.join(process.cwd(), 'data-store.json');
      if (fs.existsSync(dataStorePath)) {
        const raw = fs.readFileSync(dataStorePath, 'utf-8');
        const store = JSON.parse(raw);
        const allProducts = store.products || [];
        product = allProducts.find(p => 
          p.id === slug || 
          p.slug === slug || 
          p.id?.toLowerCase() === slug.toLowerCase() ||
          p.slug?.toLowerCase() === slug.toLowerCase()
        ) || null;
      }
    } catch (e) {
      console.error('data-store.json read failed in api/product:', e.message);
    }
  }

  // 3. Build OG tag values
  const siteName = 'GLADYNS';
  const title = product ? `${product.name} | ${siteName}` : `${siteName} — Curated Department Store`;
  const description = product
    ? (product.description || product.subtitle || `Explore ${product.name} on ${siteName}.`).replace(/"/g, '&quot;')
    : 'Curated multi-department store featuring musical instruments, precision audio electronics, smart home appliances, and timeless apparel.';

  // Resolve the product image
  let image = null;
  if (product) {
    const raw = product.primaryImage || 
                (product.images && product.images[0]?.url) || 
                (product.images && typeof product.images[0] === 'string' ? product.images[0] : null);
    
    if (raw) {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        image = raw;
      } else if (raw.startsWith('/')) {
        image = `https://${host}${raw}`;
      } else if (raw.startsWith('data:image/')) {
        // Base64 image: Serve through binary endpoint so WhatsApp can render real image!
        image = `https://${host}/api/product-image?id=${encodeURIComponent(product.id || slug)}`;
      }
    }
  }

  // Fallback image if product has no image or product not found
  if (!image) {
    image = `https://${host}/api/product-image?id=${encodeURIComponent(slug || 'default')}`;
  }

  const productUrl = `https://${host}/product/${slug}`;

  const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">

    <!-- Open Graph Image First for Mobile Parsers (WhatsApp, iMessage, Facebook) -->
    <meta property="og:image" content="${image}">
    <meta property="og:image:secure_url" content="${image}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Open Graph General Metadata -->
    <meta property="og:site_name" content="${siteName}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${productUrl}">
    <meta property="fb:app_id" content="${process.env.FB_APP_ID || '966242223397117'}">

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@gladyns">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
</head>
<body>
    <p>Redirecting to ${title}...</p>
    <script>
        window.location.replace("/product/${slug}?_r=1");
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
