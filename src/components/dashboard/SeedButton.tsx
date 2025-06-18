
'use client';

import { Button } from '@/components/ui/button';
import { seedSabineMueller } from '@/app/actions/seedActions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Database } from 'lucide-react';

export default function SeedButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const result = await seedSabineMueller();
      if (result.success) {
        toast({
          title: "Seeding Report",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
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
        Click this button once to create the initial 'Dr. Sabine Müller' document in your Firestore 'persons' collection.
      </p>
      <Button onClick={handleSeed} disabled={isLoading} variant="destructive" className="w-full sm:w-auto">
        {isLoading ? "Seeding..." : "Seed Sabine Müller Document"}
      </Button>
       <p className="text-xs text-muted-foreground mt-2">
        After successful seeding, please remove this button and its related files:
        <code>SeedButton.tsx</code> and <code>seedActions.ts</code>.
      </p>
    </div>
  );
}
