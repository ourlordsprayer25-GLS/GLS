const SUPABASE_URL = 'https://objlslsagvfbhiddwsbz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxzbHNhZ3ZmYmhpZGR3c2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzEzMDcsImV4cCI6MjEwNjM0NzMwN30.r3wuFy3TgByhbPs72WDQZGoX7LlAPn61UwAw6JF0lcY';

async function testRpc() {
  const start = Date.now();
  console.log('Testing get_store_products RPC...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_store_products`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  console.log('RPC status:', res.status, 'in', Date.now() - start, 'ms');
  const body = await res.text();
  console.log('Response body:', body.slice(0, 300));
}

testRpc();
