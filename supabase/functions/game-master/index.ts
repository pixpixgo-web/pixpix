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
    stamina: number;
    maxStamina: number;
    mana: number;
    maxMana: number;
    offense: number;
    defense: number;
    magic: number;
    currentZone: string;
    level: number;
    xp: number;
    backstory: string | null;
    // Detailed skills
    skills?: Record<string, number>;
    // Reputation
    reputation?: Record<string, number>;
    storyPhase?: string;
    betrayersDefeated?: string[];
  };
  inventory: Array<{ name: string; description: string | null; quantity: number }>;
  companions: Array<{ name: string; personality: string; hp: number; maxHp: number; trust: number }>;
  recentMessages: Array<{ role: string; content: string }>;
  isFreeAction: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, gameContext, diceRoll, preferredProvider } = await req.json() as {
      action: string;
      gameContext: GameContext;
      diceRoll?: number;
      preferredProvider?: AIProvider;
    };

    const c = gameContext.character;

    const companionContext = gameContext.companions.length > 0
      ? `\n\nCurrent Party:\n${gameContext.companions.map(comp => 
          `- ${comp.name} (${comp.personality}): HP ${comp.hp}/${comp.maxHp}, Trust: ${comp.trust}%`
        ).join('\n')}`
      : '';

    const inventoryContext = gameContext.inventory.length > 0
      ? `\n\nInventory:\n${gameContext.inventory.map(i => `- ${i.name} x${i.quantity}${i.description ? `: ${i.description}` : ''}`).join('\n')}`
      : '\n\nInventory: Empty.';

    const backstoryContext = c.backstory ? `\n\nBackstory: ${c.backstory}` : '';

    // Determine stamina state for momentum
    const staminaPct = c.stamina / c.maxStamina;
    const staminaState = staminaPct >= 0.8 ? 'Fresh' : staminaPct > 0.2 ? 'Winded' : 'Exhausted';
    const manaState = c.mana <= 0 ? 'Deficient (Shaking)' : c.mana < c.maxMana * 0.2 ? 'Drained' : 'Normal';

    // Build skills context
    const skills = c.skills || {};
    const nonZeroSkills = Object.entries(skills).filter(([_, v]) => v > 0);
    const skillsContext = nonZeroSkills.length > 0
      ? `\n\nActive Skills:\n${nonZeroSkills.map(([k, v]) => `- ${k}: ${v}/100`).join('\n')}`
      : '';

    const rep = c.reputation || {};
    const nonZeroRep = Object.entries(rep).filter(([_, v]) => v !== 0);
    const repContext = nonZeroRep.length > 0
      ? `\n\nReputation:\n${nonZeroRep.map(([k, v]) => `- ${k}: ${v}`).join('\n')}`
      : '';

    const revengeContext = c.betrayersDefeated && c.betrayersDefeated.length > 0
      ? `\n\nBetrayers Defeated: ${c.betrayersDefeated.join(', ')}`
      : '';

    const systemPrompt = `You are an immersive Game Master for a dark fantasy RPG revenge story. The player was betrayed and left for dead. They seek vengeance.

STORY PHASE: ${c.storyPhase || 'the_fall'}

CURRENT STATE:
- Character: ${c.name} (${c.characterClass}) Level ${c.level}
- Location: ${c.currentZone}
- HP: ${c.hp}/${c.maxHp}
- Stamina: ${c.stamina}/${c.maxStamina} [${staminaState}]
- Mana: ${c.mana}/${c.maxMana} [${manaState}]
- Gold: ${c.gold} | XP: ${c.xp}
- Stats: Offense ${c.offense}/10, Defense ${c.defense}/10, Magic ${c.magic}/10
${skillsContext}${repContext}${inventoryContext}${companionContext}${backstoryContext}${revengeContext}

STAMINA SYSTEM (replaces AP):
- Actions cost Stamina based on effort the AI (you) judges:
  * Low (1-5): Dashing, quick strikes, climbing a fence, intimidation
  * Mid (6-15): Heavy swings, short travel, complex spells, bartering
  * High (16-25): Long-distance travel, ultimate moves, surviving a boss hit
- FREE ACTIONS (talk, look, defend, rest) cost 0 Stamina and regenerate +5-10 Stamina naturally
- DEFENDING against an attack grants +10 Stamina (Active Recovery) and a Momentum multiplier:
  * Fresh (80%+ Stamina): x1.2 damage on next attack
  * Winded (low Stamina): x1.8 damage (desperation boost)
  * Exhausted/Shaking: x2.5 damage (huge risk, huge reward)

MANA & SPELL SYSTEM:
- Spells cost Mana by tier: Cantrip (5-10), Skill (15-30), Great (35-60), Master (70-100), Mythic (120+)
- MANA DEFICIENCY: If a player casts without enough Mana:
  * Stage 1 (Drained): Stamina costs are multiplied by 1.5x
  * Stage 2 (Shaking): Next spell causes the character to faint
  * The exact stage depends on class (High Magic classes are more resilient)
- Bloodmancy spells can cost HP instead of Mana

DICE ROLL: ${diceRoll ?? 'None'} (1-3: critical fail, 4-6: fail, 7-9: barely scrape by, 10-15: acceptable outcome, 16-17: success, 18-19: great success, 20: best possible outcome). The dice should subtly influence the narrative — don't announce the roll or make it the focus. Just let the result naturally shape how well the action goes.

RULES:
1. Respond in second person. Keep it atmospheric (2-4 paragraphs).
2. ALWAYS factor the dice roll into the outcome.
3. The player's action message starts with a [STATUS: ...] line showing their CURRENT HP, Stamina, Mana, Gold, and Level. ALWAYS use these values as the ground truth for their resources — do NOT rely on the context block above if they differ.
4. Judge stamina/mana costs based on the action's effort level.
5. For FREE ACTIONS: No combat. Regenerate stamina naturally (+5 to +10).
6. Track inventory precisely - if they use an item they don't have, say so.
7. Companions act based on personality and trust level.
8. Award XP for combat victories (10-50 based on difficulty) and story milestones.
9. Messages starting with [SYSTEM:] are notifications (like level-ups). Acknowledge them briefly in your narrative.
${gameContext.isFreeAction ? '\nThis is a FREE ACTION - no stamina cost, no combat triggers. Regenerate some stamina.' : ''}

RESPONSE FORMAT:
Write your narrative, then include a JSON block for state changes:
\`\`\`json
{
  "hpChange": 0,
  "goldChange": 0,
  "staminaChange": 0,
  "manaChange": 0,
  "xpGain": 0,
  "newItems": [],
  "removeItems": [],
  "trustChanges": [],
  "newCompanion": null,
  "journalEntry": null,
  "zoneChange": null
}
\`\`\`
- staminaChange: negative for costs, positive for recovery (defend: +10, free actions: +5 to +10, rest: based on zone)
- manaChange: negative for spell costs, positive for recovery
- removeItems: array of item name strings to remove from inventory
- zoneChange: MUST be one of these exact IDs when the player moves: tavern, village, forest, dungeon, caves, ruins, abyss. ALWAYS set this if the narrative implies the player has moved location.
- journalEntry: {"title": "...", "content": "..."} for significant story beats
- newCompanion: {"name": "...", "personality": "...", "icon": "emoji", "description": "...", "hp": number, "max_hp": number} — hp should scale with character level (e.g., 80-150 for mercenaries). Do NOT add a companion that is already in the party.
Only include JSON if changes occurred.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...gameContext.recentMessages.slice(-10).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: action },
    ];

    const { response, provider } = await callAI(messages, { preferredProvider });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "The mists swirl around you...";

    let narrative = content;
    let gameChanges = null;

    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      narrative = content.replace(/```json\n?[\s\S]*?\n?```/, '').trim();
      try {
        gameChanges = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse game changes:", e);
      }
    }

    return new Response(
      JSON.stringify({ narrative, gameChanges, provider }),
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
