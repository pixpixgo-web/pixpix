// Character Classes with stats
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
}

export const CHARACTER_CLASSES: CharacterClass[] = [
  { id: 'angel', name: 'Angel', description: 'Celestial being with divine magic', icon: '👼', offense: 8, defense: 3, magic: 9, primaryStrength: 'High Magic/Flight', majorWeakness: 'Low Physical Defense' },
  { id: 'werewolf', name: 'Werewolf', description: 'Savage beast with primal fury', icon: '🐺', offense: 9, defense: 6, magic: 1, primaryStrength: 'High Melee/Speed', majorWeakness: 'Weak to Silver/Low MP' },
  { id: 'assassin', name: 'Assassin', description: 'Master of shadows and critical strikes', icon: '🗡️', offense: 10, defense: 2, magic: 2, primaryStrength: 'Stealth/Crit Damage', majorWeakness: 'Very Low HP' },
  { id: 'brute', name: 'Brute', description: 'Unstoppable wall of muscle', icon: '💪', offense: 7, defense: 10, magic: 1, primaryStrength: 'Raw HP/Physical Def', majorWeakness: 'Extremely Slow' },
  { id: 'priest', name: 'Priest', description: 'Divine healer and protector', icon: '⛪', offense: 1, defense: 5, magic: 10, primaryStrength: 'Healing/Shields', majorWeakness: 'Zero Physical Attack' },
  { id: 'lich', name: 'Lich', description: 'Undead sorcerer of dark arts', icon: '💀', offense: 6, defense: 4, magic: 9, primaryStrength: 'Undead/Life Steal', majorWeakness: 'Fire Vulnerability' },
  { id: 'crow-kin', name: 'Crow-Kin', description: 'Nimble scout of the skies', icon: '🐦‍⬛', offense: 5, defense: 2, magic: 7, primaryStrength: 'Evasion/Scouting', majorWeakness: 'Fragile Bones' },
  { id: 'golem', name: 'Golem', description: 'Living construct of stone', icon: '🗿', offense: 6, defense: 10, magic: 0, primaryStrength: 'Physical Immunity', majorWeakness: 'Cannot Heal with Potions' },
  { id: 'storm-mage', name: 'Storm Mage', description: 'Master of lightning and wind', icon: '⚡', offense: 9, defense: 3, magic: 9, primaryStrength: 'High AoE Damage', majorWeakness: 'High Mana Cost' },
  { id: 'bard', name: 'Bard', description: 'Charismatic performer and buffer', icon: '🎵', offense: 4, defense: 4, magic: 7, primaryStrength: 'Buffing/Persuasion', majorWeakness: 'Weak Solo Fighter' },
  { id: 'vampire', name: 'Vampire', description: 'Immortal lord of the night', icon: '🧛', offense: 8, defense: 5, magic: 6, primaryStrength: 'Life Drain/Charm', majorWeakness: 'Sunlight Weakness' },
  { id: 'druid', name: 'Druid', description: 'Guardian of nature', icon: '🌿', offense: 5, defense: 6, magic: 8, primaryStrength: 'Shapeshifting/Nature Magic', majorWeakness: 'Weak in Cities' },
  { id: 'monk', name: 'Monk', description: 'Martial arts master', icon: '🥋', offense: 7, defense: 7, magic: 4, primaryStrength: 'Unarmed Combat/Speed', majorWeakness: 'No Armor' },
  { id: 'knight', name: 'Knight', description: 'Honorable armored warrior', icon: '🛡️', offense: 6, defense: 9, magic: 2, primaryStrength: 'Heavy Armor/Leadership', majorWeakness: 'Slow Movement' },
  { id: 'pyromancer', name: 'Pyromancer', description: 'Master of flames', icon: '🔥', offense: 10, defense: 2, magic: 8, primaryStrength: 'Fire Damage/AoE', majorWeakness: 'Self-Damage Risk' },
  { id: 'rogue', name: 'Rogue', description: 'Cunning thief and trickster', icon: '🎭', offense: 7, defense: 4, magic: 3, primaryStrength: 'Stealth/Lockpicking', majorWeakness: 'Low Direct Combat' },
  { id: 'archer', name: 'Archer', description: 'Precision ranged fighter', icon: '🏹', offense: 8, defense: 3, magic: 3, primaryStrength: 'Ranged Attacks/Accuracy', majorWeakness: 'Weak in Melee' },
  { id: 'necromancer', name: 'Necromancer', description: 'Commander of the undead', icon: '☠️', offense: 5, defense: 3, magic: 10, primaryStrength: 'Summon Undead/Curses', majorWeakness: 'Hated by All' },
  { id: 'paladin', name: 'Paladin', description: 'Holy knight of justice', icon: '⚔️', offense: 7, defense: 8, magic: 5, primaryStrength: 'Holy Damage/Healing', majorWeakness: 'Cannot Lie/Deceive' },
  { id: 'berserker', name: 'Berserker', description: 'Rage-fueled warrior', icon: '🪓', offense: 10, defense: 3, magic: 0, primaryStrength: 'Extreme Damage/Rage Mode', majorWeakness: 'Cannot Defend' },
];

// Action types for the AP system
export type ActionType = 'free' | 'paid';

export interface ActionCategory {
  type: ActionType;
  apCost: number;
  description: string;
}

export const ACTION_CATEGORIES: Record<string, ActionCategory> = {
  // Free actions
  talk: { type: 'free', apCost: 0, description: 'Talk to NPCs' },
  look: { type: 'free', apCost: 0, description: 'Look around' },
  inventory: { type: 'free', apCost: 0, description: 'Check inventory' },
  ask: { type: 'free', apCost: 0, description: 'Ask questions' },
  defend: { type: 'free', apCost: 0, description: 'Take defensive stance' },
  
  // Paid actions
  attack: { type: 'paid', apCost: 1, description: 'Attack an enemy' },
  cast: { type: 'paid', apCost: 1, description: 'Cast a spell' },
  travel: { type: 'paid', apCost: 1, description: 'Travel to a new zone' },
  climb: { type: 'paid', apCost: 1, description: 'Climb or traverse' },
  search: { type: 'paid', apCost: 1, description: 'Search thoroughly' },
  rest: { type: 'paid', apCost: 0, description: 'Rest to recover AP' },
};

// Zone types for rest mechanics
export type ZoneType = 'safe' | 'danger';

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  restRecovery: number; // Percentage of AP recovered
  ambushChance: number; // Chance of ambush when resting (0-100)
}

export const ZONES: Record<string, Zone> = {
  tavern: { id: 'tavern', name: 'The Tavern', type: 'safe', restRecovery: 100, ambushChance: 0 },
  village: { id: 'village', name: 'Village', type: 'safe', restRecovery: 100, ambushChance: 5 },
  forest: { id: 'forest', name: 'Dark Forest', type: 'danger', restRecovery: 50, ambushChance: 50 },
  dungeon: { id: 'dungeon', name: 'Ancient Dungeon', type: 'danger', restRecovery: 25, ambushChance: 75 },
  caves: { id: 'caves', name: 'Underground Caves', type: 'danger', restRecovery: 30, ambushChance: 60 },
  ruins: { id: 'ruins', name: 'Forgotten Ruins', type: 'danger', restRecovery: 40, ambushChance: 40 },
};

export interface Character {
  id: string;
  user_id: string;
  name: string;
  hp: number;
  max_hp: number;
  gold: number;
  action_points: number;
  max_action_points: number;
  character_class: string;
  offense: number;
  defense: number;
  magic: number;
  current_zone: string;
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
