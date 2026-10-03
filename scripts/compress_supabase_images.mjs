import sharp from 'sharp';

const SUPABASE_URL = "https://objlslsagvfbhiddwsbz.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxzbHNhZ3ZmYmhpZGR3c2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzEzMDcsImV4cCI6MjEwNjM0NzMwN30.r3wuFy3TgByhbPs72WDQZGoX7LlAPn61UwAw6JF0lcY";

async function compressBase64(dataUri) {
  if (!dataUri || !dataUri.startsWith('data:image/')) return dataUri;
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return dataUri;
  
  const base64Data = dataUri.slice(commaIdx + 1);
  const inputBuffer = Buffer.from(base64Data, 'base64');
  
  try {
    const outputBuffer = await sharp(inputBuffer)
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75, progressive: true })
      .toBuffer();
    
    return `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Sharp error:', err);
    return dataUri;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateWithRetry(productId, body, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
        method: 'PATCH',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) return true;
      console.warn(`Update attempt ${i + 1} status: ${res.status}`);
    } catch (err) {
      console.warn(`Update attempt ${i + 1} failed: ${err.message}`);
    }
    await sleep(2000);
  }
  return false;
}

async function main() {
  console.log('Fetching products from Supabase...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    }
  });
  
  const products = await res.json();
  console.log(`Loaded ${products.length} products.`);

  for (const p of products) {
    const origPrimaryLen = (p.primaryImage || '').length;
    let modified = false;

    // Skip if already small
    if (origPrimaryLen > 150000 || (p.images && p.images.some(i => (i.url || '').length > 150000))) {
      if (p.primaryImage && p.primaryImage.startsWith('data:image/')) {
        const compressedPrimary = await compressBase64(p.primaryImage);
        console.log(`[${p.name}] primaryImage: ${origPrimaryLen} -> ${compressedPrimary.length} (shrunk by ${Math.round((1 - compressedPrimary.length / origPrimaryLen) * 100)}%)`);
        p.primaryImage = compressedPrimary;
        modified = true;
      }

      if (Array.isArray(p.images)) {
        const newImages = [];
        for (const img of p.images) {
          if (img.url && img.url.startsWith('data:image/')) {
            const origLen = img.url.length;
            const compressed = await compressBase64(img.url);
            console.log(`[${p.name}] image: ${origLen} -> ${compressed.length} (shrunk by ${Math.round((1 - compressed.length / origLen) * 100)}%)`);
            newImages.push({ ...img, url: compressed });
            modified = true;
          } else {
            newImages.push(img);
          }
        }
        p.images = newImages;
      }

      if (modified) {
        console.log(`Updating product ${p.name} (${p.id}) in Supabase...`);
        const ok = await updateWithRetry(p.id, {
          primaryImage: p.primaryImage,
          images: p.images,
        });
        console.log(`Update success for ${p.name}:`, ok);
        await sleep(1500);
      }
    } else {
      console.log(`[${p.name}] already optimized (primaryImage: ${origPrimaryLen})`);
    }
  }

  console.log('Done optimizing existing products!');
}

main().catch(console.error);
