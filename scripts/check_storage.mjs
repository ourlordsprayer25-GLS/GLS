const SUPABASE_URL = 'https://objlslsagvfbhiddwsbz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxzbHNhZ3ZmYmhpZGR3c2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzEzMDcsImV4cCI6MjEwNjM0NzMwN30.r3wuFy3TgByhbPs72WDQZGoX7LlAPn61UwAw6JF0lcY';

async function checkStorage() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`
    }
  });
  console.log('Buckets status:', res.status);
  const data = await res.json();
  console.log('Buckets:', data);
}
checkStorage();
