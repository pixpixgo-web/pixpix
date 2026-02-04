import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GameContext {
  character: {
    name: string;
    characterClass: string;
    hp: number;
    maxHp: number;
    gold: number;
    offense: number;
    defense: number;
    magic: number;
    currentZone: string;
  };
  inventory: Array<{ name: string; description: string | null; quantity: number }>;
  companions: Array<{ name: string; personality: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, gameContext } = await req.json() as {
      question: string;
      gameContext: GameContext;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context for lore queries
    const inventoryList = gameContext.inventory.length > 0
      ? gameContext.inventory.map(i => `- ${i.name} x${i.quantity}${i.description ? `: ${i.description}` : ''}`).join('\n')
      : 'Empty inventory';

    const companionList = gameContext.companions.length > 0
      ? gameContext.companions.map(c => `- ${c.name} (${c.personality})`).join('\n')
      : 'No companions';

    const systemPrompt = `You are a helpful game assistant for a dark fantasy RPG. You answer questions about the game world, mechanics, and provide strategic advice WITHOUT progressing the story.

CURRENT GAME STATE:
- Character: ${gameContext.character.name} (${gameContext.character.characterClass})
- Location: ${gameContext.character.currentZone}
- HP: ${gameContext.character.hp}/${gameContext.character.maxHp}
- Gold: ${gameContext.character.gold}
- Stats: Offense ${gameContext.character.offense}/10, Defense ${gameContext.character.defense}/10, Magic ${gameContext.character.magic}/10

INVENTORY:
${inventoryList}

COMPANIONS:
${companionList}

RULES:
1. NEVER progress the story or describe game events
2. NEVER consume Action Points - this is purely informational
3. Answer questions about:
   - Item comparisons and recommendations
   - Strategy advice
   - Lore and world information
   - Character ability explanations
   - Combat tactics
4. Keep answers concise but helpful
5. Reference the player's actual inventory and stats when relevant
6. Be in-character as a mystical advisor or ancient tome`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "The ancient tome remains silent...";

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("lore-query error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
