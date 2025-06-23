
'use server';

import { createTrainingCategory, findTrainingCategoryByAbbreviation } from '@/services/trainingCategoryService';
import type { TrainingCategoryCreationData } from '@/lib/types';

const categoriesToSeed: TrainingCategoryCreationData[] = [
  { name: 'Zahn-, Mund- und Kieferkrankheiten', abbreviation: 'ZMK', isActive: true },
  { name: 'Literatur', abbreviation: 'Literatur', isActive: true },
  { name: 'Kieferorthopädie', abbreviation: 'KFO', isActive: true },
  { name: 'Parodontologie', abbreviation: 'PARO', isActive: true },
  { name: 'Implantologie', abbreviation: 'IMPL', isActive: true }
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
