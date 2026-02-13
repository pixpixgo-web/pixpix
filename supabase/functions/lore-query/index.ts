import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, type AIProvider } from "../_shared/ai-provider.ts";

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
    const { question, gameContext, preferredProvider } = await req.json() as {
      question: string;
      gameContext: GameContext;
      preferredProvider?: AIProvider;
    };

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

    const { response, provider } = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      { preferredProvider }
    );

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "The ancient tome remains silent...";

    return new Response(
      JSON.stringify({ answer, provider }),
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
