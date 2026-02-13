// Shared AI provider fallback logic: Groq → OpenRouter → Lovable → Gemini
// Returns the response and which provider was used

export type AIProvider = 'groq' | 'lovable' | 'gemini' | 'openrouter';

interface ProviderConfig {
  key: string;
  url: string;
  model: string;
  name: AIProvider;
}

export interface AIResponse {
  response: Response;
  provider: AIProvider;
}

function getProviders(preferredProvider?: AIProvider): ProviderConfig[] {
  const GROQ_KEY = Deno.env.get("GROQ_API_KEY");
  const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
  const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");

  const allProviders: (ProviderConfig | null)[] = [
    GROQ_KEY ? {
      key: GROQ_KEY,
      url: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
      name: 'groq' as AIProvider,
    } : null,
    OPENROUTER_KEY ? {
      key: OPENROUTER_KEY,
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: "tngtech/deepseek-r1t2-chimera:free",
      name: 'openrouter' as AIProvider,
    } : null,
    LOVABLE_KEY ? {
      key: LOVABLE_KEY,
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      model: "google/gemini-3-flash-preview",
      name: 'lovable' as AIProvider,
    } : null,
    GOOGLE_KEY ? {
      key: GOOGLE_KEY,
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: "gemini-2.5-flash",
      name: 'gemini' as AIProvider,
    } : null,
  ];

  const available = allProviders.filter(Boolean) as ProviderConfig[];

  // If preferred provider is set, move it to front
  if (preferredProvider) {
    const idx = available.findIndex(p => p.name === preferredProvider);
    if (idx > 0) {
      const [preferred] = available.splice(idx, 1);
      available.unshift(preferred);
    }
  }

  return available;
}

export async function callAI(
  messages: Array<{ role: string; content: string }>,
  options?: { stream?: boolean; preferredProvider?: AIProvider }
): Promise<AIResponse> {
  const providers = getProviders(options?.preferredProvider);
  if (providers.length === 0) {
    throw new Error("No API keys configured (need GROQ_API_KEY, OPENROUTER_API_KEY, LOVABLE_API_KEY, or GOOGLE_GEMINI_API_KEY)");
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`Trying AI provider: ${provider.name}`);
      const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.key}`,
          "Content-Type": "application/json",
          ...(provider.name === 'openrouter' ? { "HTTP-Referer": "https://pixpix.lovable.app" } : {}),
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          stream: options?.stream ?? false,
        }),
      });

      if (response.ok) {
        console.log(`AI provider ${provider.name} succeeded`);
        return { response, provider: provider.name };
      }

      // Don't fallback on 429/402 — these are user-specific limits
      if (response.status === 429 || response.status === 402) {
        // Try next provider instead of failing immediately
        const errorText = await response.text();
        console.warn(`Provider ${provider.name} returned ${response.status}: ${errorText}`);
        lastError = new Error(`${provider.name}: ${response.status}`);
        continue;
      }

      const errorText = await response.text();
      console.warn(`Provider ${provider.name} failed (${response.status}): ${errorText}`);
      lastError = new Error(`${provider.name} error: ${response.status}`);
      continue;
    } catch (e) {
      console.warn(`Provider ${provider.name} threw:`, e);
      lastError = e instanceof Error ? e : new Error(String(e));
      continue;
    }
  }

  throw lastError || new Error("All AI providers failed");
}

// Check which providers have keys configured
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (Deno.env.get("GROQ_API_KEY")) providers.push('groq');
  if (Deno.env.get("OPENROUTER_API_KEY")) providers.push('openrouter');
  if (Deno.env.get("LOVABLE_API_KEY")) providers.push('lovable');
  if (Deno.env.get("GOOGLE_GEMINI_API_KEY")) providers.push('gemini');
  return providers;
}
