import { useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types/game';
import { Scroll, User, Crown } from 'lucide-react';

interface AdventureLogProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function AdventureLog({ messages, isLoading }: AdventureLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Only show the 4 most recent messages (2 exchanges) in the log
  const visibleMessages = useMemo(() => {
    return messages.slice(-4);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-medieval text-sm text-primary mb-3 flex items-center gap-2 px-1">
        <Scroll className="w-4 h-4" />
        Adventure Log
        {messages.length > 4 && (
          <span className="text-xs text-muted-foreground font-normal ml-auto">
            (showing recent — full history in Journal)
          </span>
        )}
      </h3>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
            <Crown className="w-12 h-12 mb-4 text-primary/50" />
            <p className="text-center font-story text-lg">
              Welcome, brave adventurer.
            </p>
            <p className="text-center text-sm mt-2">
              Type your first action to begin your quest...
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {visibleMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`log-entry ${
                message.role === 'user' ? 'log-entry-user' : 'log-entry-dm'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === 'user' ? (
                  <User className="w-4 h-4 mt-1 text-magic-blue shrink-0" />
                ) : (
                  <Crown className="w-4 h-4 mt-1 text-primary shrink-0" />
                )}
                <div className="flex-1 prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-sm font-story leading-relaxed mb-2 last:mb-0">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-primary font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="text-muted-foreground italic">{children}</em>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="log-entry log-entry-dm">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary animate-pulse" />
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
