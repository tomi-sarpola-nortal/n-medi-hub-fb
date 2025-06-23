
'use server';

import { createTrainingCategory, findTrainingCategoryByAbbreviation } from '@/services/trainingCategoryService';
import type { TrainingCategoryCreationData, TrainingOrganizerCreationData } from '@/lib/types';
import { createTrainingOrganizer, findTrainingOrganizerByName } from '@/services/trainingOrganizerService';

const categoriesToSeed: TrainingCategoryCreationData[] = [
  { name: 'Zahn-, Mund- und Kieferkrankheiten', abbreviation: 'ZMK', isActive: true },
  { name: 'Literatur', abbreviation: 'Literatur', isActive: true },
  { name: 'Kieferorthopädie', abbreviation: 'KFO', isActive: true },
  { name: 'Parodontologie', abbreviation: 'PARO', isActive: true },
  { name: 'Implantologie', abbreviation: 'IMPL', isActive: true }
];

const organizersToSeed: TrainingOrganizerCreationData[] = [
  { name: 'Universitätsklinik Wien', isActive: true },
  { name: 'ÖZÄK', isActive: true },
  { name: 'Medizinische Universität Graz', isActive: true },
  { name: 'Österreichische Gesellschaft für KFO', isActive: true },
  { name: 'DentEd Online', isActive: true },
  { name: 'Zahnärztekammer Wien', isActive: true },
];

export async function seedTrainingCategories(): Promise<{ success: boolean; message: string }> {
  try {
    let createdCount = 0;
    let skippedCount = 0;

    for (const category of categoriesToSeed) {
      const existing = await findTrainingCategoryByAbbreviation(category.abbreviation);
      if (existing) {
        skippedCount++;
      } else {
        await createTrainingCategory(category);
        createdCount++;
      }
    }
    
    return { 
      success: true, 
      message: `Seeding complete. Created: ${createdCount} new categories. Skipped: ${skippedCount} existing categories.` 
    };
  } catch (error) {
    console.error('Error seeding training categories:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error seeding categories: ${errorMessage}` };
  }
}

export async function seedTrainingOrganizers(): Promise<{ success: boolean; message: string }> {
  try {
    let createdCount = 0;
    let skippedCount = 0;

    for (const organizer of organizersToSeed) {
      const existing = await findTrainingOrganizerByName(organizer.name);
      if (existing) {
        skippedCount++;
      } else {
        await createTrainingOrganizer(organizer);
        createdCount++;
      }
    }
    
    return { 
      success: true, 
      message: `Seeding complete. Created: ${createdCount} new organizers. Skipped: ${skippedCount} existing organizers.` 
    };
  } catch (error) {
    console.error('Error seeding training organizers:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error seeding organizers: ${errorMessage}` };
  }
}
