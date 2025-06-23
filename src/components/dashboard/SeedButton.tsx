
'use client';

import { Button } from '@/components/ui/button';
import { seedTrainingCategories, seedTrainingOrganizers, seedTrainingHistory } from '@/app/actions/seedActions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Database } from 'lucide-react';

export default function SeedButton() {
  const { toast } = useToast();
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isOrganizersLoading, setIsOrganizersLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);


  const handleSeedCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const result = await seedTrainingCategories();
      toast({
        title: "Seeding Report (Categories)",
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
    setIsCategoriesLoading(false);
  };
  
  const handleSeedOrganizers = async () => {
    setIsOrganizersLoading(true);
    try {
      const result = await seedTrainingOrganizers();
      toast({
        title: "Seeding Report (Organizers)",
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
    setIsOrganizersLoading(false);
  };

  const handleSeedHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const result = await seedTrainingHistory();
      toast({
        title: "Seeding Report (History)",
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
    setIsHistoryLoading(false);
  };

  return (
    <div className="my-4 p-4 border border-dashed border-destructive/50 rounded-md bg-destructive/5">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-destructive">Temporary Data Seeding</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Click these buttons to populate collections in your Firestore database. This only needs to be done once per collection.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleSeedCategories} disabled={isCategoriesLoading} variant="destructive" className="w-full sm:w-auto">
          {isCategoriesLoading ? "Seeding..." : "Seed Training Categories"}
        </Button>
        <Button onClick={handleSeedOrganizers} disabled={isOrganizersLoading} variant="destructive" className="w-full sm:w-auto">
          {isOrganizersLoading ? "Seeding..." : "Seed Training Organizers"}
        </Button>
        <Button onClick={handleSeedHistory} disabled={isHistoryLoading} variant="destructive" className="w-full sm:w-auto">
          {isHistoryLoading ? "Seeding..." : "Seed Training History"}
        </Button>
      </div>
       <p className="text-xs text-muted-foreground mt-2">
        After successful seeding, you may remove this component and its related files.
      </p>
    </div>
  );
}
