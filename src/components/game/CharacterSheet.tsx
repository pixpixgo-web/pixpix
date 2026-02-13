import { motion } from 'framer-motion';
import { Heart, Coins, Flame, Droplets, Star, Package, Sword, Shield, Sparkles, MapPin } from 'lucide-react';
import { StatusEffects } from './StatusEffects';
import { Character, InventoryItem, ZONES, CHARACTER_CLASSES, xpForNextLevel } from '@/types/game';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface CharacterSheetProps {
  character: Character;
  inventory: InventoryItem[];
}

function ResourceBar({ 
  label, icon, current, max, colorClass, bgClass 
}: { 
  label: string; icon: React.ReactNode; current: number; max: number; colorClass: string; bgClass: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className={`flex items-center gap-1 ${colorClass}`}>
          {icon}
          {label}
        </span>
        <span className="font-medium">{current} / {max}</span>
      </div>
      <div className={`h-3 rounded-full overflow-hidden ${bgClass}`}>
        <motion.div
          className={`h-full rounded-full ${colorClass.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          style={{ 
            background: label === 'Health' 
              ? 'linear-gradient(90deg, hsl(0 70% 45%), hsl(0 65% 55%))' 
              : label === 'Stamina'
              ? 'linear-gradient(90deg, hsl(35 80% 40%), hsl(45 85% 55%))'
              : label === 'Mana'
              ? 'linear-gradient(90deg, hsl(210 70% 40%), hsl(220 80% 60%))'
              : undefined
          }}
        />
      </div>
    </div>
  );
}

export function CharacterSheet({ character, inventory }: CharacterSheetProps) {
  const zone = ZONES[character.current_zone] || ZONES.tavern;
  const charClass = CHARACTER_CLASSES.find(c => c.id === character.character_class);
  const xpNeeded = xpForNextLevel(character.level);
  const xpPct = Math.min(100, (character.xp / xpNeeded) * 100);

  return (
    <div className="parchment rounded-lg p-4 space-y-3">
      {/* Name & Class */}
      <div className="flex items-center justify-between">
        <h2 className="font-medieval text-lg text-primary gold-glow">{character.name}</h2>
        <Badge variant="outline" className="gold-border text-xs">
          {charClass?.icon || '⚔️'} {charClass?.name || character.character_class}
        </Badge>
      </div>

      {/* Zone & Level */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{zone.name}</span>
          {zone.type === 'danger' && (
            <Badge variant="destructive" className="text-xs">Danger</Badge>
          )}
        </div>
        <Badge variant="outline" className="text-xs">Lv {character.level}</Badge>
      </div>

      {/* HP Bar */}
      <ResourceBar
        label="Health"
        icon={<Heart className="w-4 h-4" />}
        current={character.hp}
        max={character.max_hp}
        colorClass="text-destructive"
        bgClass="bg-destructive/20"
      />

      {/* Stamina Bar */}
      <ResourceBar
        label="Stamina"
        icon={<Flame className="w-4 h-4" />}
        current={character.stamina}
        max={character.max_stamina}
        colorClass="text-gold-coin"
        bgClass="bg-accent/20"
      />

      {/* Mana Bar */}
      <ResourceBar
        label="Mana"
        icon={<Droplets className="w-4 h-4" />}
        current={character.mana}
        max={character.max_mana}
        colorClass="text-magic-blue"
        bgClass="bg-magic-blue/20"
      />

      {/* Status Effects */}
      <StatusEffects character={character} />

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-primary">
            <Star className="w-3 h-3" />
            XP
          </span>
          <span>{character.xp} / {xpNeeded}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-secondary/50">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 0.5 }}
            style={{ background: 'linear-gradient(90deg, hsl(45 80% 45%), hsl(50 90% 60%))' }}
          />
        </div>
      </div>

      {/* Gold */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-gold-coin text-sm">
          <Coins className="w-4 h-4" />
          Gold
        </span>
        <span className="font-medieval text-lg text-gold-coin">{character.gold}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Tooltip>
          <TooltipTrigger>
            <div className="p-2 bg-secondary/30 rounded-lg">
              <Sword className="w-4 h-4 mx-auto text-destructive mb-1" />
              <span className="text-sm font-medium">{character.offense}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Offense (Attack Power)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <div className="p-2 bg-secondary/30 rounded-lg">
              <Shield className="w-4 h-4 mx-auto text-blue-400 mb-1" />
              <span className="text-sm font-medium">{character.defense}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Defense (Damage Reduction)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <div className="p-2 bg-secondary/30 rounded-lg">
              <Sparkles className="w-4 h-4 mx-auto text-purple-400 mb-1" />
              <span className="text-sm font-medium">{character.magic}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Magic (Spell Power)</TooltipContent>
        </Tooltip>
      </div>

      {/* Inventory */}
      <div className="space-y-2">
        <h3 className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <Package className="w-4 h-4" />
          Inventory ({inventory.length})
        </h3>
        
        <div className="grid grid-cols-5 gap-2 max-h-[120px] overflow-y-auto">
          {inventory.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded gold-border flex items-center justify-center text-lg cursor-pointer bg-secondary/50 relative"
                >
                  {item.icon}
                  {item.quantity > 1 && (
                    <span className="absolute -bottom-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                      {item.quantity}
                    </span>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          
          {inventory.length === 0 && (
            <p className="col-span-5 text-sm text-muted-foreground text-center py-2">Empty</p>
          )}
        </div>
      </div>
    </div>
  );
}
