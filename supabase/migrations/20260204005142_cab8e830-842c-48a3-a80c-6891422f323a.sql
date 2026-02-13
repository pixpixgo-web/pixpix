-- Add class system columns to characters table
ALTER TABLE public.characters 
ADD COLUMN character_class TEXT DEFAULT 'adventurer',
ADD COLUMN offense INTEGER DEFAULT 5,
ADD COLUMN defense INTEGER DEFAULT 5,
ADD COLUMN magic INTEGER DEFAULT 5,
ADD COLUMN current_zone TEXT DEFAULT 'tavern';

-- Add zone_type to track safe vs danger zones
COMMENT ON COLUMN public.characters.current_zone IS 'Current location: tavern, forest, dungeon, etc.';
COMMENT ON COLUMN public.characters.character_class IS 'One of 20 character classes';
COMMENT ON COLUMN public.characters.offense IS 'Combat offense stat (1-10 scale)';
COMMENT ON COLUMN public.characters.defense IS 'Defense stat (1-10 scale)';
COMMENT ON COLUMN public.characters.magic IS 'Magic stat (1-10 scale)';