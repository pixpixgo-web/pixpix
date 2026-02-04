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
    actionPoints: number;
    offense: number;
    defense: number;
    magic: number;
    currentZone: string;
  };
  inventory: Array<{ name: string; description: string | null; quantity: number }>;
  companions: Array<{
    name: string;
    personality: string;
    hp: number;
    maxHp: number;
    trust: number;
  }>;
  recentMessages: Array<{ role: string; content: string }>;
  isFreeAction: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, gameContext, diceRoll } = await req.json() as {
      action: string;
      gameContext: GameContext;
      diceRoll?: number;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build companion context
    const companionContext = gameContext.companions.length > 0
      ? `\n\nCurrent Party Members:\n${gameContext.companions.map(c => 
          `- ${c.name} (${c.personality}): HP ${c.hp}/${c.maxHp}, Trust: ${c.trust}% ${
            c.trust >= 70 ? '(Loyal - grants bonuses)' : 
            c.trust >= 40 ? '(Neutral)' : 
            '(Wary - may betray or leave)'
          }`
        ).join('\n')}`
      : '';

    // Build inventory context
    const inventoryContext = gameContext.inventory.length > 0
      ? `\n\nPlayer Inventory:\n${gameContext.inventory.map(i => 
          `- ${i.name} x${i.quantity}${i.description ? `: ${i.description}` : ''}`
        ).join('\n')}`
      : '\n\nPlayer has no items.';

    // Determine action type context
    const actionTypeContext = gameContext.isFreeAction 
      ? `\n\nACTION TYPE: FREE ACTION - This is a non-combat action (talking, looking, etc). Do NOT consume AP or trigger dangerous encounters.`
      : `\n\nACTION TYPE: PAID ACTION - This action costs AP and can trigger combat or dangerous events.`;

    const systemPrompt = `You are an immersive Game Master for a dark fantasy RPG set in a medieval world. Your responses should be atmospheric, engaging, and reactive to the player's choices.

CURRENT GAME STATE:
- Character: ${gameContext.character.name} (${gameContext.character.characterClass})
- Location: ${gameContext.character.currentZone}
- HP: ${gameContext.character.hp}/${gameContext.character.maxHp}
- Gold: ${gameContext.character.gold}
- Action Points: ${gameContext.character.actionPoints}
- Stats: Offense ${gameContext.character.offense}/10, Defense ${gameContext.character.defense}/10, Magic ${gameContext.character.magic}/10
${inventoryContext}${companionContext}${actionTypeContext}

STAT SCALING (1-10):
- Use these stats to determine success likelihood. Higher offense = more damage, higher defense = less damage taken, higher magic = more powerful spells.
- Compare player stats to enemy difficulty when calculating outcomes.

RULES:
1. Always respond in second person ("You walk into...", "You see...")
2. Keep responses concise but atmospheric (2-4 paragraphs max)
3. React specifically to the player's inventory - if they try to use an item they don't have, tell them
4. Track game state changes and include commands for the game engine when needed
5. Make companions act according to their personality during combat or tense situations:
   - Brave/Aggressive: Charge in, protect the player
   - Cowardly: Stay back, might flee if things go badly
   - Wise: Offer advice, use magic carefully
   - Cunning: Look for tactical advantages
6. Trust affects companion behavior:
   - High trust (70+): Companions provide bonuses, are reliable
   - Medium trust (40-69): Companions are neutral, may hesitate
   - Low trust (<40): Companions might betray, refuse orders, or leave
7. When combat happens, narrate companion actions based on their personality
8. For FREE ACTIONS: Do not trigger combat or dangerous events. Just describe the scene/conversation.
9. For PAID ACTIONS: Combat, travel, and risky actions can have consequences.

${diceRoll ? `\nDICE ROLL RESULT: ${diceRoll} (1-9: failure, 10-14: partial success, 15-19: success, 20: critical success, 1: critical failure)` : ''}

RESPONSE FORMAT:
Your narrative response should be engaging. At the end, if game state changes are needed, add a JSON block like:
\`\`\`json
{
  "hpChange": 0,
  "goldChange": 0,
  "newItems": [],
  "removeItems": [],
  "trustChanges": [{"name": "Companion Name", "change": 5}],
  "newCompanion": null,
  "journalEntry": null
}
\`\`\`

Only include the JSON if changes occurred. For newCompanion, use format: {"name": "Name", "personality": "brave/cowardly/wise/aggressive/cunning", "icon": "emoji", "description": "brief description"}
For journalEntry, use format: {"title": "Title", "content": "Summary of this story beat"}`;

    // Build messages from recent history
    const messages = [
      { role: "system", content: systemPrompt },
      ...gameContext.recentMessages.slice(-10).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      })),
      { role: "user", content: action }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue your adventure." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "The mists swirl around you, obscuring your path...";

    // Parse the response for game state changes
    let narrative = content;
    let gameChanges = null;

    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      narrative = content.replace(/```json\n?[\s\S]*?\n?```/, '').trim();
      try {
        gameChanges = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse game changes JSON:", e);
      }
    }

    return new Response(
      JSON.stringify({ narrative, gameChanges }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("game-master error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
