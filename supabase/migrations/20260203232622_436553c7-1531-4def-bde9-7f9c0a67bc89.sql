-- Game Characters table (main player data)
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Adventurer',
  hp INTEGER NOT NULL DEFAULT 100,
  max_hp INTEGER NOT NULL DEFAULT 100,
  gold INTEGER NOT NULL DEFAULT 50,
  action_points INTEGER NOT NULL DEFAULT 5,
  max_action_points INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory items
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '📦',
  quantity INTEGER NOT NULL DEFAULT 1,
  item_type TEXT NOT NULL DEFAULT 'misc',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Companions (NPCs in the party)
CREATE TABLE public.companions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  personality TEXT NOT NULL DEFAULT 'neutral',
  hp INTEGER NOT NULL DEFAULT 50,
  max_hp INTEGER NOT NULL DEFAULT 50,
  trust INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  icon TEXT NOT NULL DEFAULT '🧙',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages (adventure log)
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Journal entries (story summaries)
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Characters policies
CREATE POLICY "Users can view their own characters"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id);

-- Inventory policies (access through character ownership)
CREATE POLICY "Users can view their inventory"
  ON public.inventory_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = inventory_items.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can add to their inventory"
  ON public.inventory_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = inventory_items.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their inventory"
  ON public.inventory_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = inventory_items.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete from their inventory"
  ON public.inventory_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = inventory_items.character_id 
    AND characters.user_id = auth.uid()
  ));

-- Companions policies
CREATE POLICY "Users can view their companions"
  ON public.companions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = companions.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can add companions"
  ON public.companions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = companions.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their companions"
  ON public.companions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = companions.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove companions"
  ON public.companions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = companions.character_id 
    AND characters.user_id = auth.uid()
  ));

-- Chat messages policies
CREATE POLICY "Users can view their chat messages"
  ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = chat_messages.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can add chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = chat_messages.character_id 
    AND characters.user_id = auth.uid()
  ));

-- Journal entries policies
CREATE POLICY "Users can view their journal"
  ON public.journal_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = journal_entries.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can add journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = journal_entries.character_id 
    AND characters.user_id = auth.uid()
  ));

-- Trigger for updated_at on characters
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companions_updated_at
  BEFORE UPDATE ON public.companions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();