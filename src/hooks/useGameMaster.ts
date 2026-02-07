import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Character, InventoryItem, Companion, ChatMessage } from '@/types/game';

interface GameChanges {
  hpChange?: number;
  goldChange?: number;
  staminaChange?: number;
  manaChange?: number;
  xpGain?: number;
  newItems?: Array<{ name: string; description?: string; icon?: string; quantity?: number; item_type?: string }>;
  removeItems?: string[];
  trustChanges?: Array<{ name: string; change: number }>;
  newCompanion?: { name: string; personality: string; icon: string; description: string };
  journalEntry?: { title: string; content: string };
  zoneChange?: string;
}

interface UseGameMasterProps {
  character: Character | null;
  inventory: InventoryItem[];
  companions: Companion[];
  messages: ChatMessage[];
  updateCharacter: (updates: Partial<Character>) => Promise<void>;
  addMessage: (role: 'user' | 'assistant', content: string) => Promise<ChatMessage | null>;
  addCompanion: (companion: Omit<Companion, 'id' | 'character_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCompanion: (id: string, updates: Partial<Companion>) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'character_id' | 'created_at'>) => Promise<void>;
  removeInventoryItem: (name: string) => Promise<void>;
  addJournalEntry: (title: string, content: string) => Promise<void>;
}

export function useGameMaster({
  character,
  inventory,
  companions,
  messages,
  updateCharacter,
  addMessage,
  addCompanion,
  updateCompanion,
  addInventoryItem,
  removeInventoryItem,
  addJournalEntry,
}: UseGameMasterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const { toast } = useToast();

  // Auto dice roll — always roll before an action
  const rollDice = useCallback((): number => {
    const value = Math.floor(Math.random() * 20) + 1;
    setLastDiceRoll(value);
    return value;
  }, []);

  const processAction = useCallback(async (action: string, isFreeAction: boolean = false) => {
    if (!character || isProcessing) return;

    if (!isFreeAction && character.stamina <= 0) {
      toast({
        title: "No Stamina",
        description: "You're exhausted! Rest or defend to recover.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Auto roll dice for every action
      const diceRoll = rollDice();

      // Add user message
      await addMessage('user', action);

      // Build game context
      const gameContext = {
        character: {
          name: character.name,
          characterClass: character.character_class,
          hp: character.hp,
          maxHp: character.max_hp,
          gold: character.gold,
          stamina: character.stamina,
          maxStamina: character.max_stamina,
          mana: character.mana,
          maxMana: character.max_mana,
          offense: character.offense,
          defense: character.defense,
          magic: character.magic,
          currentZone: character.current_zone,
          level: character.level,
          xp: character.xp,
          backstory: character.backstory,
        },
        inventory: inventory.map(i => ({ name: i.name, description: i.description, quantity: i.quantity })),
        companions: companions.filter(c => c.is_active).map(c => ({
          name: c.name, personality: c.personality, hp: c.hp, maxHp: c.max_hp, trust: c.trust,
        })),
        recentMessages: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        isFreeAction,
      };

      const { data, error } = await supabase.functions.invoke('game-master', {
        body: { action, gameContext, diceRoll },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      // Add AI response
      await addMessage('assistant', data.narrative);

      // Process game state changes
      const changes = data.gameChanges as GameChanges | null;
      if (changes) {
        const charUpdates: Partial<Character> = {};

        if (changes.hpChange) {
          charUpdates.hp = Math.max(0, Math.min(character.max_hp, character.hp + changes.hpChange));
          if (changes.hpChange < 0) {
            toast({ title: "Damage Taken!", description: `You lost ${Math.abs(changes.hpChange)} HP`, variant: "destructive" });
          } else {
            toast({ title: "Healed!", description: `You recovered ${changes.hpChange} HP` });
          }
        }

        if (changes.staminaChange) {
          charUpdates.stamina = Math.max(0, Math.min(character.max_stamina, character.stamina + changes.staminaChange));
        }

        if (changes.manaChange) {
          charUpdates.mana = Math.max(0, Math.min(character.max_mana, character.mana + changes.manaChange));
        }

        if (changes.goldChange) {
          charUpdates.gold = Math.max(0, character.gold + changes.goldChange);
          if (changes.goldChange > 0) {
            toast({ title: "Gold Acquired!", description: `+${changes.goldChange} gold` });
          }
        }

        if (changes.xpGain && changes.xpGain > 0) {
          charUpdates.xp = character.xp + changes.xpGain;
          toast({ title: "XP Gained!", description: `+${changes.xpGain} XP` });
        }

        if (changes.zoneChange) {
          charUpdates.current_zone = changes.zoneChange;
        }

        if (Object.keys(charUpdates).length > 0) {
          await updateCharacter(charUpdates);
        }

        if (changes.newItems?.length) {
          for (const item of changes.newItems) {
            await addInventoryItem({
              name: item.name, description: item.description || null, icon: item.icon || '📦',
              quantity: item.quantity || 1, item_type: item.item_type || 'misc',
            });
          }
          toast({ title: "Items Acquired!", description: changes.newItems.map(i => i.name).join(', ') });
        }

        if (changes.removeItems?.length) {
          for (const itemName of changes.removeItems) {
            await removeInventoryItem(itemName);
          }
        }

        if (changes.trustChanges?.length) {
          for (const tc of changes.trustChanges) {
            const companion = companions.find(c => c.name.toLowerCase() === tc.name.toLowerCase());
            if (companion) {
              const newTrust = Math.max(0, Math.min(100, companion.trust + tc.change));
              await updateCompanion(companion.id, { trust: newTrust });
            }
          }
        }

        if (changes.newCompanion) {
          await addCompanion({
            name: changes.newCompanion.name, description: changes.newCompanion.description,
            personality: changes.newCompanion.personality, hp: 50, max_hp: 50,
            trust: 50, is_active: true, icon: changes.newCompanion.icon,
          });
          toast({ title: "New Companion!", description: `${changes.newCompanion.name} has joined your party!` });
        }

        if (changes.journalEntry) {
          await addJournalEntry(changes.journalEntry.title, changes.journalEntry.content);
        }
      }
    } catch (error) {
      console.error('Game Master error:', error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "The mystic forces falter...",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    character, isProcessing, inventory, companions, messages,
    updateCharacter, addMessage, addCompanion, updateCompanion,
    addInventoryItem, removeInventoryItem, addJournalEntry, toast, rollDice,
  ]);

  return {
    processAction,
    isProcessing,
    lastDiceRoll,
  };
}
