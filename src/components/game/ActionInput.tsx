import { useState, KeyboardEvent } from 'react';
import { Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

interface ActionInputProps {
  onSubmit: (action: string) => void;
  actionPoints: number;
  disabled?: boolean;
}

export function ActionInput({ onSubmit, actionPoints, disabled }: ActionInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim() || disabled || actionPoints <= 0) return;
    onSubmit(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = input.trim() && !disabled && actionPoints > 0;

  return (
    <div className="parchment rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
        <Zap className="w-4 h-4 text-primary" />
        <span>
          {actionPoints > 0 
            ? `${actionPoints} action point${actionPoints !== 1 ? 's' : ''} remaining`
            : 'No action points! Rest to recover.'
          }
        </span>
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={actionPoints > 0 ? "What do you do?" : "You're exhausted..."}
          disabled={disabled || actionPoints <= 0}
          className="min-h-[60px] max-h-[120px] resize-none bg-secondary/30 border-border/50 focus:border-primary/50"
        />
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-full px-4 gold-border hover:bg-primary/20"
            variant="outline"
          >
            <Send className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send • Each action costs 1 AP
      </p>
    </div>
  );
}
