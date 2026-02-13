import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Sparkles, ChevronRight, Flame, Droplets, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CHARACTER_CLASSES, CharacterClass } from '@/types/game';

interface ClassSelectionProps {
  onComplete: (name: string, characterClass: CharacterClass, backstory: string, description: string) => void;
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  exotic: { label: 'Exotic/Monster', color: 'text-purple-400' },
  professional: { label: 'Professional', color: 'text-blue-400' },
  hybrid_specialized: { label: 'Specialized/Hybrid', color: 'text-green-400' },
  final_challenge: { label: 'Final Challenge', color: 'text-destructive' },
};

export function ClassSelection({ onComplete }: ClassSelectionProps) {
  const [step, setStep] = useState<'name' | 'description' | 'backstory' | 'class'>('name');
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [backstory, setBackstory] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedClass, setGeneratedClass] = useState<CharacterClass | null>(null);
  const { toast } = useToast();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterName.trim()) setStep('description');
  };

  const handleDescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterDescription.trim()) setStep('backstory');
  };

  const handleBackstorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('class');
  };

  const handleConfirm = () => {
    if (selectedClass && characterName.trim()) {
      onComplete(characterName.trim(), selectedClass, backstory.trim(), characterDescription.trim());
    }
  };

  const handleGenerateClass = async () => {
    if (!customDescription.trim() || customDescription.trim().length < 5) {
      toast({ title: "Too short", description: "Describe your class in more detail.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedClass(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-class', {
        body: { description: customDescription.trim() },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      // Convert to CharacterClass shape
      const custom: CharacterClass = {
        id: data.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        offense: data.offense,
        defense: data.defense,
        magic: data.magic,
        primaryStrength: data.primaryStrength,
        majorWeakness: data.majorWeakness,
        category: data.category,
        tier: 'professional',
        maxMana: data.maxMana,
        maxStamina: data.maxStamina,
        passive: data.passive,
        defaultStats: data.defaultStats || {},
      };

      setGeneratedClass(custom);
      setSelectedClass(custom);
      toast({ title: `${custom.icon} ${custom.name}`, description: "Custom class generated! Review the stats below." });
    } catch (err) {
      console.error(err);
      toast({ title: "Generation failed", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
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

  const ClassDetailPanel = ({ cls }: { cls: CharacterClass }) => (
    <motion.div key={cls.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-4">
        <span className="text-5xl">{cls.icon}</span>
        <h2 className="font-medieval text-xl text-primary mt-2">{cls.name}</h2>
        <p className="text-sm text-muted-foreground">{cls.description}</p>
        {cls.id.startsWith('custom-') ? (
          <Badge variant="outline" className="mt-1 text-xs text-primary">✨ Custom</Badge>
        ) : (
          <Badge variant="outline" className={`mt-1 text-xs ${TIER_LABELS[cls.tier]?.color || ''}`}>
            {TIER_LABELS[cls.tier]?.label}
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <StatBar label="Offense" value={cls.offense} max={100} icon={<Sword className="w-4 h-4 text-destructive" />} />
        <StatBar label="Defense" value={cls.defense} max={100} icon={<Shield className="w-4 h-4 text-blue-400" />} />
        <StatBar label="Magic" value={cls.magic} max={100} icon={<Sparkles className="w-4 h-4 text-purple-400" />} />
        <StatBar label="Stamina" value={cls.maxStamina} max={200} icon={<Flame className="w-4 h-4 text-gold-coin" />} />
        <StatBar label="Mana" value={cls.maxMana} max={200} icon={<Droplets className="w-4 h-4 text-magic-blue" />} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="text-green-400">✓</span>
          <span className="text-muted-foreground">{cls.primaryStrength}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-destructive">✗</span>
          <span className="text-muted-foreground">{cls.majorWeakness}</span>
        </div>
        {cls.passive && (
          <div className="flex gap-2">
            <span className="text-purple-400">★</span>
            <span className="text-muted-foreground text-xs">{cls.passive}</span>
          </div>
        )}
      </div>

      <Button onClick={handleConfirm} className="w-full mt-6 gold-border">
        Begin as {cls.name}
      </Button>
    </motion.div>
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
                  <Input id="name" value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Enter your name..." className="bg-secondary/30 text-center text-lg" autoFocus maxLength={30} />
                </div>
                <Button type="submit" disabled={!characterName.trim()} className="w-full gold-border">
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </motion.div>
          ) : step === 'description' ? (
            <motion.div key="description" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-6">
                <h1 className="font-medieval text-2xl text-primary gold-glow mb-2">Your Appearance</h1>
                <p className="text-muted-foreground text-sm">
                  Describe what <span className="text-primary">{characterName}</span> looks like.
                </p>
              </div>
              <form onSubmit={handleDescriptionSubmit} className="space-y-4 max-w-md mx-auto">
                <Textarea
                  value={characterDescription}
                  onChange={(e) => setCharacterDescription(e.target.value)}
                  placeholder="Tall with silver hair and piercing blue eyes... Scarred face with a mysterious tattoo... Short and nimble with wild red hair..."
                  className="bg-secondary/30 min-h-[120px]"
                  maxLength={300}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  This description will be used to generate your character portrait.
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" type="button" onClick={() => setStep('name')} className="flex-1">← Back</Button>
                  <Button type="submit" className="flex-1 gold-border" disabled={!characterDescription.trim()}>
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
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
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Your backstory determines starting items and spells — a knight's child gets good gear but few spells, a mage's child gets magical knowledge, etc.
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setStep('description')} className="flex-1">← Back</Button>
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

              {/* Tier filters + Custom toggle */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge
                  variant={!showCustom && tierFilter === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => { setTierFilter(null); setShowCustom(false); }}
                >
                  All
                </Badge>
                {Object.entries(TIER_LABELS).map(([key, { label }]) => (
                  <Badge
                    key={key}
                    variant={!showCustom && tierFilter === key ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => { setTierFilter(key); setShowCustom(false); }}
                  >
                    {label}
                  </Badge>
                ))}
                <Badge
                  variant={showCustom ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setShowCustom(true)}
                >
                  <Wand2 className="w-3 h-3 mr-1" /> Custom
                </Badge>
              </div>

              {showCustom ? (
                /* Custom class creator */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/20 rounded-lg space-y-3">
                      <h3 className="font-medieval text-primary text-sm flex items-center gap-2">
                        <Wand2 className="w-4 h-4" /> Describe Your Class
                      </h3>
                      <Textarea
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="A shadow weaver who manipulates darkness to create weapons and armor from pure void energy. Drains life force from enemies to fuel spells..."
                        className="bg-secondary/30 min-h-[140px]"
                        maxLength={500}
                        disabled={isGenerating}
                      />
                      <p className="text-xs text-muted-foreground">
                        Describe playstyle, theme, strengths and weaknesses. The AI will generate balanced stats.
                      </p>
                      <Button
                        onClick={handleGenerateClass}
                        disabled={isGenerating || customDescription.trim().length < 5}
                        className="w-full gold-border"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Forging Class...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Class
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-secondary/20 rounded-lg p-4">
                    {generatedClass ? (
                      <ClassDetailPanel cls={generatedClass} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p className="text-center text-sm">
                          {isGenerating ? (
                            <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                              The mystic forces shape your destiny...
                            </motion.span>
                          ) : (
                            "Describe your class and click Generate"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Standard class list */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {filteredClasses.map((cls) => (
                        <motion.button
                          key={cls.id}
                          onClick={() => { setSelectedClass(cls); setGeneratedClass(null); }}
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
                    {selectedClass && !selectedClass.id.startsWith('custom-') ? (
                      <ClassDetailPanel cls={selectedClass} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p className="text-center">Select a class to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
