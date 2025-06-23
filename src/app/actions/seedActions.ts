
'use server';

import { findPersonByEmail } from '@/services/personService';
import { createTrainingCategory, findTrainingCategoryByAbbreviation } from '@/services/trainingCategoryService';
import { addTrainingHistoryForUser, getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import type { TrainingCategoryCreationData, TrainingOrganizerCreationData, TrainingHistoryCreationData } from '@/lib/types';
import { createTrainingOrganizer, findTrainingOrganizerByName } from '@/services/trainingOrganizerService';

const categoriesToSeed: TrainingCategoryCreationData[] = [
  { name: 'Zahn-, Mund- und Kieferkrankheiten', abbreviation: 'ZMK', isActive: true },
  { name: 'Literatur', abbreviation: 'Literatur', isActive: true },
  { name: 'Kieferorthopädie', abbreviation: 'KFO', isActive: true },
  { name: 'Parodontologie', abbreviation: 'PARO', isActive: true },
  { name: 'Implantologie', abbreviation: 'IMPL', isActive: true },
  { name: 'Frei wählbare Fortbildung', abbreviation: 'Frei', isActive: true }
];

const organizersToSeed: TrainingOrganizerCreationData[] = [
  { name: 'Universitätsklinik Wien', isActive: true },
  { name: 'ÖZÄK', isActive: true },
  { name: 'Medizinische Universität Graz', isActive: true },
  { name: 'Österreichische Gesellschaft für KFO', isActive: true },
  { name: 'DentEd Online', isActive: true },
  { name: 'Zahnärztekammer Wien', isActive: true },
  { name: 'Medizinische Universität Wien', isActive: true },
];

const historyToSeed: TrainingHistoryCreationData[] = [
  { date: "2025-05-22", title: "Moderne Verfahren in der Implantologie", category: "IMPL", points: 8, organizer: "Universitätsklinik Wien" },
  { date: "2025-05-15", title: "Digitale Workflows in der Zahnarztpraxis", category: "ZMK", points: 6, organizer: "ÖZÄK" },
  { date: "2025-05-03", title: "Fortschritte in der Parodontologie", category: "ZMK", points: 4, organizer: "Medizinische Universität Graz" },
  { date: "2025-04-20", title: "Aktuelle Trends in der Kieferorthopädie", category: "ZMK", points: 5, organizer: "Österreichische Gesellschaft für KFO" },
  { date: "2025-04-10", title: "Webinar: Neue Materialien in der Prothetik", category: "Literatur", points: 3, organizer: "DentEd Online" },
  { date: "2025-03-28", title: "Praxismanagement und Kommunikation", category: "Frei", points: 4, organizer: "Zahnärztekammer Wien" },
  { date: "2025-03-15", title: "Schmerzmanagement in der Zahnmedizin", category: "ZMK", points: 6, organizer: "Medizinische Universität Wien" },
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


export async function seedTrainingHistory(): Promise<{ success: boolean; message: string }> {
    const userEmail = 'adasd@asdas.com';
    try {
        const user = await findPersonByEmail(userEmail);
        if (!user) {
            return { success: false, message: `User with email ${userEmail} not found.` };
        }

        const existingHistory = await getTrainingHistoryForUser(user.id);
        if (existingHistory.length > 0) {
            return { success: true, message: `Training history for ${userEmail} has already been seeded. Skipped.` };
        }

        for (const record of historyToSeed) {
            await addTrainingHistoryForUser(user.id, record);
        }

        return { success: true, message: `Successfully seeded ${historyToSeed.length} training history records for ${userEmail}.` };

    } catch (error) {
        console.error('Error seeding training history:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Error seeding history: ${errorMessage}` };
    }
}
