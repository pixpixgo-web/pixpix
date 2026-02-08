// ============================================
// CHARACTER CLASS RESOURCE CATEGORIES
// ============================================

export type ClassCategory = 'high_magic' | 'hybrid' | 'low_magic';
export type ClassTier = 'exotic' | 'professional' | 'hybrid_specialized' | 'final_challenge';

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  icon: string;
  offense: number;
  defense: number;
  magic: number;
  primaryStrength: string;
  majorWeakness: string;
  category: ClassCategory;
  tier: ClassTier;
  maxMana: number;
  maxStamina: number;
  startingSkills?: string[];
  passive?: string;
  defaultStats: Partial<Record<SkillKey, number>>;
}

export type SkillKey =
  | 'brawling' | 'one_handed' | 'two_handed' | 'acrobatics' | 'climbing' | 'stealth'
  | 'sleight_of_hand' | 'aim' | 'bloodmancy' | 'necromancy' | 'soulbinding' | 'destruction'
  | 'alteration' | 'illusion' | 'regeneration' | 'persuasion' | 'intimidation' | 'seduction'
  | 'investigation' | 'bartering' | 'beastmastery'
  | 'bravery' | 'mercy' | 'honor' | 'infamy' | 'justice' | 'loyalty' | 'malice';

// Spell Tiers
export interface SpellTier {
  tier: number;
  name: string;
  manaCost: [number, number]; // min-max range
  narrativeImpact: string;
}

export const SPELL_TIERS: SpellTier[] = [
  { tier: 1, name: 'Cantrip', manaCost: [5, 10], narrativeImpact: 'A spark from your fingertips.' },
  { tier: 2, name: 'Skill', manaCost: [15, 30], narrativeImpact: 'A surge of energy manifests.' },
  { tier: 3, name: 'Great', manaCost: [35, 60], narrativeImpact: 'The air crackles with your power.' },
  { tier: 4, name: 'Master', manaCost: [70, 100], narrativeImpact: 'The tavern floors tremble.' },
  { tier: 5, name: 'Mythic', manaCost: [120, 200], narrativeImpact: 'A blinding light consumes the room.' },
];

// Stamina effort levels (AI judges which to apply)
export interface EffortLevel {
  name: string;
  staminaCost: [number, number];
  examples: string;
}

export const EFFORT_LEVELS: EffortLevel[] = [
  { name: 'Low', staminaCost: [1, 5], examples: 'Dashing, quick strikes, climbing a fence, intimidation.' },
  { name: 'Mid', staminaCost: [6, 15], examples: 'Heavy overhead swings, short travel, complex spells, bartering.' },
  { name: 'High', staminaCost: [16, 25], examples: 'Long-distance travel, ultimate moves, surviving a boss deadly hit.' },
];

// Momentum multiplier states
export interface MomentumState {
  name: string;
  staminaThreshold: string;
  defenseEffect: string;
  damageMultiplier: number;
}

export const MOMENTUM_STATES: MomentumState[] = [
  { name: 'Fresh', staminaThreshold: '80%+ Stamina', defenseEffect: 'Solid Guard: Minimal damage taken.', damageMultiplier: 1.2 },
  { name: 'Winded', staminaThreshold: 'Low Stamina', defenseEffect: 'Desperate Parry: Take chip damage.', damageMultiplier: 1.8 },
  { name: 'Shaking', staminaThreshold: 'Mana Deficiency', defenseEffect: 'Unstable Defense: Weak guard, chaotic counter.', damageMultiplier: 2.5 },
];

// ============================================
// CHARACTER CLASSES - ALL TIERS
// ============================================

export const CHARACTER_CLASSES: CharacterClass[] = [
  // === Exotic/Monster Classes ===
  { id: 'lich', name: 'Lich', description: 'Undead sorcerer. Can cast T2 spells while Drained.', icon: '💀', offense: 6, defense: 4, magic: 9, primaryStrength: 'Necromancy/Soulbinding', majorWeakness: 'Fire Vulnerability', category: 'high_magic', tier: 'exotic', maxMana: 180, maxStamina: 50, startingSkills: ['Necromancy', 'Soulbinding'], passive: 'Can cast T2 spells while Drained without entering Shaking stage', defaultStats: { necromancy: 25, soulbinding: 20, destruction: 15, alteration: 10, illusion: 5, intimidation: 10, brawling: 2, one_handed: 2, climbing: 2, infamy: 15 } },
  { id: 'werewolf', name: 'Werewolf', description: 'Primal beast. Uses Stamina for Primal Leap and Frenzy.', icon: '🐺', offense: 9, defense: 6, magic: 1, primaryStrength: 'Brawling/Regeneration', majorWeakness: 'Weak to Silver/Low Mana', category: 'low_magic', tier: 'exotic', maxMana: 15, maxStamina: 180, startingSkills: ['Brawling', 'Regeneration'], defaultStats: { brawling: 25, regeneration: 15, acrobatics: 15, climbing: 15, stealth: 10, intimidation: 10, beastmastery: 10, destruction: 1, alteration: 1, bravery: 10 } },
  { id: 'angel', name: 'Fallen Angel', description: 'Celestial being. High magic resistance, weak to Bloodmancy.', icon: '👼', offense: 8, defense: 3, magic: 9, primaryStrength: 'Alteration/Justice', majorWeakness: 'Double damage from Bloodmancy', category: 'high_magic', tier: 'exotic', maxMana: 200, maxStamina: 45, startingSkills: ['Alteration', 'Justice'], defaultStats: { alteration: 25, regeneration: 20, destruction: 15, persuasion: 10, justice: 20, honor: 15, mercy: 10, brawling: 2, stealth: 1 } },
  { id: 'vampire', name: 'Vampire Noble', description: 'Can bite to restore Stamina mid-battle.', icon: '🧛', offense: 8, defense: 5, magic: 6, primaryStrength: 'Seduction/Bloodmancy/Acrobatics', majorWeakness: 'Sunlight Weakness', category: 'hybrid', tier: 'exotic', maxMana: 70, maxStamina: 90, startingSkills: ['Seduction', 'Bloodmancy', 'Acrobatics'], defaultStats: { seduction: 25, bloodmancy: 20, acrobatics: 15, stealth: 12, persuasion: 10, intimidation: 8, one_handed: 8, infamy: 10, malice: 5 } },
  { id: 'abyssal-mutant', name: 'Abyssal Mutant', description: 'Warped by betrayal. Deception and raw power.', icon: '🧬', offense: 9, defense: 7, magic: 3, primaryStrength: 'Deception/Brawling', majorWeakness: 'NPCs distrust you', category: 'low_magic', tier: 'exotic', maxMana: 20, maxStamina: 170, startingSkills: ['Deception', 'Brawling'], defaultStats: { brawling: 25, intimidation: 20, climbing: 12, stealth: 10, two_handed: 8, acrobatics: 8, infamy: 20, malice: 10, destruction: 3 } },

  // === Professional/Normal Classes ===
  { id: 'inquisitor', name: 'Inquisitor', description: 'Gains Mana when using Intimidation on magical enemies.', icon: '⚖️', offense: 7, defense: 6, magic: 5, primaryStrength: 'Intimidation/One Handed', majorWeakness: 'Low flexibility', category: 'hybrid', tier: 'professional', maxMana: 65, maxStamina: 95, startingSkills: ['Intimidation', 'One Handed'], defaultStats: { intimidation: 20, one_handed: 18, investigation: 15, persuasion: 8, destruction: 8, alteration: 5, justice: 15, honor: 10, bravery: 8 } },
  { id: 'bounty-hunter', name: 'Bounty Hunter', description: 'Can Track betrayers with low Stamina cost.', icon: '🎯', offense: 7, defense: 5, magic: 3, primaryStrength: 'Beastmastery/Ranged', majorWeakness: 'Weak in close combat', category: 'low_magic', tier: 'professional', maxMana: 20, maxStamina: 160, startingSkills: ['Beastmastery', 'Ranged'], defaultStats: { aim: 22, beastmastery: 18, stealth: 12, investigation: 12, climbing: 8, acrobatics: 8, bartering: 5, brawling: 3, justice: 8 } },
  { id: 'battle-medic', name: 'Battle Medic', description: 'High Mana healer. Keeps Mercy reputation high.', icon: '💉', offense: 3, defense: 5, magic: 8, primaryStrength: 'Regeneration/Persuasion', majorWeakness: 'Low offense', category: 'high_magic', tier: 'professional', maxMana: 150, maxStamina: 60, startingSkills: ['Regeneration', 'Persuasion'], defaultStats: { regeneration: 25, persuasion: 18, alteration: 12, investigation: 8, mercy: 20, honor: 10, loyalty: 10, brawling: 2, stealth: 1 } },
  { id: 'shadow-blade', name: 'Shadow Blade', description: 'Ultimate assassin for Cold Justice playthroughs.', icon: '🌑', offense: 9, defense: 3, magic: 4, primaryStrength: 'Stealth/Sleight of Hand', majorWeakness: 'Very Low HP', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 175, startingSkills: ['Stealth', 'Sleight of Hand'], defaultStats: { stealth: 25, sleight_of_hand: 20, one_handed: 15, acrobatics: 12, climbing: 10, aim: 5, illusion: 5, infamy: 8 } },
  { id: 'wandering-knight', name: 'Wandering Knight', description: 'High Physical Defense. Honorable warrior.', icon: '🛡️', offense: 7, defense: 9, magic: 2, primaryStrength: 'Two Handed/Honor', majorWeakness: 'Slow Movement', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 160, startingSkills: ['Two Handed', 'Honor'], defaultStats: { two_handed: 22, one_handed: 12, brawling: 8, climbing: 5, persuasion: 5, honor: 20, bravery: 15, loyalty: 10, justice: 8 } },

  // === Specialized/Hybrid Classes ===
  { id: 'soul-binder', name: 'Soul Binder', description: 'Can bind defeated enemies as permanent companions.', icon: '🔮', offense: 5, defense: 5, magic: 8, primaryStrength: 'Soulbinding/Loyalty', majorWeakness: 'Low physical stats', category: 'high_magic', tier: 'hybrid_specialized', maxMana: 160, maxStamina: 55, startingSkills: ['Soulbinding', 'Loyalty'], defaultStats: { soulbinding: 25, necromancy: 12, alteration: 12, persuasion: 10, investigation: 8, loyalty: 20, bravery: 5, brawling: 2, stealth: 2 } },
  { id: 'gunsmith', name: 'Gunsmith/Alchemist', description: 'Uses Bloodmancy to craft custom bullets.', icon: '🔧', offense: 7, defense: 4, magic: 5, primaryStrength: 'Aim/Bartering', majorWeakness: 'Relies on crafted ammo', category: 'hybrid', tier: 'hybrid_specialized', maxMana: 60, maxStamina: 100, startingSkills: ['Aim', 'Bartering'], defaultStats: { aim: 22, bartering: 18, bloodmancy: 10, investigation: 10, sleight_of_hand: 8, destruction: 5, stealth: 5, climbing: 3 } },
  { id: 'illusionist', name: 'Illusionist Thief', description: 'Decoy costs 0 Mana but 20 Stamina.', icon: '🎭', offense: 5, defense: 3, magic: 7, primaryStrength: 'Illusion/Deception', majorWeakness: 'Low direct damage', category: 'hybrid', tier: 'hybrid_specialized', maxMana: 75, maxStamina: 85, startingSkills: ['Illusion', 'Deception'], defaultStats: { illusion: 25, stealth: 15, sleight_of_hand: 15, persuasion: 10, acrobatics: 8, seduction: 5, bartering: 5, brawling: 1 } },
  { id: 'void-walker', name: 'Void Walker', description: 'Can Phase through attacks, regains Stamina on success.', icon: '🌀', offense: 6, defense: 4, magic: 7, primaryStrength: 'Alteration/Acrobatics', majorWeakness: 'Unstable abilities', category: 'hybrid', tier: 'hybrid_specialized', maxMana: 80, maxStamina: 80, startingSkills: ['Alteration', 'Acrobatics'], defaultStats: { alteration: 22, acrobatics: 18, destruction: 10, stealth: 8, climbing: 8, illusion: 8, investigation: 5, bravery: 8 } },
  { id: 'dread-lord', name: 'Dread Lord', description: 'Villain path. Necromancy and area damage.', icon: '👑', offense: 8, defense: 5, magic: 8, primaryStrength: 'Necromancy/Intimidation', majorWeakness: 'Hated by all NPCs', category: 'high_magic', tier: 'hybrid_specialized', maxMana: 170, maxStamina: 50, startingSkills: ['Necromancy', 'Intimidation'], defaultStats: { necromancy: 22, intimidation: 20, destruction: 15, soulbinding: 10, bloodmancy: 8, infamy: 25, malice: 20, brawling: 3 } },

  // === Original Classes (remapped) ===
  { id: 'assassin', name: 'Assassin', description: 'Master of shadows and critical strikes', icon: '🗡️', offense: 10, defense: 2, magic: 2, primaryStrength: 'Stealth/Crit Damage', majorWeakness: 'Very Low HP', category: 'low_magic', tier: 'professional', maxMana: 10, maxStamina: 190, startingSkills: ['Stealth', 'One Handed'], defaultStats: { stealth: 25, one_handed: 20, acrobatics: 15, sleight_of_hand: 12, climbing: 8, aim: 5, infamy: 10, bravery: 5 } },
  { id: 'brute', name: 'Brute', description: 'Unstoppable wall of muscle', icon: '💪', offense: 7, defense: 10, magic: 1, primaryStrength: 'Raw HP/Physical Def', majorWeakness: 'Extremely Slow', category: 'low_magic', tier: 'professional', maxMana: 10, maxStamina: 200, startingSkills: ['Brawling', 'Two Handed'], defaultStats: { brawling: 25, two_handed: 20, climbing: 10, intimidation: 12, bravery: 15, one_handed: 5, acrobatics: 2 } },
  { id: 'priest', name: 'Priest', description: 'Divine healer and protector', icon: '⛪', offense: 1, defense: 5, magic: 10, primaryStrength: 'Healing/Shields', majorWeakness: 'Zero Physical Attack', category: 'high_magic', tier: 'professional', maxMana: 200, maxStamina: 40, startingSkills: ['Regeneration', 'Alteration'], defaultStats: { regeneration: 25, alteration: 22, persuasion: 15, mercy: 25, honor: 15, loyalty: 10, investigation: 5, brawling: 1 } },
  { id: 'storm-mage', name: 'Storm Mage', description: 'Master of lightning and wind', icon: '⚡', offense: 9, defense: 3, magic: 9, primaryStrength: 'High AoE Damage', majorWeakness: 'High Mana Cost', category: 'high_magic', tier: 'exotic', maxMana: 180, maxStamina: 45, startingSkills: ['Destruction', 'Alteration'], defaultStats: { destruction: 25, alteration: 18, illusion: 8, regeneration: 5, intimidation: 8, bravery: 10, brawling: 2, climbing: 2 } },
  { id: 'bard', name: 'Bard', description: 'Charismatic performer and buffer', icon: '🎵', offense: 4, defense: 4, magic: 7, primaryStrength: 'Buffing/Persuasion', majorWeakness: 'Weak Solo Fighter', category: 'hybrid', tier: 'professional', maxMana: 70, maxStamina: 85, startingSkills: ['Persuasion', 'Illusion'], defaultStats: { persuasion: 25, illusion: 18, seduction: 12, bartering: 10, investigation: 8, acrobatics: 5, alteration: 5, loyalty: 8 } },
  { id: 'druid', name: 'Druid', description: 'Guardian of nature', icon: '🌿', offense: 5, defense: 6, magic: 8, primaryStrength: 'Shapeshifting/Nature Magic', majorWeakness: 'Weak in Cities', category: 'hybrid', tier: 'professional', maxMana: 80, maxStamina: 80, startingSkills: ['Beastmastery', 'Regeneration'], defaultStats: { beastmastery: 25, regeneration: 18, alteration: 12, climbing: 10, investigation: 8, mercy: 10, honor: 5, brawling: 5 } },
  { id: 'monk', name: 'Monk', description: 'Martial arts master', icon: '🥋', offense: 7, defense: 7, magic: 4, primaryStrength: 'Unarmed Combat/Speed', majorWeakness: 'No Armor', category: 'hybrid', tier: 'professional', maxMana: 60, maxStamina: 100, startingSkills: ['Brawling', 'Acrobatics'], defaultStats: { brawling: 22, acrobatics: 20, climbing: 12, stealth: 8, regeneration: 8, honor: 10, bravery: 10, persuasion: 3 } },
  { id: 'pyromancer', name: 'Pyromancer', description: 'Master of flames', icon: '🔥', offense: 10, defense: 2, magic: 8, primaryStrength: 'Fire Damage/AoE', majorWeakness: 'Self-Damage Risk', category: 'high_magic', tier: 'exotic', maxMana: 160, maxStamina: 50, startingSkills: ['Destruction', 'Bloodmancy'], defaultStats: { destruction: 25, bloodmancy: 18, alteration: 8, intimidation: 10, bravery: 12, acrobatics: 3, stealth: 2, infamy: 5 } },
  { id: 'rogue', name: 'Rogue', description: 'Cunning thief and trickster', icon: '🎪', offense: 7, defense: 4, magic: 3, primaryStrength: 'Stealth/Lockpicking', majorWeakness: 'Low Direct Combat', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 165, startingSkills: ['Stealth', 'Sleight of Hand'], defaultStats: { stealth: 22, sleight_of_hand: 20, acrobatics: 12, bartering: 10, climbing: 8, one_handed: 8, investigation: 5, infamy: 5 } },
  { id: 'archer', name: 'Archer', description: 'Precision ranged fighter', icon: '🏹', offense: 8, defense: 3, magic: 3, primaryStrength: 'Ranged Attacks/Accuracy', majorWeakness: 'Weak in Melee', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 165, startingSkills: ['Aim', 'Acrobatics'], defaultStats: { aim: 25, acrobatics: 15, stealth: 10, climbing: 10, investigation: 8, bravery: 8, one_handed: 3, beastmastery: 5 } },
  { id: 'necromancer', name: 'Necromancer', description: 'Commander of the undead', icon: '☠️', offense: 5, defense: 3, magic: 10, primaryStrength: 'Summon Undead/Curses', majorWeakness: 'Hated by All', category: 'high_magic', tier: 'exotic', maxMana: 190, maxStamina: 40, startingSkills: ['Necromancy', 'Soulbinding'], defaultStats: { necromancy: 25, soulbinding: 20, destruction: 10, bloodmancy: 8, intimidation: 10, infamy: 20, malice: 10, investigation: 3 } },
  { id: 'paladin', name: 'Paladin', description: 'Holy knight of justice', icon: '⚔️', offense: 7, defense: 8, magic: 5, primaryStrength: 'Holy Damage/Healing', majorWeakness: 'Cannot Lie/Deceive', category: 'hybrid', tier: 'professional', maxMana: 70, maxStamina: 90, startingSkills: ['Two Handed', 'Regeneration'], defaultStats: { two_handed: 18, regeneration: 15, one_handed: 10, persuasion: 8, honor: 20, justice: 15, bravery: 12, loyalty: 10, mercy: 8 } },
  { id: 'berserker', name: 'Berserker', description: 'Rage-fueled warrior', icon: '🪓', offense: 10, defense: 3, magic: 0, primaryStrength: 'Extreme Damage/Rage Mode', majorWeakness: 'Cannot Defend', category: 'low_magic', tier: 'professional', maxMana: 10, maxStamina: 200, startingSkills: ['Brawling', 'Two Handed'], defaultStats: { brawling: 25, two_handed: 22, climbing: 8, intimidation: 15, bravery: 20, infamy: 5, acrobatics: 3 } },
  { id: 'knight', name: 'Knight', description: 'Honorable armored warrior', icon: '🏰', offense: 6, defense: 9, magic: 2, primaryStrength: 'Heavy Armor/Leadership', majorWeakness: 'Slow Movement', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 160, startingSkills: ['Two Handed', 'One Handed'], defaultStats: { two_handed: 18, one_handed: 15, brawling: 8, persuasion: 8, honor: 18, loyalty: 12, bravery: 15, justice: 8 } },

  // === Final Challenge Classes ===
  { id: 'fallen-hero', name: 'The Fallen Hero', description: 'Balanced but starts with permanent Drained debuff until Level 5.', icon: '⬇️', offense: 5, defense: 5, magic: 5, primaryStrength: 'Balanced stats', majorWeakness: 'Permanent Stage 1 Drained until Lv5', category: 'hybrid', tier: 'final_challenge', maxMana: 70, maxStamina: 90, startingSkills: ['One Handed', 'Persuasion'], defaultStats: { one_handed: 10, persuasion: 10, brawling: 8, stealth: 8, destruction: 8, alteration: 8, acrobatics: 8, honor: 5, bravery: 5 } },
  { id: 'cursed-peasant', name: 'Cursed Peasant', description: 'Starts at +0 everything. Every kill grants 2x XP.', icon: '🧑‍🌾', offense: 2, defense: 2, magic: 2, primaryStrength: '2x XP on kills', majorWeakness: 'Zero starting stats', category: 'hybrid', tier: 'final_challenge', maxMana: 40, maxStamina: 80, startingSkills: [], defaultStats: {} },
  { id: 'broken-vessel', name: 'The Broken Vessel', description: '0 Max Mana. Uses Bloodmancy (HP/Stamina) for all spells.', icon: '💔', offense: 7, defense: 5, magic: 3, primaryStrength: 'Bloodmancy casting without mana', majorWeakness: '0 Mana, permanent Shaking', category: 'low_magic', tier: 'final_challenge', maxMana: 0, maxStamina: 150, startingSkills: ['Brawling', 'Regeneration', 'Bravery'], defaultStats: { brawling: 18, regeneration: 15, bloodmancy: 12, climbing: 8, two_handed: 8, bravery: 20, intimidation: 5 } },
  { id: 'nameless-ghoul', name: 'The Nameless Ghoul', description: 'Reputation locked at -50. Soulbinding/Necromancy costs halved.', icon: '👻', offense: 6, defense: 4, magic: 7, primaryStrength: 'Half-cost Necromancy, consume enemies for Stamina', majorWeakness: 'NPCs refuse to speak to you', category: 'high_magic', tier: 'final_challenge', maxMana: 140, maxStamina: 60, startingSkills: ['Stealth', 'Necromancy', 'Sleight of Hand'], defaultStats: { necromancy: 20, stealth: 18, sleight_of_hand: 15, soulbinding: 10, bloodmancy: 8, infamy: 15, malice: 15, investigation: 3 } },
  { id: 'fallen-prodigy', name: 'The Fallen Prodigy', description: 'Lost their eyes. Ranged/Aim capped at 0. Massive Illusion radius.', icon: '🔮', offense: 4, defense: 3, magic: 9, primaryStrength: '100% Investigation success, huge spell radius', majorWeakness: 'Cannot use Ranged/Aim ever', category: 'high_magic', tier: 'final_challenge', maxMana: 180, maxStamina: 45, startingSkills: ['Illusion', 'Alteration', 'Investigation'], defaultStats: { illusion: 25, alteration: 20, investigation: 20, destruction: 10, regeneration: 8, persuasion: 5, bravery: 8 } },
  { id: 'exile-kingslayer', name: 'The Exile Kingslayer', description: 'Hunted by Bounty Hunters. x3 Vengeance Strike on defense.', icon: '👑', offense: 8, defense: 10, magic: 2, primaryStrength: 'Highest defense, 2x Stamina on defending High attacks', majorWeakness: 'Random bounty hunter ambushes', category: 'low_magic', tier: 'final_challenge', maxMana: 15, maxStamina: 180, startingSkills: ['Two Handed', 'Intimidation', 'Justice'], defaultStats: { two_handed: 22, intimidation: 18, brawling: 12, climbing: 8, one_handed: 8, justice: 20, bravery: 15, infamy: 10 } },
  { id: 'mimic-symbiote', name: 'The Mimic Symbiote', description: 'Bonded with a parasite. Can copy enemy skills. Regen drains Stamina.', icon: '🦠', offense: 6, defense: 5, magic: 6, primaryStrength: 'Copy one Active Skill from defeated enemies', majorWeakness: 'Regen drains Stamina each turn; 0 Stamina = HP drain', category: 'hybrid', tier: 'final_challenge', maxMana: 70, maxStamina: 90, startingSkills: ['Acrobatics', 'Deception', 'Alteration'], defaultStats: { acrobatics: 18, alteration: 15, stealth: 12, climbing: 8, brawling: 8, investigation: 8, sleight_of_hand: 5, bravery: 5 } },
];

// ============================================
// ACTION & ZONE SYSTEMS
// ============================================

export type ActionType = 'free' | 'paid';

export interface ActionCategory {
  type: ActionType;
  description: string;
}

export const ACTION_CATEGORIES: Record<string, ActionCategory> = {
  talk: { type: 'free', description: 'Talk to NPCs' },
  look: { type: 'free', description: 'Look around' },
  inventory: { type: 'free', description: 'Check inventory' },
  ask: { type: 'free', description: 'Ask questions' },
  defend: { type: 'free', description: 'Take defensive stance (regain +10 Stamina)' },
  think: { type: 'free', description: 'Think or ponder' },
  attack: { type: 'paid', description: 'Attack an enemy' },
  cast: { type: 'paid', description: 'Cast a spell (costs Mana)' },
  travel: { type: 'paid', description: 'Travel to a new zone' },
  climb: { type: 'paid', description: 'Climb or traverse' },
  search: { type: 'paid', description: 'Search thoroughly' },
  rest: { type: 'paid', description: 'Rest to recover Stamina/Mana' },
};

export type ZoneType = 'safe' | 'danger';

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  restRecovery: number;
  ambushChance: number;
}

export const ZONES: Record<string, Zone> = {
  tavern: { id: 'tavern', name: "Old Greg's Tavern", type: 'safe', restRecovery: 100, ambushChance: 0 },
  village: { id: 'village', name: 'Village', type: 'safe', restRecovery: 100, ambushChance: 5 },
  forest: { id: 'forest', name: 'Dark Forest', type: 'danger', restRecovery: 50, ambushChance: 50 },
  dungeon: { id: 'dungeon', name: 'Ancient Dungeon', type: 'danger', restRecovery: 25, ambushChance: 75 },
  caves: { id: 'caves', name: 'Underground Caves', type: 'danger', restRecovery: 30, ambushChance: 60 },
  ruins: { id: 'ruins', name: 'Forgotten Ruins', type: 'danger', restRecovery: 40, ambushChance: 40 },
  abyss: { id: 'abyss', name: 'The Abyss', type: 'danger', restRecovery: 15, ambushChance: 85 },
};

// ============================================
// DATA INTERFACES
// ============================================

export interface Character {
  id: string;
  user_id: string;
  name: string;
  hp: number;
  max_hp: number;
  gold: number;
  action_points: number;
  max_action_points: number;
  stamina: number;
  max_stamina: number;
  mana: number;
  max_mana: number;
  xp: number;
  level: number;
  character_class: string;
  offense: number;
  defense: number;
  magic: number;
  current_zone: string;
  backstory: string | null;
  // Detailed 1-100 skills
  brawling: number;
  one_handed: number;
  two_handed: number;
  acrobatics: number;
  climbing: number;
  stealth: number;
  sleight_of_hand: number;
  aim: number;
  bloodmancy: number;
  necromancy: number;
  soulbinding: number;
  destruction: number;
  alteration: number;
  illusion: number;
  regeneration: number;
  persuasion: number;
  intimidation: number;
  seduction: number;
  investigation: number;
  bartering: number;
  beastmastery: number;
  // Reputation
  bravery: number;
  mercy: number;
  honor: number;
  infamy: number;
  justice: number;
  loyalty: number;
  malice: number;
  // Progression
  stat_points: number;
  story_phase: string;
  betrayers_defeated: string[];
  created_at: string;
  updated_at: string;
}

export interface Companion {
  id: string;
  character_id: string;
  name: string;
  description: string | null;
  personality: string;
  hp: number;
  max_hp: number;
  trust: number;
  is_active: boolean;
  icon: string;
  stamina: number;
  max_stamina: number;
  mana: number;
  max_mana: number;
  offense: number;
  defense: number;
  magic: number;
  created_at: string;
  updated_at: string;
}

// Skill definitions for UI
export interface SkillDef {
  key: keyof Character;
  name: string;
  category: 'physical' | 'magical' | 'social' | 'reputation';
  description: string;
}

export const SKILLS: SkillDef[] = [
  // Physical
  { key: 'brawling', name: 'Brawling', category: 'physical', description: 'Unarmed combat damage' },
  { key: 'one_handed', name: 'One Handed', category: 'physical', description: 'Sword & dagger proficiency' },
  { key: 'two_handed', name: 'Two Handed', category: 'physical', description: 'Heavy weapon damage (more Stamina cost)' },
  { key: 'acrobatics', name: 'Acrobatics', category: 'physical', description: 'Dodge, evade, and bypass obstacles' },
  { key: 'climbing', name: 'Climbing', category: 'physical', description: 'Traverse vertical terrain and shortcuts' },
  { key: 'stealth', name: 'Stealth', category: 'physical', description: 'Hide and move unseen' },
  { key: 'sleight_of_hand', name: 'Sleight of Hand', category: 'physical', description: 'Pickpocket and disarm traps' },
  { key: 'aim', name: 'Aim', category: 'physical', description: 'Ranged weapon accuracy' },
  // Magical
  { key: 'bloodmancy', name: 'Bloodmancy', category: 'magical', description: 'Spells that cost HP instead of Mana' },
  { key: 'necromancy', name: 'Necromancy', category: 'magical', description: 'Raise undead, drain life' },
  { key: 'soulbinding', name: 'Soulbinding', category: 'magical', description: 'Bind souls as companions or power' },
  { key: 'destruction', name: 'Destruction', category: 'magical', description: 'Raw offensive magic damage' },
  { key: 'alteration', name: 'Alteration', category: 'magical', description: 'Transform objects and environments' },
  { key: 'illusion', name: 'Illusion', category: 'magical', description: 'Create decoys and confusion' },
  { key: 'regeneration', name: 'Regeneration', category: 'magical', description: 'Healing magic and recovery' },
  // Social
  { key: 'persuasion', name: 'Persuasion', category: 'social', description: 'Convince NPCs through diplomacy' },
  { key: 'intimidation', name: 'Intimidation', category: 'social', description: 'Threaten and coerce' },
  { key: 'seduction', name: 'Seduction', category: 'social', description: 'Charm and manipulate' },
  { key: 'investigation', name: 'Investigation', category: 'social', description: 'Find clues and hidden details' },
  { key: 'bartering', name: 'Bartering', category: 'social', description: 'Get better prices and deals' },
  { key: 'beastmastery', name: 'Beastmastery', category: 'social', description: 'Tame and command creatures' },
  // Reputation
  { key: 'bravery', name: 'Bravery', category: 'reputation', description: 'Ignore Mana Deficiency shaking for 2 turns' },
  { key: 'mercy', name: 'Mercy', category: 'reputation', description: 'AI grants mercy saves on critical failures' },
  { key: 'honor', name: 'Honor', category: 'reputation', description: 'NPCs trust and respect you' },
  { key: 'infamy', name: 'Infamy', category: 'reputation', description: 'Shopkeepers fear you — lower prices' },
  { key: 'justice', name: 'Justice', category: 'reputation', description: 'Increases defense multiplier' },
  { key: 'loyalty', name: 'Loyalty', category: 'reputation', description: 'Companions gain trust faster' },
  { key: 'malice', name: 'Malice', category: 'reputation', description: 'Hidden revenge power stat' },
];

// Betrayer list for revenge tracker
export const BETRAYERS = [
  { id: 'leader', name: 'Aldric the Betrayer', role: 'Party Leader', description: 'The one who stabbed you in the back.' },
  { id: 'mage', name: 'Seraphina the Deceiver', role: 'Party Mage', description: 'Shielded the betrayal with illusion magic.' },
  { id: 'healer', name: 'Brother Marcus', role: 'Party Healer', description: 'Refused to heal you as you fell.' },
  { id: 'scout', name: 'Kira Shadowstep', role: 'Party Scout', description: 'Led you into the ambush.' },
  { id: 'patron', name: 'Lord Ashworth', role: 'The Patron', description: 'Ordered the betrayal from the shadows.' },
];
export interface InventoryItem {
  id: string;
  character_id: string;
  name: string;
  description: string | null;
  icon: string;
  quantity: number;
  item_type: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  character_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  character_id: string;
  title: string;
  content: string;
  entry_number: number;
  created_at: string;
}

export interface GameState {
  character: Character | null;
  inventory: InventoryItem[];
  companions: Companion[];
  messages: ChatMessage[];
  journal: JournalEntry[];
  isLoading: boolean;
}

export interface DiceRoll {
  value: number;
  isRolling: boolean;
}

// XP formula: level * 100
export function xpForNextLevel(level: number): number {
  return level * 100;
}
