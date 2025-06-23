
'use client';

import { Button } from '@/components/ui/button';
import { seedTrainingCategories, seedTrainingOrganizers, seedTrainingHistory, seedStateChambers } from '@/app/actions/seedActions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SeedButton() {
  const { toast } = useToast();
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isOrganizersLoading, setIsOrganizersLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isChambersLoading, setIsChambersLoading] = useState(false);


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

  const handleSeedStateChambers = async () => {
    setIsChambersLoading(true);
    try {
      const result = await seedStateChambers();
      toast({
        title: "Seeding Report (State Chambers)",
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
    setIsChambersLoading(false);
  };

  return (
    <div className="flex flex-wrap gap-4">
        <Button onClick={handleSeedCategories} disabled={isCategoriesLoading} variant="destructive" className="w-full sm:w-auto">
          {isCategoriesLoading ? "Seeding..." : "Seed Training Categories"}
        </Button>
        <Button onClick={handleSeedOrganizers} disabled={isOrganizersLoading} variant="destructive" className="w-full sm:w-auto">
          {isOrganizersLoading ? "Seeding..." : "Seed Training Organizers"}
        </Button>
        <Button onClick={handleSeedHistory} disabled={isHistoryLoading} variant="destructive" className="w-full sm:w-auto">
          {isHistoryLoading ? "Seeding..." : "Seed Training History"}
        </Button>
        <Button onClick={handleSeedStateChambers} disabled={isChambersLoading} variant="destructive" className="w-full sm:w-auto">
          {isChambersLoading ? "Seeding..." : "Seed State Chambers"}
        </Button>
    </div>
  );
}
