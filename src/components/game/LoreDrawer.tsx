import { useState } from 'react';
import { HelpCircle, Send, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Character, InventoryItem, Companion } from '@/types/game';
import ReactMarkdown from 'react-markdown';

interface LoreDrawerProps {
  character: Character;
  inventory: InventoryItem[];
  companions: Companion[];
}

interface LoreMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
}

export function LoreDrawer({ character, inventory, companions }: LoreDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<LoreMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || isLoading) return;

    const newQuestion: LoreMessage = {
      id: crypto.randomUUID(),
      type: 'question',
      content: question.trim(),
    };

    setMessages(prev => [...prev, newQuestion]);
    setQuestion('');
    setIsLoading(true);

    try {
      const gameContext = {
        character: {
          name: character.name,
          characterClass: character.character_class,
          hp: character.hp,
          maxHp: character.max_hp,
          gold: character.gold,
          offense: character.offense,
          defense: character.defense,
          magic: character.magic,
          currentZone: character.current_zone,
        },
        inventory: inventory.map(i => ({
          name: i.name,
          description: i.description,
          quantity: i.quantity,
        })),
        companions: companions.filter(c => c.is_active).map(c => ({
          name: c.name,
          personality: c.personality,
        })),
      };

      const { data, error } = await supabase.functions.invoke('lore-query', {
        body: { question: newQuestion.content, gameContext },
      });

      if (error) throw new Error(error.message);

      const newAnswer: LoreMessage = {
        id: crypto.randomUUID(),
        type: 'answer',
        content: data.answer || data.error || 'No response received.',
      };

      setMessages(prev => [...prev, newAnswer]);
    } catch (error) {
      const errorAnswer: LoreMessage = {
        id: crypto.randomUUID(),
        type: 'answer',
        content: 'The mystical connection falters... Please try again.',
      };
      setMessages(prev => [...prev, errorAnswer]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-primary/20 gold-border flex items-center justify-center hover:bg-primary/30 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Lore & Utility (Free)"
      >
        <HelpCircle className="w-6 h-6 text-primary" />
      </motion.button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md parchment border-l border-primary/30 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="font-medieval text-lg text-primary">Lore & Utility</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Info Banner */}
              <div className="px-4 py-2 bg-primary/10 text-sm text-muted-foreground">
                <span className="text-primary font-medium">Free queries</span> - No AP cost. Ask about items, strategy, or lore!
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                    <p className="font-story">Ask the ancient tome...</p>
                    <p className="text-sm mt-2">
                      "Which weapon should I use?"<br />
                      "What are my class abilities?"<br />
                      "How does trust affect companions?"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg ${
                          msg.type === 'question'
                            ? 'bg-primary/10 ml-8 text-right'
                            : 'bg-secondary/50 mr-8'
                        }`}
                      >
                        {msg.type === 'answer' ? (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="bg-secondary/50 mr-8 p-3 rounded-lg">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder="Ask about the game..."
                    disabled={isLoading}
                    className="bg-secondary/30"
                  />
                  <Button
                    onClick={handleAsk}
                    disabled={!question.trim() || isLoading}
                    className="gold-border"
                    variant="outline"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
