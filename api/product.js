export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  // Slug should be extracted from /product/my-slug
  const slug = url.pathname.split('/').pop();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let product = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/products?slug=eq.${slug}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        product = data[0];
      }
    } catch (e) {
      console.error('Failed to fetch product from Supabase:', e);
    }
  }

  // Fallback defaults if no product found or Supabase isn't configured
  const title = product ? `${product.name} | GLADYNS` : 'GLADYNS ALL ACROSS';
  const description = product ? product.description : 'Curated multi-department store featuring musical instruments, precision audio electronics, smart home appliances, and timeless apparel.';
  const image = product ? product.primaryImage : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop';
  
  // Clean up relative image paths to absolute if needed
  const absoluteImage = image.startsWith('http') ? image : `https://${req.headers.host}${image}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <!-- Open Graph for Facebook/WhatsApp -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${absoluteImage}">
    <meta property="og:url" content="https://${req.headers.host}/product/${slug}">
    <meta property="og:type" content="product">
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${absoluteImage}">
</head>
<body>
    <p>Redirecting to the Gladyns store...</p>
    <script>
        // Redirect to the actual app without causing an infinite loop (we append ?_r=1 to match the Vercel rewrite rule)
        window.location.replace("/product/${slug}?_r=1");
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Cache the HTML for fast WhatsApp scraping
  res.status(200).send(html);
}
