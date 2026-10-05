import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  let host = req.headers['x-forwarded-host'] || req.headers.host || 'www.gladyns.store';
  // Canonicalize apex domain to www.gladyns.store to avoid Vercel 308 redirect which causes WhatsApp to drop preview images
  if (host === 'gladyns.store') {
    host = 'www.gladyns.store';
  }
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

  // 3. Build OG tag values matching reference format:
  // Title: "Dahua Camera 4464 — FCFA 18,000.00"
  // Description: "FCFA 18,000.00 (was FCFA 20,000.00, -10%) • In Stock • Dahua"
  const siteName = 'GLADYNS';
  let title = `${siteName} — Curated Department Store`;
  let description = 'Curated multi-department store featuring musical instruments, precision audio electronics, smart home appliances, and timeless apparel.';

  if (product) {
    const rawPrice = Number(product.price);
    const rawOrig = Number(product.originalPrice);

    // Convert price to FCFA (in this store, USD base * 605 = FCFA)
    const curPriceCFA = !isNaN(rawPrice) && rawPrice > 0
      ? (rawPrice < 500 ? Math.round(rawPrice * 605) : Math.round(rawPrice))
      : 0;

    const origPriceCFA = !isNaN(rawOrig) && rawOrig > 0
      ? (rawOrig < 500 ? Math.round(rawOrig * 605) : Math.round(rawOrig))
      : 0;

    const formatMoney = (n) => 'FCFA ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formattedPrice = curPriceCFA > 0 ? formatMoney(curPriceCFA) : '';
    const formattedOrig = origPriceCFA > 0 ? formatMoney(origPriceCFA) : '';

    const discountPct = (origPriceCFA > curPriceCFA && curPriceCFA > 0)
      ? Math.round(((origPriceCFA - curPriceCFA) / origPriceCFA) * 100)
      : 0;

    const isOutOfStock = product.inStock === false || product.stockLevel === 0;
    const stockStr = isOutOfStock ? 'Out of Stock' : 'In Stock';
    const brandStr = product.brand || 'GLADYNS';

    // Title: "Product Name — FCFA 18,000.00"
    if (formattedPrice) {
      title = `${product.name} — ${formattedPrice}`;
    } else {
      title = `${product.name} | ${siteName}`;
    }

    // Description: "FCFA 18,000.00 (was FCFA 20,000.00, -10%) • In Stock • Dahua"
    const descParts = [];
    if (formattedPrice) {
      if (discountPct > 0 && formattedOrig) {
        descParts.push(`${formattedPrice} (was ${formattedOrig}, -${discountPct}%)`);
      } else {
        descParts.push(formattedPrice);
      }
      descParts.push(stockStr);
      if (brandStr) descParts.push(brandStr);
      description = descParts.join(' • ');
    } else {
      description = (product.description || product.subtitle || `Explore ${product.name} on ${siteName}.`).replace(/"/g, '&quot;');
    }
  }

  // Resolve the product image with explicit .jpg extension for WhatsApp Mobile Parser regex matching
  let image = null;
  if (product) {
    const raw = product.primaryImage || 
                (product.images && product.images[0]?.url) || 
                (product.images && typeof product.images[0] === 'string' ? product.images[0] : null);
    
    if (raw) {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        image = raw.replace('https://gladyns.store', 'https://www.gladyns.store').replace('http://gladyns.store', 'https://www.gladyns.store');
      } else if (raw.startsWith('/')) {
        image = `https://${host}${raw}`;
      } else if (raw.startsWith('data:image/')) {
        // Base64 image: Serve through binary endpoint ending in .jpg so WhatsApp regex validates it!
        image = `https://${host}/api/product-image/${encodeURIComponent(product.id || slug)}.jpg`;
      }
    }
  }

  // Fallback image if product has no image or product not found
  if (!image) {
    image = `https://${host}/api/product-image/${encodeURIComponent(slug || 'default')}.jpg`;
  }

  const productUrl = `https://${host}/product/${slug}`;
  const imgType = (image && image.endsWith('.png')) ? 'image/png' : (image && image.endsWith('.webp')) ? 'image/webp' : 'image/jpeg';

  const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">

    <!-- Open Graph Image First for Mobile Parsers (WhatsApp, iMessage, Facebook) -->
    <meta property="og:image" content="${image}">
    <meta property="og:image:secure_url" content="${image}">
    <meta property="og:image:type" content="${imgType}">
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
