import { useState, KeyboardEvent } from 'react';
import { Send, Zap, MessageCircle, Sword, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ZONES, Zone } from '@/types/game';

interface ActionInputProps {
  onSubmit: (action: string, isFreeAction: boolean) => void;
  actionPoints: number;
  currentZone: string;
  disabled?: boolean;
}

// Keywords that indicate free actions
const FREE_ACTION_KEYWORDS = [
  'talk', 'speak', 'say', 'ask', 'tell', 'greet', 'chat',
  'look', 'observe', 'examine', 'inspect', 'check', 'see', 'watch',
  'inventory', 'items', 'bag', 'pouch',
  'defend', 'defensive', 'guard', 'block',
  'think', 'ponder', 'consider', 'remember',
];

function detectFreeAction(input: string): boolean {
  const lowerInput = input.toLowerCase().trim();
  
  // Check if action starts with a free action keyword
  for (const keyword of FREE_ACTION_KEYWORDS) {
    if (lowerInput.startsWith(keyword) || lowerInput.includes(`i ${keyword}`) || lowerInput.includes(`to ${keyword}`)) {
      return true;
    }
  }
  
  // Questions are usually free
  if (lowerInput.endsWith('?') && (lowerInput.includes('what') || lowerInput.includes('who') || lowerInput.includes('where') || lowerInput.includes('how'))) {
    return true;
  }
  
  return false;
}

export function ActionInput({ onSubmit, actionPoints, currentZone, disabled }: ActionInputProps) {
  const [input, setInput] = useState('');
  
  const isFreeAction = detectFreeAction(input);
  const zone: Zone = ZONES[currentZone] || ZONES.tavern;

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    if (!isFreeAction && actionPoints <= 0) return;
    
    onSubmit(input.trim(), isFreeAction);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = input.trim() && !disabled && (isFreeAction || actionPoints > 0);

  return (
    <div className="parchment rounded-lg p-4 space-y-3">
      {/* Zone & AP Display */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{zone.name}</span>
          {zone.type === 'danger' && (
            <Badge variant="destructive" className="text-xs">Danger</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span>
            {actionPoints > 0 
              ? `${actionPoints} AP`
              : <span className="text-destructive">No AP!</span>
            }
          </span>
        </div>
      </div>

      {/* Action Type Indicator */}
      {input.trim() && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 text-sm"
        >
          {isFreeAction ? (
            <>
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Free Action</span>
              <span className="text-muted-foreground text-xs">(No AP cost)</span>
            </>
          ) : (
            <>
              <Sword className="w-4 h-4 text-primary" />
              <span className="text-primary">Action</span>
              <span className="text-muted-foreground text-xs">(-1 AP)</span>
            </>
          )}
        </motion.div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={actionPoints > 0 ? "What do you do?" : "No AP! Rest or use free actions..."}
          disabled={disabled}
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

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <span className="text-green-500">Free:</span> Talk, look, check inventory, defend
        </p>
        <p>
          <span className="text-primary">Costs AP:</span> Attack, cast spells, travel, search
        </p>
      </div>
    </div>
  );
}
