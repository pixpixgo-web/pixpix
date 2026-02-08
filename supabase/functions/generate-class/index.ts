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
    const { description } = await req.json() as { description: string };

    if (!description || description.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Description too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a game designer for a dark fantasy RPG. The player wants to create a custom character class.
Given their description, generate a balanced class with stats.

RULES:
- offense, defense, magic: integers 1-10. Total should be 15-20 (balanced).
- maxStamina: 40-200. High physical = high stamina. High magic = low stamina.
- maxMana: 0-200. High magic = high mana. Pure physical = 10-20 mana.
- maxHp: 80-150. Tanks get more, glass cannons get less.
- category: "high_magic" | "hybrid" | "low_magic" based on the concept.
- primaryStrength: short string describing their main advantage.
- majorWeakness: short string describing their main flaw.
- passive: optional unique ability (1 sentence).
- defaultStats: object with skill keys mapped to starting values (0-25). 
  Skill keys: brawling, one_handed, two_handed, acrobatics, climbing, stealth, sleight_of_hand, aim, bloodmancy, necromancy, soulbinding, destruction, alteration, illusion, regeneration, persuasion, intimidation, seduction, investigation, bartering, beastmastery.
  Reputation keys: bravery, mercy, honor, infamy, justice, loyalty, malice.
  Total of all defaultStats values should be 70-120.
- icon: a single emoji that fits the class.
- name: a short, evocative class name (1-3 words).
- description: 1 sentence describing the class playstyle.

Respond ONLY with a valid JSON object, no markdown, no explanation.`;

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
          { role: "user", content: `Create a custom class based on this concept: "${description.trim().slice(0, 500)}"` },
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

    // Strip markdown fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let classData;
    try {
      classData = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to generate class. Try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and clamp values
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(v || 0)));
    
    const result = {
      id: `custom-${Date.now()}`,
      name: String(classData.name || "Custom Class").slice(0, 30),
      description: String(classData.description || "A unique warrior.").slice(0, 100),
      icon: String(classData.icon || "⚔️").slice(0, 4),
      offense: clamp(classData.offense, 1, 10),
      defense: clamp(classData.defense, 1, 10),
      magic: clamp(classData.magic, 0, 10),
      primaryStrength: String(classData.primaryStrength || "Versatile").slice(0, 60),
      majorWeakness: String(classData.majorWeakness || "Jack of all trades").slice(0, 60),
      category: ["high_magic", "hybrid", "low_magic"].includes(classData.category) ? classData.category : "hybrid",
      tier: "professional" as const,
      maxMana: clamp(classData.maxMana, 0, 200),
      maxStamina: clamp(classData.maxStamina, 40, 200),
      maxHp: clamp(classData.maxHp ?? 100, 80, 150),
      passive: classData.passive ? String(classData.passive).slice(0, 120) : undefined,
      defaultStats: {} as Record<string, number>,
    };

    // Validate defaultStats keys
    const validKeys = new Set([
      'brawling','one_handed','two_handed','acrobatics','climbing','stealth','sleight_of_hand','aim',
      'bloodmancy','necromancy','soulbinding','destruction','alteration','illusion','regeneration',
      'persuasion','intimidation','seduction','investigation','bartering','beastmastery',
      'bravery','mercy','honor','infamy','justice','loyalty','malice',
    ]);

    if (classData.defaultStats && typeof classData.defaultStats === "object") {
      for (const [k, v] of Object.entries(classData.defaultStats)) {
        if (validKeys.has(k) && typeof v === "number") {
          result.defaultStats[k] = clamp(v, 0, 25);
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-class error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
