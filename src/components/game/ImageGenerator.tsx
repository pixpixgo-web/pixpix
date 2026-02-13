import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageGeneratorProps {
  characterDescription?: string;
  onImageGenerated?: (imageUrl: string) => void;
}

export function ImageGenerator({ characterDescription, onImageGenerated }: ImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!characterDescription) {
      toast({
        title: "No Description",
        description: "Please add a character description first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { characterDescription },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        if (onImageGenerated) {
          onImageGenerated(data.imageUrl);
        }
        toast({
          title: "✨ Portrait Generated!",
          description: "Your character comes to life.",
        });
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerateImage}
        disabled={isGenerating || !characterDescription}
        className="w-full gold-border"
        variant="outline"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Conjuring Portrait...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Portrait
          </>
        )}
      </Button>

      {generatedImage && (
        <div className="rounded-lg overflow-hidden border-2 border-primary/30">
          <img
            src={generatedImage}
            alt="Generated character portrait"
            className="w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}
