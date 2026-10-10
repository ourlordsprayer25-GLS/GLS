const SUPABASE_URL = 'https://objlslsagvfbhiddwsbz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxzbHNhZ3ZmYmhpZGR3c2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzEzMDcsImV4cCI6MjEwNjM0NzMwN30.r3wuFy3TgByhbPs72WDQZGoX7LlAPn61UwAw6JF0lcY';

async function test() {
  const start = Date.now();
  console.log('Fetching first 5 products with images...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,images&limit=5&order=created_at.desc`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`
    }
  });
  console.log('Status:', res.status, 'Time:', Date.now() - start, 'ms');
  const data = await res.json();
  for (const p of data) {
    let len = 0;
    if (Array.isArray(p.images)) {
      for (const img of p.images) len += (img.url || '').length;
    }
    console.log(p.name, '-> length of images array:', len);
  }
}

test();
