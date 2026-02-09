import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AIProvider = 'lovable' | 'gemini' | 'openrouter';

interface AIProviderState {
  availableProviders: AIProvider[];
  preferredProvider: AIProvider | null;
  activeProvider: AIProvider | null; // last provider that actually worked
  setPreferredProvider: (p: AIProvider | null) => void;
  setActiveProvider: (p: AIProvider) => void;
  isLoading: boolean;
  refresh: () => void;
}

const AIProviderContext = createContext<AIProviderState>({
  availableProviders: [],
  preferredProvider: null,
  activeProvider: null,
  setPreferredProvider: () => {},
  setActiveProvider: () => {},
  isLoading: true,
  refresh: () => {},
});

export function useAIProvider() {
  return useContext(AIProviderContext);
}

export function AIProviderProvider({ children }: { children: React.ReactNode }) {
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [preferredProvider, setPreferredProv] = useState<AIProvider | null>(() => {
    const saved = localStorage.getItem('preferredAIProvider');
    return saved as AIProvider | null;
  });
  const [activeProvider, setActiveProvider] = useState<AIProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-status');
      if (!error && data?.providers) {
        setAvailableProviders(data.providers);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setPreferredProvider = useCallback((p: AIProvider | null) => {
    setPreferredProv(p);
    if (p) {
      localStorage.setItem('preferredAIProvider', p);
    } else {
      localStorage.removeItem('preferredAIProvider');
    }
  }, []);

  return (
    <AIProviderContext.Provider value={{
      availableProviders,
      preferredProvider,
      activeProvider,
      setPreferredProvider,
      setActiveProvider,
      isLoading,
      refresh,
    }}>
      {children}
    </AIProviderContext.Provider>
  );
}
