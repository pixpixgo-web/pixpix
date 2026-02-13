import { Users } from 'lucide-react';
import { Companion } from '@/types/game';
import { CompanionCard } from './CompanionCard';
import { motion, AnimatePresence } from 'framer-motion';

interface PartyPanelProps {
  companions: Companion[];
}

export function PartyPanel({ companions }: PartyPanelProps) {
  const activeCompanions = companions.filter(c => c.is_active);

  return (
    <div className="parchment rounded-lg p-4">
      <h3 className="font-medieval text-sm text-primary mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Party ({activeCompanions.length})
      </h3>

      <div className="space-y-3">
        <AnimatePresence>
          {activeCompanions.length > 0 ? (
            activeCompanions.map((companion) => (
              <CompanionCard key={companion.id} companion={companion} />
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center py-4"
            >
              No companions yet. Perhaps you'll meet someone on your journey...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
