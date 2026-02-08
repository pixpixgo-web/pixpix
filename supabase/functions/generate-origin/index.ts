import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { backstory, characterName, className, classCategory } = await req.json() as {
      backstory: string;
      characterName: string;
      className: string;
      classCategory: string;
    };

    const GOOGLE_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!GOOGLE_KEY && !LOVABLE_KEY) throw new Error("No API key configured");

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

    const useGoogle = !!GOOGLE_KEY;
    const apiUrl = useGoogle
      ? `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
      : "https://ai.gateway.lovable.dev/v1/chat/completions";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useGoogle ? GOOGLE_KEY : LOVABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: useGoogle ? "gemini-2.5-flash" : "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Character: ${characterName}\nClass: ${className} (${classCategory})\nBackstory: ${(backstory || "No backstory provided").slice(0, 500)}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let originData;
    try {
      originData = JSON.parse(content);
    } catch {
      console.error("Failed to parse origin response:", content);
      // Return sensible defaults
      return new Response(JSON.stringify({
        startingZone: "tavern",
        introNarrative: `Darkness clings to the edges of your vision as consciousness returns. You are ${characterName}, and the memory of betrayal burns hotter than any wound. The tavern around you reeks of cheap ale and old smoke — but it's shelter, and right now, that's enough. Your journey of vengeance begins here.`,
        bonusItems: [],
        skillBoosts: {},
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate zone
    const validZones = ["tavern", "village", "forest", "dungeon", "caves", "ruins", "abyss"];
    if (!validZones.includes(originData.startingZone)) {
      originData.startingZone = "tavern";
    }

    // Validate skill boosts
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

    // Validate items
    if (!Array.isArray(originData.bonusItems)) originData.bonusItems = [];
    originData.bonusItems = originData.bonusItems.slice(0, 3).map((item: any) => ({
      name: String(item.name || "Unknown Item").slice(0, 40),
      description: String(item.description || "").slice(0, 100),
      icon: String(item.icon || "📦").slice(0, 4),
      quantity: Math.max(1, Math.min(5, Math.round(item.quantity || 1))),
      item_type: ["weapon", "armor", "consumable", "misc", "tool"].includes(item.item_type) ? item.item_type : "misc",
    }));

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
