import { motion } from 'framer-motion';
import { Heart, Coins, Zap, Package, Sword, Shield, Sparkles, MapPin } from 'lucide-react';
import { Character, InventoryItem, ZONES, CHARACTER_CLASSES } from '@/types/game';
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

export function CharacterSheet({ character, inventory }: CharacterSheetProps) {
  const hpPercentage = (character.hp / character.max_hp) * 100;
  const zone = ZONES[character.current_zone] || ZONES.tavern;
  const charClass = CHARACTER_CLASSES.find(c => c.id === character.character_class);

  return (
    <div className="parchment rounded-lg p-4 space-y-4">
      {/* Name & Class */}
      <div className="flex items-center justify-between">
        <h2 className="font-medieval text-lg text-primary gold-glow">
          {character.name}
        </h2>
        <Badge variant="outline" className="gold-border text-xs">
          {charClass?.icon} {charClass?.name || character.character_class}
        </Badge>
      </div>

      {/* Zone */}
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">{zone.name}</span>
        {zone.type === 'danger' && (
          <Badge variant="destructive" className="text-xs">Danger</Badge>
        )}
      </div>

      {/* HP Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-destructive">
            <Heart className="w-4 h-4" />
            Health
          </span>
          <span className="font-medium">
            {character.hp} / {character.max_hp}
          </span>
        </div>
        <div className="hp-bar">
          <motion.div
            className="hp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${hpPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Gold */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-gold-coin">
          <Coins className="w-4 h-4" />
          Gold
        </span>
        <span className="font-medieval text-lg text-gold-coin">
          {character.gold}
        </span>
      </div>

      {/* Action Points */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-primary">
            <Zap className="w-4 h-4" />
            Action Points
          </span>
          <span>
            {character.action_points} / {character.max_action_points}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: character.max_action_points }).map((_, i) => (
            <div
              key={i}
              className={i < character.action_points ? 'action-point' : 'action-point-empty'}
            />
          ))}
        </div>
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
        
        <div className="grid grid-cols-5 gap-2">
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
            <p className="col-span-5 text-sm text-muted-foreground text-center py-2">
              Empty
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
