import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Sparkles, ChevronRight, Flame, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CHARACTER_CLASSES, CharacterClass } from '@/types/game';

interface ClassSelectionProps {
  onComplete: (name: string, characterClass: CharacterClass, backstory: string) => void;
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  exotic: { label: 'Exotic/Monster', color: 'text-purple-400' },
  professional: { label: 'Professional', color: 'text-blue-400' },
  hybrid_specialized: { label: 'Specialized/Hybrid', color: 'text-green-400' },
  final_challenge: { label: 'Final Challenge', color: 'text-destructive' },
};

export function ClassSelection({ onComplete }: ClassSelectionProps) {
  const [step, setStep] = useState<'name' | 'backstory' | 'class'>('name');
  const [characterName, setCharacterName] = useState('');
  const [backstory, setBackstory] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterName.trim()) setStep('backstory');
  };

  const handleBackstorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('class');
  };

  const handleConfirm = () => {
    if (selectedClass && characterName.trim()) {
      onComplete(characterName.trim(), selectedClass, backstory.trim());
    }
  };

  const filteredClasses = tierFilter
    ? CHARACTER_CLASSES.filter(c => c.tier === tierFilter)
    : CHARACTER_CLASSES;

  const StatBar = ({ label, value, max, icon }: { label: string; value: number; max: number; icon: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      <span className="w-6">{icon}</span>
      <span className="text-xs w-16 text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          className="h-full bg-primary"
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-xs w-8 text-right">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="parchment rounded-xl p-6 max-w-2xl w-full"
      >
        <AnimatePresence mode="wait">
          {step === 'name' ? (
            <motion.div key="name" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="text-center mb-8">
                <Sword className="w-12 h-12 mx-auto text-primary mb-4" />
                <h1 className="font-medieval text-3xl text-primary gold-glow mb-2">Begin Your Legend</h1>
                <p className="text-muted-foreground">What shall the bards call you?</p>
              </div>
              <form onSubmit={handleNameSubmit} className="space-y-6 max-w-sm mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-center block">Character Name</Label>
                  <Input id="name" value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Enter your name..." className="bg-secondary/30 text-center text-lg" autoFocus />
                </div>
                <Button type="submit" disabled={!characterName.trim()} className="w-full gold-border">
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </motion.div>
          ) : step === 'backstory' ? (
            <motion.div key="backstory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-6">
                <h1 className="font-medieval text-2xl text-primary gold-glow mb-2">Your Story</h1>
                <p className="text-muted-foreground text-sm">
                  Tell us your past, <span className="text-primary">{characterName}</span>. This shapes your starting items and knowledge.
                </p>
              </div>
              <form onSubmit={handleBackstorySubmit} className="space-y-4 max-w-md mx-auto">
                <Textarea
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="A knight's child raised in the barracks... A mage's apprentice who ran away... A street urchin with a stolen spellbook..."
                  className="bg-secondary/30 min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Your backstory determines starting items and spells — a knight's child gets good gear but few spells, a mage's child gets magical knowledge, etc.
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setStep('name')} className="flex-1">← Back</Button>
                  <Button type="submit" className="flex-1 gold-border">
                    Choose Class <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="class" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-4">
                <h1 className="font-medieval text-2xl text-primary gold-glow mb-2">Choose Your Class</h1>
                <p className="text-muted-foreground text-sm">
                  Select your destiny, <span className="text-primary">{characterName}</span>
                </p>
              </div>

              {/* Tier filters */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge
                  variant={tierFilter === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setTierFilter(null)}
                >
                  All
                </Badge>
                {Object.entries(TIER_LABELS).map(([key, { label }]) => (
                  <Badge
                    key={key}
                    variant={tierFilter === key ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setTierFilter(key)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {filteredClasses.map((cls) => (
                      <motion.button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedClass?.id === cls.id ? 'gold-border bg-primary/20' : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cls.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medieval text-sm">{cls.name}</p>
                              {cls.tier === 'final_challenge' && (
                                <Badge variant="destructive" className="text-[10px] py-0">Hard</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{cls.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>

                <div className="bg-secondary/20 rounded-lg p-4">
                  {selectedClass ? (
                    <motion.div key={selectedClass.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="text-center mb-4">
                        <span className="text-5xl">{selectedClass.icon}</span>
                        <h2 className="font-medieval text-xl text-primary mt-2">{selectedClass.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedClass.description}</p>
                        <Badge variant="outline" className={`mt-1 text-xs ${TIER_LABELS[selectedClass.tier]?.color || ''}`}>
                          {TIER_LABELS[selectedClass.tier]?.label}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <StatBar label="Offense" value={selectedClass.offense} max={10} icon={<Sword className="w-4 h-4 text-destructive" />} />
                        <StatBar label="Defense" value={selectedClass.defense} max={10} icon={<Shield className="w-4 h-4 text-blue-400" />} />
                        <StatBar label="Magic" value={selectedClass.magic} max={10} icon={<Sparkles className="w-4 h-4 text-purple-400" />} />
                        <StatBar label="Stamina" value={selectedClass.maxStamina} max={200} icon={<Flame className="w-4 h-4 text-gold-coin" />} />
                        <StatBar label="Mana" value={selectedClass.maxMana} max={200} icon={<Droplets className="w-4 h-4 text-magic-blue" />} />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <span className="text-green-400">✓</span>
                          <span className="text-muted-foreground">{selectedClass.primaryStrength}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-destructive">✗</span>
                          <span className="text-muted-foreground">{selectedClass.majorWeakness}</span>
                        </div>
                        {selectedClass.passive && (
                          <div className="flex gap-2">
                            <span className="text-purple-400">★</span>
                            <span className="text-muted-foreground text-xs">{selectedClass.passive}</span>
                          </div>
                        )}
                      </div>

                      <Button onClick={handleConfirm} className="w-full mt-6 gold-border">
                        Begin as {selectedClass.name}
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p className="text-center">Select a class to view details</p>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="ghost" onClick={() => setStep('backstory')} className="mt-4 text-muted-foreground">
                ← Back to backstory
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
