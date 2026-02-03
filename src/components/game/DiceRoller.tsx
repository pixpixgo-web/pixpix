import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiceRollerProps {
  onRoll?: (value: number) => void;
  disabled?: boolean;
}

export function DiceRoller({ onRoll, disabled }: DiceRollerProps) {
  const [value, setValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = useCallback(() => {
    if (isRolling || disabled) return;

    setIsRolling(true);
    setValue(null);

    // Animate through random numbers
    let count = 0;
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count >= 15) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 20) + 1;
        setValue(finalValue);
        setIsRolling(false);
        onRoll?.(finalValue);
      }
    }, 80);
  }, [isRolling, disabled, onRoll]);

  const getValueColor = (val: number | null) => {
    if (val === null) return '';
    if (val === 20) return 'text-companion-green';
    if (val === 1) return 'text-destructive';
    if (val >= 15) return 'text-primary';
    return '';
  };

  return (
    <div className="parchment rounded-lg p-4">
      <h3 className="font-medieval text-sm text-primary mb-3 flex items-center gap-2">
        <Dices className="w-4 h-4" />
        D20 Dice Roller
      </h3>
      
      <div className="flex items-center gap-4">
        <motion.div
          className={`
            w-16 h-16 rounded-lg gold-border flex items-center justify-center
            font-medieval text-2xl font-bold
            ${isRolling ? 'animate-shake' : ''}
            ${getValueColor(value)}
          `}
          animate={isRolling ? { rotate: [0, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.1, repeat: isRolling ? Infinity : 0 }}
        >
          <AnimatePresence mode="wait">
            {value !== null ? (
              <motion.span
                key={value}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={value === 20 ? 'gold-glow' : ''}
              >
                {value}
              </motion.span>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="text-muted-foreground"
              >
                ?
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex-1">
          <Button
            onClick={rollDice}
            disabled={isRolling || disabled}
            variant="outline"
            className="w-full gold-border hover:bg-primary/10"
          >
            {isRolling ? 'Rolling...' : 'Roll D20'}
          </Button>
          
          {value !== null && !isRolling && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-muted-foreground mt-2 text-center"
            >
              {value === 20 && '✨ Critical Success!'}
              {value === 1 && '💀 Critical Fail!'}
              {value >= 15 && value < 20 && '👍 Great roll!'}
              {value >= 10 && value < 15 && 'Solid roll'}
              {value > 1 && value < 10 && 'Could be better...'}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
