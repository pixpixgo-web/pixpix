import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, type AIProvider } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { backstory, characterName, className, classCategory, preferredProvider } = await req.json() as {
      backstory: string;
      characterName: string;
      className: string;
      classCategory: string;
      preferredProvider?: AIProvider;
    };

    const systemPrompt = `You are a narrator for a dark fantasy RPG revenge story. Given a character's backstory, name, and class, generate their ORIGIN — where they begin, what items they have, and a dramatic intro.

RULES:
- startingZone: Choose based on backstory logic. Must be one of: tavern, village, forest, dungeon, caves, ruins, abyss.
  Examples: royalty/castle → village or dungeon (prisoner), street urchin → tavern, hermit/druid → forest, miner/prisoner → caves or dungeon, explorer/archaeologist → ruins, cursed/demonic → abyss.
  Default to "tavern" only if nothing else fits.
- introNarrative: 2-3 paragraphs in second person. Atmospheric, dark fantasy tone. Describe where they are, reference their past, and hint at the betrayal that drives the revenge plot. End with an implicit prompt for what they might do next. Do NOT use the word "you" in the first word — start dramatically.
- bonusItems: 1-3 items that make sense for the backstory (e.g., knight's child → family sword, mage's apprentice → torn spellbook, street urchin → lockpicks). Each item has name, description, icon (emoji), quantity, item_type (weapon/armor/consumable/misc/tool).
- skillBoosts: 2-5 skill boosts from the backstory (e.g., noble → persuasion +10, honor +10; street urchin → stealth +10, sleight_of_hand +8).
  Valid skill keys: brawling, one_handed, two_handed, acrobatics, climbing, stealth, sleight_of_hand, aim, bloodmancy, necromancy, soulbinding, destruction, alteration, illusion, regeneration, persuasion, intimidation, seduction, investigation, bartering, beastmastery, bravery, mercy, honor, infamy, justice, loyalty, malice.
  Values should be +5 to +15 each. Total boosts should be 15-40.
- If backstory is empty or very short, create a generic but interesting origin based on the class.

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "startingZone": "string",
  "introNarrative": "string",
  "bonusItems": [{"name": "string", "description": "string", "icon": "string", "quantity": 1, "item_type": "string"}],
  "skillBoosts": {"skill_key": number}
}`;

    const { response, provider } = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Character: ${characterName}\nClass: ${className} (${classCategory})\nBackstory: ${(backstory || "No backstory provided").slice(0, 500)}` },
      ],
      { preferredProvider }
    );

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let originData;
    try {
      originData = JSON.parse(content);
    } catch {
      console.error("Failed to parse origin response:", content);
      return new Response(JSON.stringify({
        startingZone: "tavern",
        introNarrative: `Darkness clings to the edges of your vision as consciousness returns. You are ${characterName}, and the memory of betrayal burns hotter than any wound. The tavern around you reeks of cheap ale and old smoke — but it's shelter, and right now, that's enough. Your journey of vengeance begins here.`,
        bonusItems: [],
        skillBoosts: {},
        provider,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validZones = ["tavern", "village", "forest", "dungeon", "caves", "ruins", "abyss"];
    if (!validZones.includes(originData.startingZone)) {
      originData.startingZone = "tavern";
    }

    const validSkills = new Set([
      'brawling','one_handed','two_handed','acrobatics','climbing','stealth','sleight_of_hand','aim',
      'bloodmancy','necromancy','soulbinding','destruction','alteration','illusion','regeneration',
      'persuasion','intimidation','seduction','investigation','bartering','beastmastery',
      'bravery','mercy','honor','infamy','justice','loyalty','malice',
    ]);
    const cleanBoosts: Record<string, number> = {};
    if (originData.skillBoosts && typeof originData.skillBoosts === "object") {
      for (const [k, v] of Object.entries(originData.skillBoosts)) {
        if (validSkills.has(k) && typeof v === "number") {
          cleanBoosts[k] = Math.max(0, Math.min(15, Math.round(v)));
        }
      }
    }
    originData.skillBoosts = cleanBoosts;

    if (!Array.isArray(originData.bonusItems)) originData.bonusItems = [];
    originData.bonusItems = originData.bonusItems.slice(0, 3).map((item: any) => ({
      name: String(item.name || "Unknown Item").slice(0, 40),
      description: String(item.description || "").slice(0, 100),
      icon: String(item.icon || "📦").slice(0, 4),
      quantity: Math.max(1, Math.min(5, Math.round(item.quantity || 1))),
      item_type: ["weapon", "armor", "consumable", "misc", "tool"].includes(item.item_type) ? item.item_type : "misc",
    }));

    originData.provider = provider;

    return new Response(JSON.stringify(originData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-origin error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
