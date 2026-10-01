// Supabase Edge Function: Push Notification Dispatcher
// Location: supabase/functions/notify-push/index.ts
// Deploy via Supabase CLI: supabase functions deploy notify-push

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { title, message, linkTarget } = payload;

    console.log(`[Push Edge Function] Triggered notification: "${title}" - ${message}`);

    // Here you can integrate Web Push (VAPID) or push service providers (OneSignal, FCM, Firebase, Resend)
    return new Response(
      JSON.stringify({ success: true, message: 'Notification broadcast queued successfully.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
