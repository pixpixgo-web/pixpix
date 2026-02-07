
-- Add stamina, mana, XP, and level columns to characters
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS stamina integer NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_stamina integer NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS mana integer NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS max_mana integer NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS backstory text;

-- Update existing characters to have stamina = their old action_points * 20 (roughly mapping 5 AP to 100 stamina)
UPDATE public.characters SET stamina = max_stamina, mana = max_mana WHERE stamina = 100;
