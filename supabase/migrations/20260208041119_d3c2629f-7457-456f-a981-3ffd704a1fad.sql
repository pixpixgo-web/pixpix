-- Add detailed stat columns for 1-100 skill system
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS brawling integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS one_handed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS two_handed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS acrobatics integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS climbing integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stealth integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sleight_of_hand integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aim integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bloodmancy integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS necromancy integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS soulbinding integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS destruction integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS alteration integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS illusion integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS regeneration integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS persuasion integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS intimidation integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seduction integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS investigation integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bartering integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS beastmastery integer NOT NULL DEFAULT 0,
  -- Reputation stats
  ADD COLUMN IF NOT EXISTS bravery integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mercy integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS honor integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS infamy integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS justice integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS malice integer NOT NULL DEFAULT 0,
  -- Stat points available for allocation
  ADD COLUMN IF NOT EXISTS stat_points integer NOT NULL DEFAULT 0,
  -- Revenge tracker
  ADD COLUMN IF NOT EXISTS story_phase text NOT NULL DEFAULT 'the_fall',
  ADD COLUMN IF NOT EXISTS betrayers_defeated text[] NOT NULL DEFAULT '{}';

-- Add stamina/mana to companions for proper tracking
ALTER TABLE public.companions
  ADD COLUMN IF NOT EXISTS stamina integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS max_stamina integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS mana integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS max_mana integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS offense integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS defense integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS magic integer NOT NULL DEFAULT 3;