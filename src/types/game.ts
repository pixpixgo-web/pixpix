export interface Character {
  id: string;
  user_id: string;
  name: string;
  hp: number;
  max_hp: number;
  gold: number;
  action_points: number;
  max_action_points: number;
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
