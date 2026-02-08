import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '@/types/game';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatusEffect {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
}

function deriveStatusEffects(character: Character): StatusEffect[] {
  const effects: StatusEffect[] = [];

  // Stamina-based
  const staminaPct = character.stamina / character.max_stamina;
  if (character.stamina <= 0) {
    effects.push({ id: 'exhausted', icon: '😵', label: 'Exhausted', description: 'No stamina left. Rest or defend to recover.', color: 'bg-red-900/60 border-red-500/50' });
  } else if (staminaPct <= 0.2) {
    effects.push({ id: 'tired', icon: '😰', label: 'Fatigued', description: 'Very low stamina. Actions cost more effort.', color: 'bg-orange-900/60 border-orange-500/50' });
  } else if (staminaPct <= 0.4) {
    effects.push({ id: 'winded', icon: '💨', label: 'Winded', description: 'Low stamina. Desperation damage boost active (x1.8).', color: 'bg-yellow-900/60 border-yellow-500/50' });
  }

  // Mana-based
  if (character.max_mana > 0) {
    const manaPct = character.mana / character.max_mana;
    if (character.mana <= 0) {
      effects.push({ id: 'mana-deficient', icon: '🫨', label: 'Mana Deficient', description: 'Shaking! Next spell will cause fainting. Stamina costs x1.5.', color: 'bg-purple-900/60 border-purple-500/50' });
    } else if (manaPct <= 0.2) {
      effects.push({ id: 'mana-drained', icon: '🌀', label: 'Drained', description: 'Mana dangerously low. Stamina costs x1.5 for spells.', color: 'bg-indigo-900/60 border-indigo-500/50' });
    }
  }

  // HP-based
  const hpPct = character.hp / character.max_hp;
  if (hpPct <= 0.15) {
    effects.push({ id: 'dying', icon: '💀', label: 'Near Death', description: 'One hit from death. Find healing immediately!', color: 'bg-red-950/80 border-red-700/60' });
  } else if (hpPct <= 0.35) {
    effects.push({ id: 'wounded', icon: '🩸', label: 'Wounded', description: 'Badly hurt. Seek healing or rest.', color: 'bg-red-900/50 border-red-600/40' });
  }

  // Momentum (Fresh state is a positive buff)
  if (staminaPct >= 0.8 && character.stamina > 0) {
    effects.push({ id: 'fresh', icon: '✨', label: 'Fresh', description: 'Full energy! Solid guard and x1.2 damage bonus.', color: 'bg-emerald-900/60 border-emerald-500/50' });
  }

  // Zone-based
  if (['dungeon', 'abyss', 'caves'].includes(character.current_zone)) {
    effects.push({ id: 'in-danger', icon: '⚠️', label: 'In Danger', description: 'Dangerous zone. High ambush chance, low rest recovery.', color: 'bg-amber-900/50 border-amber-500/40' });
  }

  return effects;
}

interface StatusEffectsProps {
  character: Character;
}

export function StatusEffects({ character }: StatusEffectsProps) {
  const effects = deriveStatusEffects(character);

  if (effects.length === 0) return null;

  return (
    <div className="parchment rounded-lg p-3">
      <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Status</h3>
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout">
          {effects.map((effect) => (
            <Tooltip key={effect.id}>
              <TooltipTrigger asChild>
                <motion.div
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs cursor-default ${effect.color}`}
                >
                  <span>{effect.icon}</span>
                  <span className="font-medium">{effect.label}</span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">{effect.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
