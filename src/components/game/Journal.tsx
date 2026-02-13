import { BookOpen, ChevronRight } from 'lucide-react';
import { JournalEntry } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface JournalProps {
  entries: JournalEntry[];
}

export function Journal({ entries }: JournalProps) {
  return (
    <div className="parchment rounded-lg p-4 h-full overflow-hidden flex flex-col">
      <h3 className="font-medieval text-sm text-primary mb-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Adventure Journal
      </h3>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {entries.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2">
            {entries.map((entry) => (
              <AccordionItem
                key={entry.id}
                value={entry.id}
                className="border-b-0"
              >
                <AccordionTrigger className="py-2 px-3 rounded-lg hover:bg-secondary/50 hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-xs text-primary font-medieval">
                      #{entry.entry_number}
                    </span>
                    <span className="text-sm font-medium">
                      {entry.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground font-story leading-relaxed"
                  >
                    {entry.content}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <BookOpen className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm text-center">
              Your journey has just begun.<br />
              Entries will appear as you progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
