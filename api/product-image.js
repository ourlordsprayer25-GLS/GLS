import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'gls-sepia.vercel.app';
  const url = new URL(req.url, `https://${host}`);
  const id = url.searchParams.get('id') || url.pathname.split('/').filter(Boolean).pop();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let product = null;

  if (supabaseUrl && supabaseKey && id) {
    try {
      const encoded = encodeURIComponent(id);
      const queryUrl = `${supabaseUrl}/rest/v1/products?or=(id.eq.${encoded},slug.eq.${encoded})&select=*`;
      const response = await fetch(queryUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) product = data[0];
      }
    } catch (e) {
      console.error('Error fetching product in image endpoint:', e.message);
    }
  }

  if (!product && id) {
    try {
      const dataStorePath = path.join(process.cwd(), 'data-store.json');
      if (fs.existsSync(dataStorePath)) {
        const raw = fs.readFileSync(dataStorePath, 'utf-8');
        const store = JSON.parse(raw);
        const allProducts = store.products || [];
        product = allProducts.find(p => p.id === id || p.slug === id) || null;
      }
    } catch (e) {
      console.error('Error reading data-store.json in image endpoint:', e.message);
    }
  }

  const rawImage = product?.primaryImage || 
                   (product?.images && product?.images[0]?.url) || 
                   (product?.images && typeof product?.images[0] === 'string' ? product?.images[0] : null);

  // 1. If base64 data URL, convert buffer and stream directly
  if (rawImage && rawImage.startsWith('data:image/')) {
    const matches = rawImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (matches) {
      const mimeType = matches[1];
      const base64Data = matches[2];
      const imgBuffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      return res.status(200).send(imgBuffer);
    }
  }

  // 2. If standard HTTP/HTTPS URL, redirect directly
  if (rawImage && (rawImage.startsWith('http://') || rawImage.startsWith('https://'))) {
    return res.redirect(302, rawImage);
  }

  // 3. Fallback: serve default store banner image
  try {
    const bannerPath = path.join(process.cwd(), 'public', 'og-banner.jpg');
    if (fs.existsSync(bannerPath)) {
      const banner = fs.readFileSync(bannerPath);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(banner);
    }
  } catch (e) {}

  res.status(404).send('Product image not found');
}
