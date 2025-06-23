
'use client';

import { Button } from '@/components/ui/button';
import { seedTrainingCategories } from '@/app/actions/seedActions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Database } from 'lucide-react';

export default function SeedButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const result = await seedTrainingCategories();
      toast({
        title: "Seeding Report",
        description: result.message,
      });
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
       toast({
        title: "Client-side Error",
        description: `Failed to execute seed action: ${errorMessage}`,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="my-4 p-4 border border-dashed border-destructive/50 rounded-md bg-destructive/5">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-destructive">Temporary Data Seeding</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Click this button to populate the 'training_categories' collection in your Firestore database. This only needs to be done once.
      </p>
      <Button onClick={handleSeed} disabled={isLoading} variant="destructive" className="w-full sm:w-auto">
        {isLoading ? "Seeding..." : "Seed Training Categories"}
      </Button>
       <p className="text-xs text-muted-foreground mt-2">
        After successful seeding, you may remove this button and its related files.
      </p>
    </div>
  );
}
