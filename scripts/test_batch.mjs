const SUPABASE_URL = 'https://objlslsagvfbhiddwsbz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxzbHNhZ3ZmYmhpZGR3c2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzEzMDcsImV4cCI6MjEwNjM0NzMwN30.r3wuFy3TgByhbPs72WDQZGoX7LlAPn61UwAw6JF0lcY';

async function testBatch() {
  const start = Date.now();
  console.log('Fetching first batch of 6 products...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,slug,name,subtitle,tagline,price,originalPrice,category,categoryLabel,department,warranty,condition,specs,brand,brandOrigin,tag,isNewArrival,isHotDeal,discountPercentage,dealEndsIn,description,materials,care,primaryImage,colors,sizes,rating,reviewCount,featured,modelInfo,madeIn,sku,barcode,stockLevel,created_at&order=created_at.desc&limit=6`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`
    }
  });
  const data = await res.json();
  console.log('Batch 1 loaded in:', Date.now() - start, 'ms', 'Count:', data.length);
}
testBatch();
