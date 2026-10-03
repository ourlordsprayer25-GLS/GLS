import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || "https://objlslsagvfbhiddwsbz.supabase.co";
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxzbHNhZ3ZmYmhpZGR3c2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzEzMDcsImV4cCI6MjEwNjM0NzMwN30.r3wuFy3TgByhbPs72WDQZGoX7LlAPn61UwAw6JF0lcY";

function isValidHttpUrl(urlCandidate?: string): boolean {
  if (!urlCandidate || typeof urlCandidate !== 'string') return false;
  const trimmed = urlCandidate.trim();
  if (trimmed.startsWith('YOUR_') || trimmed.includes('placeholder')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidKey(keyCandidate?: string): boolean {
  if (!keyCandidate || typeof keyCandidate !== 'string') return false;
  const trimmed = keyCandidate.trim();
  return (
    trimmed.length > 20 &&
    !trimmed.startsWith('YOUR_') &&
    !trimmed.includes('placeholder')
  );
}

export const isSupabaseConfigured = isValidHttpUrl(rawUrl) && isValidKey(rawKey);

// Safe fallback URL that complies with Supabase createClient URL validation
const fallbackUrl = 'https://gladyns-store-placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTJ9.placeholder';

const targetUrl = isValidHttpUrl(rawUrl) ? rawUrl!.trim() : fallbackUrl;
const targetKey = (rawKey && typeof rawKey === 'string' && rawKey.trim().length > 10) ? rawKey.trim() : fallbackKey;

let client: SupabaseClient;

try {
  client = createClient(targetUrl, targetKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} catch (err) {
  console.warn('Failed to initialize Supabase client with environment variables, using fallback client:', err);
  client = createClient(fallbackUrl, fallbackKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = client;
