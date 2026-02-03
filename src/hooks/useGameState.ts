import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Character, InventoryItem, Companion, ChatMessage, JournalEntry, GameState } from '@/types/game';

const STARTING_ITEMS: Omit<InventoryItem, 'id' | 'character_id' | 'created_at'>[] = [
  { name: 'Rusty Sword', description: 'An old but reliable blade', icon: '⚔️', quantity: 1, item_type: 'weapon' },
  { name: 'Health Potion', description: 'Restores 25 HP', icon: '🧪', quantity: 2, item_type: 'consumable' },
  { name: 'Torch', description: 'Lights the way in dark places', icon: '🔦', quantity: 3, item_type: 'misc' },
];

export function useGameState(userId: string | null) {
  const [gameState, setGameState] = useState<GameState>({
    character: null,
    inventory: [],
    companions: [],
    messages: [],
    journal: [],
    isLoading: true,
  });

  const fetchGameState = useCallback(async () => {
    if (!userId) {
      setGameState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Fetch or create character
      let { data: characters, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (charError) throw charError;

      let character: Character;
      
      if (!characters || characters.length === 0) {
        // Create new character
        const { data: newChar, error: createError } = await supabase
          .from('characters')
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;
        character = newChar as Character;

        // Add starting items
        const itemsToInsert = STARTING_ITEMS.map(item => ({
          ...item,
          character_id: character.id,
        }));

        await supabase.from('inventory_items').insert(itemsToInsert);
      } else {
        character = characters[0] as Character;
      }

      // Fetch related data
      const [inventoryRes, companionsRes, messagesRes, journalRes] = await Promise.all([
        supabase.from('inventory_items').select('*').eq('character_id', character.id),
        supabase.from('companions').select('*').eq('character_id', character.id),
        supabase.from('chat_messages').select('*').eq('character_id', character.id).order('created_at', { ascending: true }),
        supabase.from('journal_entries').select('*').eq('character_id', character.id).order('entry_number', { ascending: true }),
      ]);

      setGameState({
        character,
        inventory: (inventoryRes.data || []) as InventoryItem[],
        companions: (companionsRes.data || []) as Companion[],
        messages: (messagesRes.data || []) as ChatMessage[],
        journal: (journalRes.data || []) as JournalEntry[],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching game state:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId]);

  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  const updateCharacter = useCallback(async (updates: Partial<Character>) => {
    if (!gameState.character) return;

    const { error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', gameState.character.id);

    if (!error) {
      setGameState(prev => ({
        ...prev,
        character: prev.character ? { ...prev.character, ...updates } : null,
      }));
    }
  }, [gameState.character]);

  const addMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!gameState.character) return null;

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        character_id: gameState.character.id,
        role,
        content,
      })
      .select()
      .single();

    if (!error && data) {
      const newMessage = data as ChatMessage;
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));
      return newMessage;
    }
    return null;
  }, [gameState.character]);

  const addCompanion = useCallback(async (companion: Omit<Companion, 'id' | 'character_id' | 'created_at' | 'updated_at'>) => {
    if (!gameState.character) return;

    const { data, error } = await supabase
      .from('companions')
      .insert({
        ...companion,
        character_id: gameState.character.id,
      })
      .select()
      .single();

    if (!error && data) {
      setGameState(prev => ({
        ...prev,
        companions: [...prev.companions, data as Companion],
      }));
    }
  }, [gameState.character]);

  const updateCompanion = useCallback(async (companionId: string, updates: Partial<Companion>) => {
    const { error } = await supabase
      .from('companions')
      .update(updates)
      .eq('id', companionId);

    if (!error) {
      setGameState(prev => ({
        ...prev,
        companions: prev.companions.map(c => 
          c.id === companionId ? { ...c, ...updates } : c
        ),
      }));
    }
  }, []);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'character_id' | 'created_at'>) => {
    if (!gameState.character) return;

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        ...item,
        character_id: gameState.character.id,
      })
      .select()
      .single();

    if (!error && data) {
      setGameState(prev => ({
        ...prev,
        inventory: [...prev.inventory, data as InventoryItem],
      }));
    }
  }, [gameState.character]);

  const addJournalEntry = useCallback(async (title: string, content: string) => {
    if (!gameState.character) return;

    const entryNumber = gameState.journal.length + 1;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        character_id: gameState.character.id,
        title,
        content,
        entry_number: entryNumber,
      })
      .select()
      .single();

    if (!error && data) {
      setGameState(prev => ({
        ...prev,
        journal: [...prev.journal, data as JournalEntry],
      }));
    }
  }, [gameState.character, gameState.journal.length]);

  return {
    ...gameState,
    updateCharacter,
    addMessage,
    addCompanion,
    updateCompanion,
    addInventoryItem,
    addJournalEntry,
    refreshGameState: fetchGameState,
  };
}
