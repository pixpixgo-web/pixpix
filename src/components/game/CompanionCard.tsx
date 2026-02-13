import { motion } from 'framer-motion';
import { Heart, Shield } from 'lucide-react';
import { Companion } from '@/types/game';

interface CompanionCardProps {
  companion: Companion;
}

export function CompanionCard({ companion }: CompanionCardProps) {
  const hpPercentage = (companion.hp / companion.max_hp) * 100;
  const trustPercentage = companion.trust;

  const getTrustColor = (trust: number) => {
    if (trust >= 70) return 'bg-trust-high';
    if (trust >= 40) return 'bg-trust-medium';
    return 'bg-trust-low';
  };

  const getTrustLabel = (trust: number) => {
    if (trust >= 80) return 'Loyal';
    if (trust >= 60) return 'Friendly';
    if (trust >= 40) return 'Neutral';
    if (trust >= 20) return 'Wary';
    return 'Hostile';
  };

  const getPersonalityEmoji = (personality: string) => {
    const map: Record<string, string> = {
      brave: '⚔️',
      cowardly: '😰',
      wise: '📚',
      aggressive: '💢',
      peaceful: '☮️',
      cunning: '🦊',
      loyal: '🤝',
      neutral: '😐',
    };
    return map[personality] || '👤';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="companion-card"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{companion.icon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medieval text-sm text-foreground truncate">
              {companion.name}
            </h4>
            <span className="text-xs" title={companion.personality}>
              {getPersonalityEmoji(companion.personality)}
            </span>
          </div>

          {/* HP Bar */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Heart className="w-3 h-3" />
                HP
              </span>
              <span>{companion.hp}/{companion.max_hp}</span>
            </div>
            <div className="h-1.5 rounded-full bg-hp-bg overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-destructive"
                initial={{ width: 0 }}
                animate={{ width: `${hpPercentage}%` }}
              />
            </div>
          </div>

          {/* Trust Meter */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Shield className="w-3 h-3" />
                Trust
              </span>
              <span className={
                trustPercentage >= 70 ? 'text-trust-high' :
                trustPercentage >= 40 ? 'text-trust-medium' :
                'text-trust-low'
              }>
                {getTrustLabel(trustPercentage)}
              </span>
            </div>
            <div className="trust-meter">
              <motion.div
                className={`h-full rounded-full ${getTrustColor(trustPercentage)}`}
                initial={{ width: 0 }}
                animate={{ width: `${trustPercentage}%` }}
              />
            </div>
          </div>

          {companion.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {companion.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
