import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Check, ChevronUp, Zap, RefreshCw } from 'lucide-react';
import { useAIProvider, type AIProvider } from '@/hooks/useAIProvider';
import { Button } from '@/components/ui/button';

const PROVIDER_INFO: Record<AIProvider, { label: string; icon: string; color: string }> = {
  lovable: { label: 'Lovable AI', icon: '💜', color: 'text-purple-400' },
  gemini: { label: 'Google Gemini', icon: '🔵', color: 'text-blue-400' },
  openrouter: { label: 'OpenRouter', icon: '🟢', color: 'text-green-400' },
};

export function AIStatusButton() {
  const { availableProviders, preferredProvider, activeProvider, setPreferredProvider, isLoading, refresh } = useAIProvider();
  const [isOpen, setIsOpen] = useState(false);

  const displayProvider = activeProvider || preferredProvider || availableProviders[0];
  const info = displayProvider ? PROVIDER_INFO[displayProvider] : null;

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/80 border border-border/50 hover:bg-secondary transition-colors text-xs"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="AI Provider Status"
      >
        <Zap className="w-3 h-3 text-primary" />
        <span className={info?.color || 'text-muted-foreground'}>
          {isLoading ? '...' : info?.label || 'No AI'}
        </span>
        <ChevronUp className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? '' : 'rotate-180'}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-14 left-4 z-50 w-64 parchment border border-primary/30 rounded-lg p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medieval text-sm text-primary flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> AI Provider
                </h3>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={refresh}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-1">
                {/* Auto option */}
                <button
                  onClick={() => setPreferredProvider(null)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                    !preferredProvider ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  <span>⚡ Auto (fallback chain)</span>
                  {!preferredProvider && <Check className="w-3 h-3" />}
                </button>

                {/* Individual providers */}
                {(['lovable', 'gemini', 'openrouter'] as AIProvider[]).map(p => {
                  const pInfo = PROVIDER_INFO[p];
                  const available = availableProviders.includes(p);
                  const isActive = activeProvider === p;
                  const isPreferred = preferredProvider === p;

                  return (
                    <button
                      key={p}
                      onClick={() => available && setPreferredProvider(p)}
                      disabled={!available}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                        isPreferred ? 'bg-primary/20 text-primary' :
                        available ? 'hover:bg-secondary/50 text-foreground' :
                        'text-muted-foreground/40 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{pInfo.icon}</span>
                        <span>{pInfo.label}</span>
                        {!available && <span className="text-[10px]">(no key)</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-400" title="Last used" />}
                        {isPreferred && <Check className="w-3 h-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-muted-foreground/60">
                Auto mode tries each key in order until one works.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
