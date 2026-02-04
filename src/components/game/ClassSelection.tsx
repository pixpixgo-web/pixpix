import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CHARACTER_CLASSES, CharacterClass } from '@/types/game';

interface ClassSelectionProps {
  onComplete: (name: string, characterClass: CharacterClass) => void;
}

export function ClassSelection({ onComplete }: ClassSelectionProps) {
  const [step, setStep] = useState<'name' | 'class'>('name');
  const [characterName, setCharacterName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterName.trim()) {
      setStep('class');
    }
  };

  const handleClassSelect = (cls: CharacterClass) => {
    setSelectedClass(cls);
  };

  const handleConfirm = () => {
    if (selectedClass && characterName.trim()) {
      onComplete(characterName.trim(), selectedClass);
    }
  };

  const StatBar = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      <span className="w-6">{icon}</span>
      <span className="text-xs w-16 text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          className="h-full bg-primary"
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-xs w-6 text-right">{value}</span>
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
            <motion.div
              key="name"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-8">
                <Sword className="w-12 h-12 mx-auto text-primary mb-4" />
                <h1 className="font-medieval text-3xl text-primary gold-glow mb-2">
                  Begin Your Legend
                </h1>
                <p className="text-muted-foreground">
                  What shall the bards call you?
                </p>
              </div>

              <form onSubmit={handleNameSubmit} className="space-y-6 max-w-sm mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-center block">Character Name</Label>
                  <Input
                    id="name"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter your name..."
                    className="bg-secondary/30 text-center text-lg"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!characterName.trim()}
                  className="w-full gold-border"
                >
                  Choose Your Path
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="class"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <h1 className="font-medieval text-2xl text-primary gold-glow mb-2">
                  Choose Your Class
                </h1>
                <p className="text-muted-foreground text-sm">
                  Select your destiny, <span className="text-primary">{characterName}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class List */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {CHARACTER_CLASSES.map((cls) => (
                      <motion.button
                        key={cls.id}
                        onClick={() => handleClassSelect(cls)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedClass?.id === cls.id
                            ? 'gold-border bg-primary/20'
                            : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cls.icon}</span>
                          <div>
                            <p className="font-medieval text-sm">{cls.name}</p>
                            <p className="text-xs text-muted-foreground">{cls.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>

                {/* Class Details */}
                <div className="bg-secondary/20 rounded-lg p-4">
                  {selectedClass ? (
                    <motion.div
                      key={selectedClass.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-center mb-4">
                        <span className="text-5xl">{selectedClass.icon}</span>
                        <h2 className="font-medieval text-xl text-primary mt-2">
                          {selectedClass.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedClass.description}
                        </p>
                      </div>

                      <div className="space-y-3 mb-4">
                        <StatBar
                          label="Offense"
                          value={selectedClass.offense}
                          icon={<Sword className="w-4 h-4 text-destructive" />}
                        />
                        <StatBar
                          label="Defense"
                          value={selectedClass.defense}
                          icon={<Shield className="w-4 h-4 text-blue-400" />}
                        />
                        <StatBar
                          label="Magic"
                          value={selectedClass.magic}
                          icon={<Sparkles className="w-4 h-4 text-purple-400" />}
                        />
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
                      </div>

                      <Button
                        onClick={handleConfirm}
                        className="w-full mt-6 gold-border"
                      >
                        Begin as {selectedClass.name}
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p className="text-center">
                        Select a class to view details
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setStep('name')}
                className="mt-4 text-muted-foreground"
              >
                ← Back to name
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
