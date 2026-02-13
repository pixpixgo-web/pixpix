import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Character, InventoryItem, Companion, ChatMessage, JournalEntry, GameState, CharacterClass, CHARACTER_CLASSES } from '@/types/game';

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
  const [needsClassSelection, setNeedsClassSelection] = useState(false);

  const fetchGameState = useCallback(async () => {
    if (!userId) {
      setGameState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data: characters, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (charError) throw charError;

      if (!characters || characters.length === 0) {
        setNeedsClassSelection(true);
        setGameState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const character = characters[0] as Character;

      if (character.character_class === 'adventurer') {
        setNeedsClassSelection(true);
        setGameState(prev => ({ ...prev, character, isLoading: false }));
        return;
      }

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
      setNeedsClassSelection(false);
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
      .insert({ character_id: gameState.character.id, role, content })
      .select()
      .single();

    if (!error && data) {
      const newMessage = data as ChatMessage;
      setGameState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
      return newMessage;
    }
    return null;
  }, [gameState.character]);

  const addCompanion = useCallback(async (companion: Omit<Companion, 'id' | 'character_id' | 'created_at' | 'updated_at'>) => {
    if (!gameState.character) return;

    const { data, error } = await supabase
      .from('companions')
      .insert({ ...companion, character_id: gameState.character.id })
      .select()
      .single();

    if (!error && data) {
      setGameState(prev => ({ ...prev, companions: [...prev.companions, data as Companion] }));
    }
  }, [gameState.character]);

  const updateCompanion = useCallback(async (companionId: string, updates: Partial<Companion>) => {
    const { error } = await supabase.from('companions').update(updates).eq('id', companionId);

    if (!error) {
      setGameState(prev => ({
        ...prev,
        companions: prev.companions.map(c => c.id === companionId ? { ...c, ...updates } : c),
      }));
    }
  }, []);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'character_id' | 'created_at'>) => {
    if (!gameState.character) return;

    // Check if item already exists — merge by incrementing quantity
    const existing = gameState.inventory.find(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (existing) {
      const newQty = existing.quantity + (item.quantity || 1);
      const { error } = await supabase.from('inventory_items').update({ quantity: newQty }).eq('id', existing.id);
      if (!error) {
        setGameState(prev => ({
          ...prev,
          inventory: prev.inventory.map(i => i.id === existing.id ? { ...i, quantity: newQty } : i),
        }));
      }
      return;
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({ ...item, character_id: gameState.character.id })
      .select()
      .single();

    if (!error && data) {
      setGameState(prev => ({ ...prev, inventory: [...prev.inventory, data as InventoryItem] }));
    }
  }, [gameState.character, gameState.inventory]);

  const removeInventoryItem = useCallback(async (itemName: string) => {
    if (!gameState.character) return;

    const item = gameState.inventory.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) return;

    if (item.quantity > 1) {
      await supabase.from('inventory_items').update({ quantity: item.quantity - 1 }).eq('id', item.id);
      setGameState(prev => ({
        ...prev,
        inventory: prev.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i),
      }));
    } else {
      await supabase.from('inventory_items').delete().eq('id', item.id);
      setGameState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i.id !== item.id),
      }));
    }
  }, [gameState.character, gameState.inventory]);

  const addJournalEntry = useCallback(async (title: string, content: string) => {
    if (!gameState.character) return;

    const entryNumber = gameState.journal.length + 1;
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ character_id: gameState.character.id, title, content, entry_number: entryNumber })
      .select()
      .single();

    if (!error && data) {
      setGameState(prev => ({ ...prev, journal: [...prev.journal, data as JournalEntry] }));
    }
  }, [gameState.character, gameState.journal.length]);

  const createCharacterWithClass = useCallback(async (name: string, selectedClass: CharacterClass, backstory: string, description?: string) => {
    if (!userId) return;

    try {
      const { data: existing } = await supabase
        .from('characters')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      // Use class defaultStats for starting skill values
      const startingSkills: Record<string, number> = { ...(selectedClass.defaultStats || {}) };

      const charData = {
        name,
        character_class: selectedClass.id,
        offense: selectedClass.offense,
        defense: selectedClass.defense,
        magic: selectedClass.magic,
        max_stamina: selectedClass.maxStamina,
        stamina: selectedClass.maxStamina,
        max_mana: selectedClass.maxMana,
        mana: selectedClass.maxMana,
        backstory: backstory || null,
        description: description || null,
        ...startingSkills,
      };

      if (existing && existing.length > 0) {
        const { error } = await supabase.from('characters').update(charData).eq('id', existing[0].id);
        if (error) throw error;
      } else {
        const { data: newChar, error: createError } = await supabase
          .from('characters')
          .insert({ user_id: userId, ...charData })
          .select()
          .single();

        if (createError) throw createError;

        const itemsToInsert = STARTING_ITEMS.map(item => ({
          ...item,
          character_id: newChar.id,
        }));
        await supabase.from('inventory_items').insert(itemsToInsert);
      }

      setNeedsClassSelection(false);
      await fetchGameState();
    } catch (error) {
      console.error('Error creating character:', error);
    }
  }, [userId, fetchGameState]);

  const deleteCharacter = useCallback(async () => {
    if (!gameState.character) return;

    const charId = gameState.character.id;

    // Delete all related data, then the character
    await Promise.all([
      supabase.from('chat_messages').delete().eq('character_id', charId),
      supabase.from('inventory_items').delete().eq('character_id', charId),
      supabase.from('companions').delete().eq('character_id', charId),
      supabase.from('journal_entries').delete().eq('character_id', charId),
    ]);

    await supabase.from('characters').delete().eq('id', charId);

    setGameState({
      character: null,
      inventory: [],
      companions: [],
      messages: [],
      journal: [],
      isLoading: false,
    });
    setNeedsClassSelection(true);
  }, [gameState.character]);

  return {
    ...gameState,
    needsClassSelection,
    updateCharacter,
    addMessage,
    addCompanion,
    updateCompanion,
    addInventoryItem,
    removeInventoryItem,
    addJournalEntry,
    createCharacterWithClass,
    deleteCharacter,
    refreshGameState: fetchGameState,
  };
}
