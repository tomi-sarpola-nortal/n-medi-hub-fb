
'use server';

import { findPersonByEmail, updatePerson } from '@/services/personService';
import { createTrainingCategory, findTrainingCategoryByAbbreviation } from '@/services/trainingCategoryService';
import { addTrainingHistoryForUser, getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import type { TrainingCategoryCreationData, TrainingOrganizerCreationData, TrainingHistoryCreationData, StateChamberCreationData } from '@/lib/types';
import { createTrainingOrganizer, findTrainingOrganizerByName } from '@/services/trainingOrganizerService';
import { createStateChamber, getStateChamberById } from '@/services/stateChamberService';

const categoriesToSeed: TrainingCategoryCreationData[] = [
  { name: 'Zahn-, Mund- und Kieferkrankheiten', abbreviation: 'ZMK', isActive: true, zfdGroupName: 'zfd_category_berufsbezogen', zfdGroupPoints: 60 },
  { name: 'Literatur', abbreviation: 'Literatur', isActive: true, zfdGroupName: 'zfd_category_literatur', zfdGroupPoints: 45 },
  { name: 'Kieferorthopädie', abbreviation: 'KFO', isActive: true, zfdGroupName: 'zfd_category_berufsbezogen', zfdGroupPoints: 60 },
  { name: 'Parodontologie', abbreviation: 'PARO', isActive: true, zfdGroupName: 'zfd_category_berufsbezogen', zfdGroupPoints: 60 },
  { name: 'Implantologie', abbreviation: 'IMPL', isActive: true, zfdGroupName: 'zfd_category_berufsbezogen', zfdGroupPoints: 60 },
  { name: 'Frei wählbare Fortbildung', abbreviation: 'Frei', isActive: true, zfdGroupName: 'zfd_category_frei', zfdGroupPoints: 15 }
];

const organizersToSeed: TrainingOrganizerCreationData[] = [
  { name: 'Universitätsklinik Wien', isActive: true },
  { name: 'ÖZÄK', isActive: true },
  { name: 'Medizinische Universität Graz', isActive: true },
  { name: 'Österreichische Gesellschaft für KFO', isActive: true },
  { name: 'DentEd Online', isActive: true },
  { name: 'Zahnärztekammer Wien', isActive: true },
  { name: 'Medizinische Universität Wien', isActive: true },
  { name: 'Dental Tribune', isActive: true },
  { name: 'Quintessenz Verlag', isActive: true },
  { name: 'Thieme', isActive: true },
];

const historyToSeed: TrainingHistoryCreationData[] = [
  // This data is crafted to match the ZFD totals in the screenshot (97 points)
  // Berufsbezogen: 45 points
  { date: "2025-05-22", title: "Moderne Verfahren in der Implantologie", category: "IMPL", points: 15, organizer: "Universitätsklinik Wien" },
  { date: "2025-02-25", title: "Implantatprothetik für Fortgeschrittene", category: "IMPL", points: 10, organizer: "Universitätsklinik Wien" },
  { date: "2025-04-20", title: "Aktuelle Trends in der Kieferorthopädie", category: "KFO", points: 10, organizer: "Österreichische Gesellschaft für KFO" },
  { date: "2025-05-03", title: "Fortschritte in der Parodontologie", category: "PARO", points: 5, organizer: "Medizinische Universität Graz" },
  { date: "2025-05-15", title: "Digitale Workflows in der Zahnarztpraxis", category: "ZMK", points: 5, organizer: "ÖZÄK" },

  // Frei: 12 points
  { date: "2025-03-28", title: "Praxismanagement und Kommunikation", category: "Frei", points: 8, organizer: "Zahnärztekammer Wien" },
  { date: "2025-02-01", title: "Workshop: Rechtliche Grundlagen", category: "Frei", points: 4, organizer: "ÖZÄK" },
  
  // Literatur: 40 points
  { date: "2025-04-10", title: "Webinar: Neue Materialien in der Prothetik", category: "Literatur", points: 10, organizer: "DentEd Online" },
  { date: "2025-03-05", title: "Jahresabonnement 'Dental Magazin'", category: "Literatur", points: 10, organizer: "Dental Tribune" },
  { date: "2025-01-15", title: "Jahresabonnement 'Quintessenz Zahnmedizin'", category: "Literatur", points: 10, organizer: "Quintessenz Verlag" },
  { date: "2024-12-10", title: "Jahresabonnement 'ZWR'", category: "Literatur", points: 10, organizer: "Thieme" },
];


const chambersToSeed: { id: string, data: StateChamberCreationData }[] = [
    { id: 'wien', data: { name: 'Zahnärztekammer Wien', address: 'Kohlmarkt 11/6\n1010 Wien', phone: '+43 1 513 37 31', email: 'office@wr.zahnaerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 14:00 Uhr' } },
    { id: 'noe', data: { name: 'Zahnärztekammer Niederösterreich', address: 'Kremser Gasse 20\n3100 St. Pölten', phone: '+43 2742 35 35 70', email: 'office@noe.zahnaerztekammer.at', officeHours: 'Mo-Do: 8:00 - 17:00 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'ooe', data: { name: 'Zahnärztekammer Oberösterreich', address: 'Europaplatz 7\n4020 Linz', phone: '+43 505 11 40 20', email: 'office@ooe.zahnaerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'bgld', data: { name: 'Zahnärztekammer Burgenland', address: 'Esterházyplatz 1\n7000 Eisenstadt', phone: '+43 2682 66 5 66', email: 'office@bgld.zahnaerztekammer.at', officeHours: 'Mo, Di, Do: 8:00 - 16:00 Uhr\nMi, Fr: 8:00 - 12:00 Uhr' } },
    { id: 'ktn', data: { name: 'Zahnärztekammer Kärnten', address: 'St. Veiter Straße 34/2\n9020 Klagenfurt', phone: '+43 463 56 3 99', email: 'office@ktn.zahnaerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:00 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'sbg', data: { name: 'Zahnärztekammer Salzburg', address: 'Glockengasse 4\n5020 Salzburg', phone: '+43 662 87 34 88', email: 'office@sbg.zahnaerztekammer.at', officeHours: 'Mo-Fr: 8:00 - 12:00 Uhr' } },
    { id: 'stmk', data: { name: 'Zahnärztekammer Steiermark', address: 'Marburger Kai 51/2\n8010 Graz', phone: '+43 316 82 82 02', email: 'office@stmk.zahnaerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:00 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'tirol', data: { name: 'Zahnärztekammer Tirol', address: 'Anichstraße 7/4\n6020 Innsbruck', phone: '+43 512 58 75 75', email: 'office@tirol.zahnaerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:00 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'vbg', data: { name: 'Zahnärztekammer Vorarlberg', address: 'Rheinstraße 61\n6900 Bregenz', phone: '+43 5574 45 5 15', email: 'office@vbg.zahnaerztekammer.at', officeHours: 'Mo, Mi, Fr: 8:00 - 12:00 Uhr' } },
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
    const userEmail = 'sabine.mueller@example.com';
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

export async function seedStateChambers(): Promise<{ success: boolean; message: string }> {
    try {
        let createdCount = 0;
        let skippedCount = 0;

        for (const chamber of chambersToSeed) {
            const existing = await getStateChamberById(chamber.id);
            if (existing) {
                skippedCount++;
            } else {
                await createStateChamber(chamber.id, chamber.data);
                createdCount++;
            }
        }
        
        return { 
        success: true, 
        message: `Seeding complete. Created: ${createdCount} new state chambers. Skipped: ${skippedCount} existing chambers.` 
        };
    } catch (error) {
        console.error('Error seeding state chambers:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Error seeding chambers: ${errorMessage}` };
    }
}

export async function setSabineMuellerToPending(): Promise<{ success: boolean; message: string }> {
  const userEmail = 'sabine.mueller@example.com';
  try {
    const user = await findPersonByEmail(userEmail);
    if (!user) {
      return { success: false, message: `User with email ${userEmail} not found.` };
    }

    await updatePerson(user.id, { status: 'pending' });

    return { success: true, message: `Successfully set user ${userEmail} to pending status.` };

  } catch (error) {
    console.error(`Error setting user ${userEmail} to pending:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}
