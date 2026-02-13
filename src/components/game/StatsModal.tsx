import { Character } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sword, Sparkles, MessageSquare, Shield } from 'lucide-react';

interface StatsModalProps {
  character: Character;
  open: boolean;
  onClose: () => void;
}

const SKILL_GROUPS = {
  physical: {
    label: 'Physical',
    icon: <Sword className="w-4 h-4" />,
    skills: [
      { key: 'brawling', label: 'Brawling' },
      { key: 'one_handed', label: 'One-Handed' },
      { key: 'two_handed', label: 'Two-Handed' },
      { key: 'acrobatics', label: 'Acrobatics' },
      { key: 'climbing', label: 'Climbing' },
      { key: 'stealth', label: 'Stealth' },
      { key: 'sleight_of_hand', label: 'Sleight of Hand' },
      { key: 'aim', label: 'Aim' },
    ],
  },
  magical: {
    label: 'Magical',
    icon: <Sparkles className="w-4 h-4" />,
    skills: [
      { key: 'bloodmancy', label: 'Bloodmancy' },
      { key: 'necromancy', label: 'Necromancy' },
      { key: 'soulbinding', label: 'Soulbinding' },
      { key: 'destruction', label: 'Destruction' },
      { key: 'alteration', label: 'Alteration' },
      { key: 'illusion', label: 'Illusion' },
      { key: 'regeneration', label: 'Regeneration' },
    ],
  },
  social: {
    label: 'Social',
    icon: <MessageSquare className="w-4 h-4" />,
    skills: [
      { key: 'persuasion', label: 'Persuasion' },
      { key: 'intimidation', label: 'Intimidation' },
      { key: 'seduction', label: 'Seduction' },
      { key: 'investigation', label: 'Investigation' },
      { key: 'bartering', label: 'Bartering' },
      { key: 'beastmastery', label: 'Beastmastery' },
    ],
  },
  reputation: {
    label: 'Reputation',
    icon: <Shield className="w-4 h-4" />,
    skills: [
      { key: 'bravery', label: 'Bravery' },
      { key: 'mercy', label: 'Mercy' },
      { key: 'honor', label: 'Honor' },
      { key: 'infamy', label: 'Infamy' },
      { key: 'justice', label: 'Justice' },
      { key: 'loyalty', label: 'Loyalty' },
      { key: 'malice', label: 'Malice' },
    ],
  },
} as const;

function SkillRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}/100</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

export function StatsModal({ character, open, onClose }: StatsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="parchment border-primary/30 max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-medieval text-primary">
            {character.name} — Full Stats
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="physical">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(SKILL_GROUPS).map(([key, group]) => (
              <TabsTrigger key={key} value={key} className="gap-1 text-xs">
                {group.icon} {group.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(SKILL_GROUPS).map(([key, group]) => (
            <TabsContent key={key} value={key} className="space-y-3 mt-4">
              {group.skills.map((skill) => (
                <SkillRow
                  key={skill.key}
                  label={skill.label}
                  value={(character as any)[skill.key] ?? 0}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
