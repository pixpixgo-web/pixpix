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
}

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
  // === Exotic/Monster Classes (High Power, High Risk) ===
  { id: 'lich', name: 'Lich', description: 'Undead sorcerer. Can cast T2 spells while Drained.', icon: '💀', offense: 6, defense: 4, magic: 9, primaryStrength: 'Necromancy/Soulbinding', majorWeakness: 'Fire Vulnerability', category: 'high_magic', tier: 'exotic', maxMana: 180, maxStamina: 50, startingSkills: ['Necromancy', 'Soulbinding'], passive: 'Can cast T2 spells while Drained without entering Shaking stage' },
  { id: 'werewolf', name: 'Werewolf', description: 'Primal beast. Uses Stamina for Primal Leap and Frenzy.', icon: '🐺', offense: 9, defense: 6, magic: 1, primaryStrength: 'Brawling/Regeneration', majorWeakness: 'Weak to Silver/Low Mana', category: 'low_magic', tier: 'exotic', maxMana: 15, maxStamina: 180, startingSkills: ['Brawling', 'Regeneration'] },
  { id: 'angel', name: 'Fallen Angel', description: 'Celestial being. High magic resistance, weak to Bloodmancy.', icon: '👼', offense: 8, defense: 3, magic: 9, primaryStrength: 'Alteration/Justice', majorWeakness: 'Double damage from Bloodmancy', category: 'high_magic', tier: 'exotic', maxMana: 200, maxStamina: 45, startingSkills: ['Alteration', 'Justice'] },
  { id: 'vampire', name: 'Vampire Noble', description: 'Can bite to restore Stamina mid-battle.', icon: '🧛', offense: 8, defense: 5, magic: 6, primaryStrength: 'Seduction/Bloodmancy/Acrobatics', majorWeakness: 'Sunlight Weakness', category: 'hybrid', tier: 'exotic', maxMana: 70, maxStamina: 90, startingSkills: ['Seduction', 'Bloodmancy', 'Acrobatics'] },
  { id: 'abyssal-mutant', name: 'Abyssal Mutant', description: 'Warped by betrayal. Deception and raw power.', icon: '🧬', offense: 9, defense: 7, magic: 3, primaryStrength: 'Deception/Brawling', majorWeakness: 'NPCs distrust you', category: 'low_magic', tier: 'exotic', maxMana: 20, maxStamina: 170, startingSkills: ['Deception', 'Brawling'] },

  // === Professional/Normal Classes (Tactical & Balanced) ===
  { id: 'inquisitor', name: 'Inquisitor', description: 'Gains Mana when using Intimidation on magical enemies.', icon: '⚖️', offense: 7, defense: 6, magic: 5, primaryStrength: 'Intimidation/One Handed', majorWeakness: 'Low flexibility', category: 'hybrid', tier: 'professional', maxMana: 65, maxStamina: 95, startingSkills: ['Intimidation', 'One Handed'] },
  { id: 'bounty-hunter', name: 'Bounty Hunter', description: 'Can Track betrayers with low Stamina cost.', icon: '🎯', offense: 7, defense: 5, magic: 3, primaryStrength: 'Beastmastery/Ranged', majorWeakness: 'Weak in close combat', category: 'low_magic', tier: 'professional', maxMana: 20, maxStamina: 160, startingSkills: ['Beastmastery', 'Ranged'] },
  { id: 'battle-medic', name: 'Battle Medic', description: 'High Mana healer. Keeps Mercy reputation high.', icon: '💉', offense: 3, defense: 5, magic: 8, primaryStrength: 'Regeneration/Persuasion', majorWeakness: 'Low offense', category: 'high_magic', tier: 'professional', maxMana: 150, maxStamina: 60, startingSkills: ['Regeneration', 'Persuasion'] },
  { id: 'shadow-blade', name: 'Shadow Blade', description: 'Ultimate assassin for Cold Justice playthroughs.', icon: '🌑', offense: 9, defense: 3, magic: 4, primaryStrength: 'Stealth/Sleight of Hand', majorWeakness: 'Very Low HP', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 175, startingSkills: ['Stealth', 'Sleight of Hand'] },
  { id: 'wandering-knight', name: 'Wandering Knight', description: 'High Physical Defense. Honorable warrior.', icon: '🛡️', offense: 7, defense: 9, magic: 2, primaryStrength: 'Two Handed/Honor', majorWeakness: 'Slow Movement', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 160, startingSkills: ['Two Handed', 'Honor'] },

  // === Specialized/Hybrid Classes ===
  { id: 'soul-binder', name: 'Soul Binder', description: 'Can bind defeated enemies as permanent companions.', icon: '🔮', offense: 5, defense: 5, magic: 8, primaryStrength: 'Soulbinding/Loyalty', majorWeakness: 'Low physical stats', category: 'high_magic', tier: 'hybrid_specialized', maxMana: 160, maxStamina: 55, startingSkills: ['Soulbinding', 'Loyalty'] },
  { id: 'gunsmith', name: 'Gunsmith/Alchemist', description: 'Uses Bloodmancy to craft custom bullets.', icon: '🔧', offense: 7, defense: 4, magic: 5, primaryStrength: 'Aim/Bartering', majorWeakness: 'Relies on crafted ammo', category: 'hybrid', tier: 'hybrid_specialized', maxMana: 60, maxStamina: 100, startingSkills: ['Aim', 'Bartering'] },
  { id: 'illusionist', name: 'Illusionist Thief', description: 'Decoy costs 0 Mana but 20 Stamina.', icon: '🎭', offense: 5, defense: 3, magic: 7, primaryStrength: 'Illusion/Deception', majorWeakness: 'Low direct damage', category: 'hybrid', tier: 'hybrid_specialized', maxMana: 75, maxStamina: 85, startingSkills: ['Illusion', 'Deception'] },
  { id: 'void-walker', name: 'Void Walker', description: 'Can Phase through attacks, regains Stamina on success.', icon: '🌀', offense: 6, defense: 4, magic: 7, primaryStrength: 'Alteration/Acrobatics', majorWeakness: 'Unstable abilities', category: 'hybrid', tier: 'hybrid_specialized', maxMana: 80, maxStamina: 80, startingSkills: ['Alteration', 'Acrobatics'] },
  { id: 'dread-lord', name: 'Dread Lord', description: 'Villain path. Necromancy and area damage.', icon: '👑', offense: 8, defense: 5, magic: 8, primaryStrength: 'Necromancy/Intimidation', majorWeakness: 'Hated by all NPCs', category: 'high_magic', tier: 'hybrid_specialized', maxMana: 170, maxStamina: 50, startingSkills: ['Necromancy', 'Intimidation'] },

  // === Original Classes (remapped) ===
  { id: 'assassin', name: 'Assassin', description: 'Master of shadows and critical strikes', icon: '🗡️', offense: 10, defense: 2, magic: 2, primaryStrength: 'Stealth/Crit Damage', majorWeakness: 'Very Low HP', category: 'low_magic', tier: 'professional', maxMana: 10, maxStamina: 190, startingSkills: ['Stealth', 'One Handed'] },
  { id: 'brute', name: 'Brute', description: 'Unstoppable wall of muscle', icon: '💪', offense: 7, defense: 10, magic: 1, primaryStrength: 'Raw HP/Physical Def', majorWeakness: 'Extremely Slow', category: 'low_magic', tier: 'professional', maxMana: 10, maxStamina: 200, startingSkills: ['Brawling', 'Two Handed'] },
  { id: 'priest', name: 'Priest', description: 'Divine healer and protector', icon: '⛪', offense: 1, defense: 5, magic: 10, primaryStrength: 'Healing/Shields', majorWeakness: 'Zero Physical Attack', category: 'high_magic', tier: 'professional', maxMana: 200, maxStamina: 40, startingSkills: ['Regeneration', 'Alteration'] },
  { id: 'storm-mage', name: 'Storm Mage', description: 'Master of lightning and wind', icon: '⚡', offense: 9, defense: 3, magic: 9, primaryStrength: 'High AoE Damage', majorWeakness: 'High Mana Cost', category: 'high_magic', tier: 'exotic', maxMana: 180, maxStamina: 45, startingSkills: ['Destruction', 'Alteration'] },
  { id: 'bard', name: 'Bard', description: 'Charismatic performer and buffer', icon: '🎵', offense: 4, defense: 4, magic: 7, primaryStrength: 'Buffing/Persuasion', majorWeakness: 'Weak Solo Fighter', category: 'hybrid', tier: 'professional', maxMana: 70, maxStamina: 85, startingSkills: ['Persuasion', 'Illusion'] },
  { id: 'druid', name: 'Druid', description: 'Guardian of nature', icon: '🌿', offense: 5, defense: 6, magic: 8, primaryStrength: 'Shapeshifting/Nature Magic', majorWeakness: 'Weak in Cities', category: 'hybrid', tier: 'professional', maxMana: 80, maxStamina: 80, startingSkills: ['Beastmastery', 'Regeneration'] },
  { id: 'monk', name: 'Monk', description: 'Martial arts master', icon: '🥋', offense: 7, defense: 7, magic: 4, primaryStrength: 'Unarmed Combat/Speed', majorWeakness: 'No Armor', category: 'hybrid', tier: 'professional', maxMana: 60, maxStamina: 100, startingSkills: ['Brawling', 'Acrobatics'] },
  { id: 'pyromancer', name: 'Pyromancer', description: 'Master of flames', icon: '🔥', offense: 10, defense: 2, magic: 8, primaryStrength: 'Fire Damage/AoE', majorWeakness: 'Self-Damage Risk', category: 'high_magic', tier: 'exotic', maxMana: 160, maxStamina: 50, startingSkills: ['Destruction', 'Bloodmancy'] },
  { id: 'rogue', name: 'Rogue', description: 'Cunning thief and trickster', icon: '🎪', offense: 7, defense: 4, magic: 3, primaryStrength: 'Stealth/Lockpicking', majorWeakness: 'Low Direct Combat', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 165, startingSkills: ['Stealth', 'Sleight of Hand'] },
  { id: 'archer', name: 'Archer', description: 'Precision ranged fighter', icon: '🏹', offense: 8, defense: 3, magic: 3, primaryStrength: 'Ranged Attacks/Accuracy', majorWeakness: 'Weak in Melee', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 165, startingSkills: ['Aim', 'Acrobatics'] },
  { id: 'necromancer', name: 'Necromancer', description: 'Commander of the undead', icon: '☠️', offense: 5, defense: 3, magic: 10, primaryStrength: 'Summon Undead/Curses', majorWeakness: 'Hated by All', category: 'high_magic', tier: 'exotic', maxMana: 190, maxStamina: 40, startingSkills: ['Necromancy', 'Soulbinding'] },
  { id: 'paladin', name: 'Paladin', description: 'Holy knight of justice', icon: '⚔️', offense: 7, defense: 8, magic: 5, primaryStrength: 'Holy Damage/Healing', majorWeakness: 'Cannot Lie/Deceive', category: 'hybrid', tier: 'professional', maxMana: 70, maxStamina: 90, startingSkills: ['Two Handed', 'Regeneration'] },
  { id: 'berserker', name: 'Berserker', description: 'Rage-fueled warrior', icon: '🪓', offense: 10, defense: 3, magic: 0, primaryStrength: 'Extreme Damage/Rage Mode', majorWeakness: 'Cannot Defend', category: 'low_magic', tier: 'professional', maxMana: 10, maxStamina: 200, startingSkills: ['Brawling', 'Two Handed'] },
  { id: 'knight', name: 'Knight', description: 'Honorable armored warrior', icon: '🏰', offense: 6, defense: 9, magic: 2, primaryStrength: 'Heavy Armor/Leadership', majorWeakness: 'Slow Movement', category: 'low_magic', tier: 'professional', maxMana: 15, maxStamina: 160, startingSkills: ['Two Handed', 'One Handed'] },

  // === Final Challenge Classes ===
  { id: 'fallen-hero', name: 'The Fallen Hero', description: 'Balanced but starts with permanent Drained debuff until Level 5.', icon: '⬇️', offense: 5, defense: 5, magic: 5, primaryStrength: 'Balanced stats', majorWeakness: 'Permanent Stage 1 Drained until Lv5', category: 'hybrid', tier: 'final_challenge', maxMana: 70, maxStamina: 90, startingSkills: ['One Handed', 'Persuasion'] },
  { id: 'cursed-peasant', name: 'Cursed Peasant', description: 'Starts at +0 everything. Every kill grants 2x XP.', icon: '🧑‍🌾', offense: 2, defense: 2, magic: 2, primaryStrength: '2x XP on kills', majorWeakness: 'Zero starting stats', category: 'hybrid', tier: 'final_challenge', maxMana: 40, maxStamina: 80, startingSkills: [] },
  { id: 'broken-vessel', name: 'The Broken Vessel', description: '0 Max Mana. Uses Bloodmancy (HP/Stamina) for all spells.', icon: '💔', offense: 7, defense: 5, magic: 3, primaryStrength: 'Bloodmancy casting without mana', majorWeakness: '0 Mana, permanent Shaking', category: 'low_magic', tier: 'final_challenge', maxMana: 0, maxStamina: 150, startingSkills: ['Brawling', 'Regeneration', 'Bravery'] },
  { id: 'nameless-ghoul', name: 'The Nameless Ghoul', description: 'Reputation locked at -50. Soulbinding/Necromancy costs halved.', icon: '👻', offense: 6, defense: 4, magic: 7, primaryStrength: 'Half-cost Necromancy, consume enemies for Stamina', majorWeakness: 'NPCs refuse to speak to you', category: 'high_magic', tier: 'final_challenge', maxMana: 140, maxStamina: 60, startingSkills: ['Stealth', 'Necromancy', 'Sleight of Hand'] },
  { id: 'fallen-prodigy', name: 'The Fallen Prodigy', description: 'Lost their eyes. Ranged/Aim capped at 0. Massive Illusion radius.', icon: '🔮', offense: 4, defense: 3, magic: 9, primaryStrength: '100% Investigation success, huge spell radius', majorWeakness: 'Cannot use Ranged/Aim ever', category: 'high_magic', tier: 'final_challenge', maxMana: 180, maxStamina: 45, startingSkills: ['Illusion', 'Alteration', 'Investigation'] },
  { id: 'exile-kingslayer', name: 'The Exile Kingslayer', description: 'Hunted by Bounty Hunters. x3 Vengeance Strike on defense.', icon: '👑', offense: 8, defense: 10, magic: 2, primaryStrength: 'Highest defense, 2x Stamina on defending High attacks', majorWeakness: 'Random bounty hunter ambushes', category: 'low_magic', tier: 'final_challenge', maxMana: 15, maxStamina: 180, startingSkills: ['Two Handed', 'Intimidation', 'Justice'] },
  { id: 'mimic-symbiote', name: 'The Mimic Symbiote', description: 'Bonded with a parasite. Can copy enemy skills. Regen drains Stamina.', icon: '🦠', offense: 6, defense: 5, magic: 6, primaryStrength: 'Copy one Active Skill from defeated enemies', majorWeakness: 'Regen drains Stamina each turn; 0 Stamina = HP drain', category: 'hybrid', tier: 'final_challenge', maxMana: 70, maxStamina: 90, startingSkills: ['Acrobatics', 'Deception', 'Alteration'] },
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
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
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
