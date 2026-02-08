import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, BookOpen, Users, Sword, Shield, Sparkles, Trash2 } from 'lucide-react';
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
import { RestButton } from '@/components/game/RestButton';
import { ClassSelection } from '@/components/game/ClassSelection';
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
import { ZONES, CharacterClass } from '@/types/game';

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

  const handleAction = async (action: string, isFreeAction: boolean) => {
    await processAction(action, isFreeAction);
  };

  const handleRest = async (isAmbushed: boolean) => {
    if (!gameState.character) return;

    const zone = ZONES[gameState.character.current_zone] || ZONES.tavern;

    if (isAmbushed) {
      toast({ title: "Ambush!", description: "You were attacked while resting!", variant: "destructive" });
      await processAction("I was ambushed while trying to rest!", false);
    } else {
      const staminaRecovered = Math.ceil((gameState.character.max_stamina * zone.restRecovery) / 100);
      const manaRecovered = Math.ceil((gameState.character.max_mana * zone.restRecovery) / 100);
      await gameState.updateCharacter({
        stamina: Math.min(gameState.character.max_stamina, gameState.character.stamina + staminaRecovered),
        mana: Math.min(gameState.character.max_mana, gameState.character.mana + manaRecovered),
      });
      toast({ title: "Rested", description: `Recovered +${staminaRecovered} Stamina, +${manaRecovered} Mana.` });
    }
  };

  const handleClassSelection = async (name: string, selectedClass: CharacterClass, backstory: string) => {
    await gameState.createCharacterWithClass(name, selectedClass, backstory);
  };

  const handleNewStory = async () => {
    await gameState.deleteCharacter();
    toast({ title: "New Story", description: "Your old tale fades. A new legend begins..." });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (gameState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Sword className="w-12 h-12 text-primary" />
        </motion.div>
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
          <RestButton character={gameState.character} onRest={handleRest} disabled={isProcessing} />
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
        <div className="lg:col-span-3">
          <Tabs defaultValue="party" className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="party" className="gap-2"><Users className="w-4 h-4" /> Party</TabsTrigger>
              <TabsTrigger value="journal" className="gap-2"><BookOpen className="w-4 h-4" /> Journal</TabsTrigger>
            </TabsList>
            <TabsContent value="party" className="mt-0">
              <PartyPanel companions={gameState.companions} />
            </TabsContent>
            <TabsContent value="journal" className="mt-0">
              <Journal entries={gameState.journal} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <LoreDrawer character={gameState.character} inventory={gameState.inventory} companions={gameState.companions} />
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
