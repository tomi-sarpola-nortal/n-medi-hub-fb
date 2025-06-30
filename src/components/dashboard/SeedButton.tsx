
'use client';

import { Button } from '@/components/ui/button';
import { seedTrainingCategories, seedTrainingOrganizers, seedTrainingHistory, seedStateBureaus, seedZfdGroups, seedUsersAndRepresentations, seedDemoUsers } from '@/app/actions/seedActions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SeedButton() {
  const { toast } = useToast();
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isOrganizersLoading, setIsOrganizersLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isBureausLoading, setIsBureausLoading] = useState(false);
  const [isZfdGroupsLoading, setIsZfdGroupsLoading] = useState(false);
  const [isOtherUsersLoading, setIsOtherUsersLoading] = useState(false);
  const [isDemoUsersLoading, setIsDemoUsersLoading] = useState(false);


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

  const handleSeedStateBureaus = async () => {
    setIsBureausLoading(true);
    try {
      const result = await seedStateBureaus();
      toast({
        title: "Seeding Report (State Bureaus)",
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
    setIsBureausLoading(false);
  };
  
  const handleSeedZfdGroups = async () => {
    setIsZfdGroupsLoading(true);
    try {
      const result = await seedZfdGroups();
      toast({
        title: "Seeding Report (ZFD Groups)",
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
    setIsZfdGroupsLoading(false);
  };

  const handleSeedOtherUsers = async () => {
    setIsOtherUsersLoading(true);
    try {
      const result = await seedUsersAndRepresentations();
      toast({
        title: "Seeding Report (Representations)",
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
    setIsOtherUsersLoading(false);
  };
  
  const handleSeedDemoUsers = async () => {
    setIsDemoUsersLoading(true);
    try {
      const result = await seedDemoUsers();
      toast({
        title: "Seeding Report (Demo Users)",
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
    setIsDemoUsersLoading(false);
  };

  return (
    <div className="flex flex-wrap gap-4">
        <Button onClick={handleSeedZfdGroups} disabled={isZfdGroupsLoading} variant="destructive" className="w-full sm:w-auto">
          {isZfdGroupsLoading ? "Seeding..." : "Seed ZFD Groups"}
        </Button>
        <Button onClick={handleSeedCategories} disabled={isCategoriesLoading} variant="destructive" className="w-full sm:w-auto">
          {isCategoriesLoading ? "Seeding..." : "Seed Training Categories"}
        </Button>
        <Button onClick={handleSeedOrganizers} disabled={isOrganizersLoading} variant="destructive" className="w-full sm:w-auto">
          {isOrganizersLoading ? "Seeding..." : "Seed Training Organizers"}
        </Button>
        <Button onClick={handleSeedStateBureaus} disabled={isBureausLoading} variant="destructive" className="w-full sm:w-auto">
          {isBureausLoading ? "Seeding..." : "Seed State Bureaus"}
        </Button>
        <Button onClick={handleSeedDemoUsers} disabled={isDemoUsersLoading} variant="destructive" className="w-full sm:w-auto">
          {isDemoUsersLoading ? "Seeding..." : "Seed Demo Users"}
        </Button>
        <Button onClick={handleSeedHistory} disabled={isHistoryLoading} variant="destructive" className="w-full sm:w-auto">
          {isHistoryLoading ? "Seeding..." : "Seed Training History"}
        </Button>
        <Button onClick={handleSeedOtherUsers} disabled={isOtherUsersLoading} variant="destructive" className="w-full sm:w-auto">
          {isOtherUsersLoading ? "Seeding..." : "Seed Representations"}
        </Button>
    </div>
  );
}
