import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Character, InventoryItem, Companion, ChatMessage } from '@/types/game';

interface GameChanges {
  hpChange?: number;
  goldChange?: number;
  newItems?: Array<{ name: string; description?: string; icon?: string; quantity?: number; item_type?: string }>;
  removeItems?: string[];
  trustChanges?: Array<{ name: string; change: number }>;
  newCompanion?: {
    name: string;
    personality: string;
    icon: string;
    description: string;
  };
  journalEntry?: {
    title: string;
    content: string;
  };
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
  addJournalEntry,
}: UseGameMasterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processAction = useCallback(async (action: string, diceRoll?: number, isFreeAction: boolean = false) => {
    if (!character || isProcessing) return;

    // Check action points for non-free actions
    if (!isFreeAction && character.action_points <= 0) {
      toast({
        title: "No Action Points",
        description: "You're exhausted! Rest to recover your strength.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Add user message first
      await addMessage('user', action);

      // Deduct action point only for paid actions
      if (!isFreeAction) {
        await updateCharacter({ action_points: character.action_points - 1 });
      }

      // Prepare game context
      const gameContext = {
        character: {
          name: character.name,
          characterClass: character.character_class,
          hp: character.hp,
          maxHp: character.max_hp,
          gold: character.gold,
          actionPoints: isFreeAction ? character.action_points : character.action_points - 1,
          offense: character.offense,
          defense: character.defense,
          magic: character.magic,
          currentZone: character.current_zone,
        },
        inventory: inventory.map(i => ({
          name: i.name,
          description: i.description,
          quantity: i.quantity,
        })),
        companions: companions.filter(c => c.is_active).map(c => ({
          name: c.name,
          personality: c.personality,
          hp: c.hp,
          maxHp: c.max_hp,
          trust: c.trust,
        })),
        recentMessages: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
        isFreeAction,
      };

      // Call the AI Game Master
      const { data, error } = await supabase.functions.invoke('game-master', {
        body: { action, gameContext, diceRoll },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add AI response
      await addMessage('assistant', data.narrative);

      // Process game state changes
      const changes = data.gameChanges as GameChanges | null;
      if (changes) {
        // HP changes
        if (changes.hpChange) {
          const newHp = Math.max(0, Math.min(character.max_hp, character.hp + changes.hpChange));
          await updateCharacter({ hp: newHp });
          
          if (changes.hpChange < 0) {
            toast({
              title: "Damage Taken!",
              description: `You lost ${Math.abs(changes.hpChange)} HP`,
              variant: "destructive",
            });
          } else if (changes.hpChange > 0) {
            toast({
              title: "Healed!",
              description: `You recovered ${changes.hpChange} HP`,
            });
          }
        }

        // Gold changes
        if (changes.goldChange) {
          const newGold = Math.max(0, character.gold + changes.goldChange);
          await updateCharacter({ gold: newGold });
          
          if (changes.goldChange > 0) {
            toast({
              title: "Gold Acquired!",
              description: `+${changes.goldChange} gold`,
            });
          }
        }

        // New items
        if (changes.newItems?.length) {
          for (const item of changes.newItems) {
            await addInventoryItem({
              name: item.name,
              description: item.description || null,
              icon: item.icon || '📦',
              quantity: item.quantity || 1,
              item_type: item.item_type || 'misc',
            });
          }
          toast({
            title: "Items Acquired!",
            description: changes.newItems.map(i => i.name).join(', '),
          });
        }

        // Trust changes
        if (changes.trustChanges?.length) {
          for (const tc of changes.trustChanges) {
            const companion = companions.find(c => c.name.toLowerCase() === tc.name.toLowerCase());
            if (companion) {
              const newTrust = Math.max(0, Math.min(100, companion.trust + tc.change));
              await updateCompanion(companion.id, { trust: newTrust });
              
              if (tc.change !== 0) {
                toast({
                  title: tc.change > 0 ? "Trust Increased" : "Trust Decreased",
                  description: `${companion.name}'s trust ${tc.change > 0 ? 'grew' : 'fell'}`,
                  variant: tc.change > 0 ? "default" : "destructive",
                });
              }
            }
          }
        }

        // New companion
        if (changes.newCompanion) {
          await addCompanion({
            name: changes.newCompanion.name,
            description: changes.newCompanion.description,
            personality: changes.newCompanion.personality,
            hp: 50,
            max_hp: 50,
            trust: 50,
            is_active: true,
            icon: changes.newCompanion.icon,
          });
          toast({
            title: "New Companion!",
            description: `${changes.newCompanion.name} has joined your party!`,
          });
        }

        // Journal entry
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
    character,
    isProcessing,
    inventory,
    companions,
    messages,
    updateCharacter,
    addMessage,
    addCompanion,
    updateCompanion,
    addInventoryItem,
    addJournalEntry,
    toast,
  ]);

  return {
    processAction,
    isProcessing,
  };
}
