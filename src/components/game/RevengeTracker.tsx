import { motion } from 'framer-motion';
import { Skull, Target } from 'lucide-react';
import { BETRAYERS } from '@/types/game';

interface RevengeTrackerProps {
  defeatedIds: string[];
  storyPhase: string;
}

const PHASE_LABELS: Record<string, string> = {
  the_fall: 'Phase I: The Fall',
  the_abyss: 'Phase II: The Abyss',
  the_reckoning: 'Phase III: The Reckoning',
};

export function RevengeTracker({ defeatedIds, storyPhase }: RevengeTrackerProps) {
  return (
    <div className="parchment rounded-lg p-4 space-y-3">
      <h3 className="font-medieval text-sm text-primary flex items-center gap-2">
        <Target className="w-4 h-4" />
        Revenge Tracker
      </h3>

      <div className="text-xs text-muted-foreground mb-2">
        {PHASE_LABELS[storyPhase] || storyPhase}
      </div>

      <div className="space-y-2">
        {BETRAYERS.map((b) => {
          const defeated = defeatedIds.includes(b.id);
          return (
            <motion.div
              key={b.id}
              className={`flex items-center gap-2 p-2 rounded text-sm ${
                defeated ? 'bg-destructive/10 opacity-60' : 'bg-secondary/30'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {defeated ? (
                <Skull className="w-4 h-4 text-destructive flex-shrink-0" />
              ) : (
                <Target className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className={`font-medium ${defeated ? 'line-through text-destructive' : ''}`}>
                  {b.name}
                </span>
                <p className="text-xs text-muted-foreground truncate">{b.role}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-xs text-center text-muted-foreground pt-1">
        {defeatedIds.length} / {BETRAYERS.length} eliminated
      </div>
    </div>
  );
}
