import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, BookOpen, Users, Sword, Shield, Sparkles, Trash2, Target, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGameState } from '@/hooks/useGameState';
import { useGameMaster } from '@/hooks/useGameMaster';
import { CharacterSheet } from '@/components/game/CharacterSheet';
import { PartyPanel } from '@/components/game/PartyPanel';
import { Journal } from '@/components/game/Journal';
import { DiceRoller } from '@/components/game/DiceRoller';
import { AdventureLog } from '@/components/game/AdventureLog';
import { ActionInput } from '@/components/game/ActionInput';
import { LoreDrawer } from '@/components/game/LoreDrawer';
import { StatsModal } from '@/components/game/StatsModal';
import { ClassSelection } from '@/components/game/ClassSelection';
import { LevelUpModal } from '@/components/game/LevelUpModal';
import { RevengeTracker } from '@/components/game/RevengeTracker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { CharacterClass, Character } from '@/types/game';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a verification link to complete signup." });
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="parchment rounded-xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <Sword className="w-12 h-12 mx-auto text-primary mb-4" />
        <h1 className="font-medieval text-3xl text-primary gold-glow mb-2">The Tavern Awaits</h1>
        <p className="text-muted-foreground">{isLogin ? 'Resume your adventure' : 'Begin your journey'}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="adventurer@realm.com" required className="bg-secondary/30" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="bg-secondary/30" />
        </div>
        <Button type="submit" disabled={loading} className="w-full gold-border bg-primary/10 hover:bg-primary/20">
          <LogIn className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : isLogin ? 'Enter the Tavern' : 'Create Character'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-4">
        {isLogin ? "New adventurer?" : "Already have a character?"}{' '}
        <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
          {isLogin ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </motion.div>
  );
}

function GameInterface({ userId }: { userId: string }) {
  const gameState = useGameState(userId);
  const { processAction, isProcessing, lastDiceRoll } = useGameMaster({
    ...gameState,
    refreshGameState: gameState.refreshGameState,
  });
  const { toast } = useToast();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isCreatingOrigin, setIsCreatingOrigin] = useState(false);

  // Auto-show level up modal when stat points are available
  useEffect(() => {
    if (gameState.character && gameState.character.stat_points > 0) {
      setShowLevelUp(true);
    }
  }, [gameState.character?.stat_points]);

  const handleStatAllocate = async (allocations: Partial<Character>) => {
    await gameState.updateCharacter(allocations);
  };

  const handleAction = async (action: string, isFreeAction: boolean) => {
    await processAction(action, isFreeAction);
  };

  const handleClassSelection = useCallback(async (name: string, selectedClass: CharacterClass, backstory: string) => {
    setIsCreatingOrigin(true);
    try {
      // First create the character
      await gameState.createCharacterWithClass(name, selectedClass, backstory);

      // Then generate the origin story
      const { data, error } = await supabase.functions.invoke('generate-origin', {
        body: {
          backstory,
          characterName: name,
          className: selectedClass.name,
          classCategory: selectedClass.category,
        },
      });

      if (error || data?.error) {
        console.error('Origin generation failed:', error || data?.error);
        // Fallback: keep tavern, no bonus items
        setIsCreatingOrigin(false);
        return;
      }

      // Apply origin results: zone, bonus items, skill boosts, intro narrative
      const updates: Partial<Character> = {};

      if (data.startingZone) {
        updates.current_zone = data.startingZone;
      }

      // Apply skill boosts
      if (data.skillBoosts && typeof data.skillBoosts === 'object') {
        for (const [key, value] of Object.entries(data.skillBoosts)) {
          if (typeof value === 'number') {
            const currentVal = (gameState.character as any)?.[key] || 0;
            (updates as any)[key] = currentVal + value;
          }
        }
      }

      // We need to wait for the character to be fully created first
      // Refresh to get the new character
      await gameState.refreshGameState();

      // Now apply zone + skill updates  
      if (Object.keys(updates).length > 0) {
        await gameState.updateCharacter(updates);
      }

      // Add bonus items
      if (data.bonusItems?.length) {
        for (const item of data.bonusItems) {
          await gameState.addInventoryItem({
            name: item.name,
            description: item.description || null,
            icon: item.icon || '📦',
            quantity: item.quantity || 1,
            item_type: item.item_type || 'misc',
          });
        }
      }

      // Add intro narrative as first message
      if (data.introNarrative) {
        await gameState.addMessage('assistant', data.introNarrative);
      }

      await gameState.refreshGameState();
    } catch (err) {
      console.error('Origin generation error:', err);
    } finally {
      setIsCreatingOrigin(false);
    }
  }, [gameState, toast]);

  const handleNewStory = async () => {
    await gameState.deleteCharacter();
    toast({ title: "New Story", description: "Your old tale fades. A new legend begins..." });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (gameState.isLoading || isCreatingOrigin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Sword className="w-12 h-12 text-primary" />
        </motion.div>
        {isCreatingOrigin && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-muted-foreground font-medieval text-lg"
          >
            The fates weave your origin...
          </motion.p>
        )}
      </div>
    );
  }

  if (gameState.needsClassSelection) {
    return <ClassSelection onComplete={handleClassSelection} />;
  }

  if (!gameState.character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load character...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 px-2">
        <h1 className="font-medieval text-2xl text-primary gold-glow flex items-center gap-2">
          <Sword className="w-6 h-6" />
          Old Greg's Tavern
        </h1>
        <div className="flex items-center gap-3">
          {/* Dice roll display */}
          {lastDiceRoll !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-8 h-8 rounded gold-border flex items-center justify-center font-medieval text-sm font-bold ${
                lastDiceRoll === 20 ? 'text-green-400 gold-glow' : lastDiceRoll === 1 ? 'text-destructive' : 'text-primary'
              }`}
            >
              {lastDiceRoll}
            </motion.div>
          )}

          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{gameState.character.name}</span>
            <Badge variant="outline" className="gold-border">{gameState.character.character_class}</Badge>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-destructive"><Sword className="w-3 h-3" /> {gameState.character.offense}</span>
            <span className="flex items-center gap-1 text-blue-400"><Shield className="w-3 h-3" /> {gameState.character.defense}</span>
            <span className="flex items-center gap-1 text-purple-400"><Sparkles className="w-3 h-3" /> {gameState.character.magic}</span>
          </div>

          {/* New Story Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="parchment border-primary/30">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-medieval text-primary">Start a New Story?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your current character, inventory, companions, and journal. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleNewStory} className="bg-destructive hover:bg-destructive/90">
                  Delete & Start Over
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1600px] mx-auto">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <CharacterSheet character={gameState.character} inventory={gameState.inventory} />
          <Button
            onClick={() => setShowStats(true)}
            variant="outline"
            className="gold-border w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            View Full Stats
          </Button>
        </div>

        {/* Center */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="parchment rounded-lg p-4 flex-1 min-h-[500px] flex flex-col">
            <AdventureLog messages={gameState.messages} isLoading={isProcessing} />
          </div>
          <ActionInput
            onSubmit={handleAction}
            stamina={gameState.character.stamina}
            maxStamina={gameState.character.max_stamina}
            mana={gameState.character.mana}
            maxMana={gameState.character.max_mana}
            currentZone={gameState.character.current_zone}
            disabled={isProcessing}
          />
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="party" className="h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="party" className="gap-1 text-xs"><Users className="w-3 h-3" /> Party</TabsTrigger>
              <TabsTrigger value="revenge" className="gap-1 text-xs"><Target className="w-3 h-3" /> Revenge</TabsTrigger>
              <TabsTrigger value="journal" className="gap-1 text-xs"><BookOpen className="w-3 h-3" /> Journal</TabsTrigger>
            </TabsList>
            <TabsContent value="party" className="mt-0">
              <PartyPanel companions={gameState.companions} />
            </TabsContent>
            <TabsContent value="revenge" className="mt-0">
              <RevengeTracker
                defeatedIds={gameState.character.betrayers_defeated || []}
                storyPhase={gameState.character.story_phase || 'the_fall'}
              />
            </TabsContent>
            <TabsContent value="journal" className="mt-0">
              <Journal entries={gameState.journal} />
            </TabsContent>
          </Tabs>

          {/* Stat Points Button */}
          {gameState.character.stat_points > 0 && (
            <Button
              onClick={() => setShowLevelUp(true)}
              className="w-full gold-border bg-primary/10 hover:bg-primary/20 animate-pulse"
            >
              <Star className="w-4 h-4 mr-2" />
              {gameState.character.stat_points} Stat Points Available
            </Button>
          )}
        </div>
      </div>

      <LoreDrawer character={gameState.character} inventory={gameState.inventory} companions={gameState.companions} />

      {/* Level Up Modal */}
      {gameState.character && (
        <>
          <LevelUpModal
            character={gameState.character}
            open={showLevelUp}
            onClose={() => setShowLevelUp(false)}
            onAllocate={handleStatAllocate}
          />
          <StatsModal
            character={gameState.character}
            open={showStats}
            onClose={() => setShowStats(false)}
          />
        </>
      )}
    </div>
  );
}

export default function Index() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Sword className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {userId ? (
        <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <GameInterface userId={userId} />
        </motion.div>
      ) : (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex items-center justify-center bg-background p-4">
          <AuthForm />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
