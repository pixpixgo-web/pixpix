import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAvailableProviders } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const providers = getAvailableProviders();

  return new Response(
    JSON.stringify({ providers }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
