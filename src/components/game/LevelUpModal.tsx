import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Minus, Check } from 'lucide-react';
import { Character, SKILLS, SkillDef } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface LevelUpModalProps {
  character: Character;
  open: boolean;
  onClose: () => void;
  onAllocate: (allocations: Partial<Character>) => Promise<void>;
}

export function LevelUpModal({ character, open, onClose, onAllocate }: LevelUpModalProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remaining = character.stat_points - totalAllocated;

  const handleAdd = (key: string) => {
    if (remaining <= 0) return;
    const currentVal = (character[key as keyof Character] as number) + (allocations[key] || 0);
    if (currentVal >= 100) return;
    setAllocations(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const handleRemove = (key: string) => {
    if (!allocations[key] || allocations[key] <= 0) return;
    setAllocations(prev => ({ ...prev, [key]: prev[key] - 1 }));
  };

  const handleSubmit = async () => {
    if (totalAllocated === 0) return;
    setIsSubmitting(true);
    const updates: Record<string, number> = { stat_points: remaining };
    for (const [key, val] of Object.entries(allocations)) {
      if (val > 0) {
        updates[key] = ((character[key as keyof Character] as number) + val);
      }
    }
    await onAllocate(updates as unknown as Partial<Character>);
    setAllocations({});
    setIsSubmitting(false);
    if (remaining - totalAllocated <= 0) onClose();
  };

  const categories = ['physical', 'magical', 'social', 'reputation'] as const;
  const categoryLabels = { physical: '⚔️ Physical', magical: '✨ Magical', social: '🗣️ Social', reputation: '📜 Reputation' };
  const categoryColors = { physical: 'text-destructive', magical: 'text-magic-blue', social: 'text-gold-coin', reputation: 'text-primary' };

  const renderSkill = (skill: SkillDef) => {
    const current = character[skill.key] as number;
    const added = allocations[skill.key as string] || 0;
    const total = current + added;

    return (
      <div key={skill.key as string} className="flex items-center justify-between py-1.5 px-2 rounded bg-secondary/20 hover:bg-secondary/40 transition-colors">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{skill.name}</span>
          <p className="text-xs text-muted-foreground truncate">{skill.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleRemove(skill.key as string)} disabled={!added}>
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-10 text-center font-medieval text-sm">
            {current}
            {added > 0 && <span className="text-green-400">+{added}</span>}
          </span>
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleAdd(skill.key as string)} disabled={remaining <= 0 || total >= 100}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="parchment border-primary/30 max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-medieval text-primary flex items-center gap-2">
            <Star className="w-5 h-5" /> Allocate Stat Points
          </DialogTitle>
          <DialogDescription>
            You have <Badge variant="outline" className="gold-border mx-1">{remaining}</Badge> points to distribute.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="physical" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 mb-2">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs">{categoryLabels[cat]}</TabsTrigger>
            ))}
          </TabsList>
          {categories.map(cat => (
            <TabsContent key={cat} value={cat} className="flex-1 overflow-y-auto space-y-1 mt-0">
              {SKILLS.filter(s => s.category === cat).map(renderSkill)}
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t border-primary/10">
          <Button variant="ghost" onClick={onClose}>Later</Button>
          <Button onClick={handleSubmit} disabled={totalAllocated === 0 || isSubmitting} className="gold-border bg-primary/10 hover:bg-primary/20">
            <Check className="w-4 h-4 mr-1" /> Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
