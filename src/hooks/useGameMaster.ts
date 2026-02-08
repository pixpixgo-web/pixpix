import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Character, InventoryItem, Companion, ChatMessage, xpForNextLevel, CHARACTER_CLASSES } from '@/types/game';

interface GameChanges {
  hpChange?: number;
  goldChange?: number;
  staminaChange?: number;
  manaChange?: number;
  xpGain?: number;
  newItems?: Array<{ name: string; description?: string; icon?: string; quantity?: number; item_type?: string }>;
  removeItems?: string[];
  trustChanges?: Array<{ name: string; change: number }>;
  newCompanion?: { name: string; personality: string; icon: string; description: string; hp?: number; max_hp?: number };
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
  refreshGameState: () => Promise<void>;
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
  refreshGameState,
}: UseGameMasterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const { toast } = useToast();

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
      const diceRoll = rollDice();
      await addMessage('user', action);

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
          skills: {
            brawling: character.brawling, one_handed: character.one_handed, two_handed: character.two_handed,
            acrobatics: character.acrobatics, climbing: character.climbing, stealth: character.stealth,
            sleight_of_hand: character.sleight_of_hand, aim: character.aim, bloodmancy: character.bloodmancy,
            necromancy: character.necromancy, soulbinding: character.soulbinding, destruction: character.destruction,
            alteration: character.alteration, illusion: character.illusion, regeneration: character.regeneration,
            persuasion: character.persuasion, intimidation: character.intimidation, seduction: character.seduction,
            investigation: character.investigation, bartering: character.bartering, beastmastery: character.beastmastery,
          },
          reputation: {
            bravery: character.bravery, mercy: character.mercy, honor: character.honor,
            infamy: character.infamy, justice: character.justice, loyalty: character.loyalty, malice: character.malice,
          },
          storyPhase: character.story_phase,
          betrayersDefeated: character.betrayers_defeated,
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

      await addMessage('assistant', data.narrative);

      // Process game state changes — accumulate all updates into one object
      const changes = data.gameChanges as GameChanges | null;
      if (changes) {
        const charUpdates: Partial<Character> = {};

        let currentStatPoints = character.stat_points || 0;
        // Track current values locally to avoid stale state
        let currentHp = character.hp;
        let currentStamina = character.stamina;
        let currentMana = character.mana;
        let currentGold = character.gold;
        let currentXp = character.xp;
        let currentLevel = character.level;
        let currentMaxHp = character.max_hp;
        let currentMaxStamina = character.max_stamina;
        let currentMaxMana = character.max_mana;

        if (changes.hpChange) {
          currentHp = Math.max(0, Math.min(currentMaxHp, currentHp + changes.hpChange));
          charUpdates.hp = currentHp;
          if (changes.hpChange < 0) {
            toast({ title: "Damage Taken!", description: `You lost ${Math.abs(changes.hpChange)} HP`, variant: "destructive" });
          } else {
            toast({ title: "Healed!", description: `You recovered ${changes.hpChange} HP` });
          }
        }

        if (changes.staminaChange) {
          currentStamina = Math.max(0, Math.min(currentMaxStamina, currentStamina + changes.staminaChange));
          charUpdates.stamina = currentStamina;
        }

        if (changes.manaChange) {
          currentMana = Math.max(0, Math.min(currentMaxMana, currentMana + changes.manaChange));
          charUpdates.mana = currentMana;
        }

        if (changes.goldChange) {
          currentGold = Math.max(0, currentGold + changes.goldChange);
          charUpdates.gold = currentGold;
          if (changes.goldChange > 0) {
            toast({ title: "Gold Acquired!", description: `+${changes.goldChange} gold` });
          }
        }

        if (changes.xpGain && changes.xpGain > 0) {
          currentXp = currentXp + changes.xpGain;
          toast({ title: "XP Gained!", description: `+${changes.xpGain} XP` });

          // Check for level up(s)
          let xpNeeded = xpForNextLevel(currentLevel);
          while (currentXp >= xpNeeded) {
            currentXp -= xpNeeded;
            currentLevel += 1;

            // Get class data for scaling
            const charClass = CHARACTER_CLASSES.find(c => c.id === character.character_class);
            // Increase max resources on level up
            const staminaGain = charClass ? Math.round(charClass.maxStamina * 0.05) : 5;
            const manaGain = charClass ? Math.round(charClass.maxMana * 0.05) : 5;
            const hpGain = 10;

            currentMaxHp += hpGain;
            currentMaxStamina += staminaGain;
            currentMaxMana += manaGain;

            // Refill all resources on level up (Second Wind)
            currentHp = currentMaxHp;
            currentStamina = currentMaxStamina;
            currentMana = currentMaxMana;

            // Grant 3 stat points per level
            currentStatPoints += 3;

            toast({ title: `🎉 Level Up! Level ${currentLevel}`, description: `HP +${hpGain}, Stamina +${staminaGain}, Mana +${manaGain}. +3 Stat Points! Resources fully restored!` });

            xpNeeded = xpForNextLevel(currentLevel);
          }

          charUpdates.xp = currentXp;
          charUpdates.level = currentLevel;
          charUpdates.max_hp = currentMaxHp;
          charUpdates.max_stamina = currentMaxStamina;
          charUpdates.max_mana = currentMaxMana;
          charUpdates.hp = currentHp;
          charUpdates.stamina = currentStamina;
          charUpdates.mana = currentMaxMana;
          charUpdates.stat_points = currentStatPoints;
        }

        if (changes.zoneChange) {
          charUpdates.current_zone = changes.zoneChange;
        }

        // Apply ALL character updates at once to avoid stale state
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
          // Prevent duplicate companions by name
          const existing = companions.find(c => c.name.toLowerCase() === changes.newCompanion!.name.toLowerCase());
          if (!existing) {
            const companionHp = changes.newCompanion.hp || Math.max(80, 50 + character.level * 10);
            const companionMaxHp = changes.newCompanion.max_hp || companionHp;
            await addCompanion({
              name: changes.newCompanion.name, description: changes.newCompanion.description,
              personality: changes.newCompanion.personality, hp: companionHp, max_hp: companionMaxHp,
              trust: 50, is_active: true, icon: changes.newCompanion.icon,
              stamina: 100, max_stamina: 100, mana: 50, max_mana: 50,
              offense: 5, defense: 5, magic: 3,
            });
            toast({ title: "New Companion!", description: `${changes.newCompanion.name} has joined your party!` });
          } else {
            toast({ title: "Companion Reunited", description: `${changes.newCompanion.name} is already in your party.` });
          }
        }

        if (changes.journalEntry) {
          await addJournalEntry(changes.journalEntry.title, changes.journalEntry.content);
        }
      }

      // Refresh full state from DB to ensure everything is in sync
      await refreshGameState();
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
    addInventoryItem, removeInventoryItem, addJournalEntry, toast, rollDice, refreshGameState,
  ]);

  return {
    processAction,
    isProcessing,
    lastDiceRoll,
  };
}
