import { useState } from 'react';
import { Moon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Character, ZONES, Zone } from '@/types/game';

interface RestButtonProps {
  character: Character;
  onRest: (isAmbushed: boolean) => Promise<void>;
  disabled?: boolean;
}

export function RestButton({ character, onRest, disabled }: RestButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isResting, setIsResting] = useState(false);

  const currentZone: Zone = ZONES[character.current_zone] || ZONES.tavern;
  const isDanger = currentZone.type === 'danger';

  const handleRest = async () => {
    setIsResting(true);
    
    // Check for ambush in danger zones
    const isAmbushed = isDanger && Math.random() * 100 < currentZone.ambushChance;
    
    await onRest(isAmbushed);
    
    setIsResting(false);
    setShowDialog(false);
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        disabled={disabled || character.action_points >= character.max_action_points}
        variant="outline"
        className="gold-border w-full"
      >
        <Moon className="w-4 h-4 mr-2" />
        Rest
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="parchment border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-medieval text-primary flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Rest in {currentZone.name}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p>
                  Resting here will restore{' '}
                  <span className="text-primary font-medium">
                    {Math.ceil((character.max_action_points * currentZone.restRecovery) / 100)} AP
                  </span>{' '}
                  ({currentZone.restRecovery}% recovery).
                </p>

                {isDanger && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
                  >
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Danger Zone!</p>
                      <p className="text-sm text-muted-foreground">
                        There's a {currentZone.ambushChance}% chance of being ambushed while resting here.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRest}
              disabled={isResting}
              className={isDanger ? 'bg-destructive hover:bg-destructive/90' : 'gold-border'}
              variant={isDanger ? 'destructive' : 'outline'}
            >
              {isResting ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  Resting...
                </motion.span>
              ) : (
                <>Rest{isDanger ? ' (Risky)' : ''}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
