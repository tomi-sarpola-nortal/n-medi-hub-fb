
'use server';

import { findPersonByEmail, updatePerson, createPerson } from '@/services/personService';
import { createTrainingCategory, findTrainingCategoryByAbbreviation } from '@/services/trainingCategoryService';
import { addTrainingHistoryForUser, getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import type { PersonCreationData, RepresentationCreationData, TrainingCategoryCreationData, TrainingOrganizerCreationData, TrainingHistoryCreationData, StateChamberCreationData, ZfdGroupCreationData } from '@/lib/types';
import { createTrainingOrganizer, findTrainingOrganizerByName } from '@/services/trainingOrganizerService';
import { createStateChamber, getStateChamberById } from '@/services/stateChamberService';
import { createZfdGroup } from '@/services/zfdGroupService';
import { createRepresentation } from '@/services/representationService';

const zfdGroupsToSeed: { id: string, data: ZfdGroupCreationData }[] = [
  { id: 'berufsbezogen', data: { nameKey: 'zfd_category_berufsbezogen', totalPoints: 60 } },
  { id: 'literatur', data: { nameKey: 'zfd_category_literatur', totalPoints: 45 } },
  { id: 'frei', data: { nameKey: 'zfd_category_frei', totalPoints: 15 } },
];

const categoriesToSeed: TrainingCategoryCreationData[] = [
  { name: 'Zahn-, Mund- und Kieferkrankheiten', abbreviation: 'ZMK', isActive: true, zfdGroupId: 'berufsbezogen' },
  { name: 'Literatur', abbreviation: 'Literatur', isActive: true, zfdGroupId: 'literatur' },
  { name: 'Kieferorthopädie', abbreviation: 'KFO', isActive: true, zfdGroupId: 'berufsbezogen' },
  { name: 'Parodontologie', abbreviation: 'PARO', isActive: true, zfdGroupId: 'berufsbezogen' },
  { name: 'Implantologie', abbreviation: 'IMPL', isActive: true, zfdGroupId: 'berufsbezogen' },
  { name: 'Frei wählbare Fortbildung', abbreviation: 'Frei', isActive: true, zfdGroupId: 'frei' }
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

const categoryToZfdGroupMap: { [key: string]: string } = {};
categoriesToSeed.forEach(cat => {
    if (cat.zfdGroupId) {
        categoryToZfdGroupMap[cat.abbreviation] = cat.zfdGroupId;
    }
});

const historyToSeed: TrainingHistoryCreationData[] = [
  // This data is crafted to match the ZFD totals in the screenshot (97 points)
  // and the order of visible items.
  { date: "2025-05-22", title: "Moderne Verfahren in der Implantologie", category: "IMPL", points: 15, organizer: "Universitätsklinik Wien", zfdGroupId: 'berufsbezogen' },
  { date: "2025-05-15", title: "Digitale Workflows in der Zahnarztpraxis", category: "ZMK", points: 5, organizer: "ÖZÄK", zfdGroupId: 'berufsbezogen' },
  { date: "2025-05-03", title: "Fortschritte in der Parodontologie", category: "PARO", points: 5, organizer: "Medizinische Universität Graz", zfdGroupId: 'berufsbezogen' },
  { date: "2025-04-20", title: "Aktuelle Trends in der Kieferorthopädie", category: "KFO", points: 10, organizer: "Österreichische Gesellschaft für KFO", zfdGroupId: 'berufsbezogen' },
  { date: "2025-04-10", title: "Webinar: Neue Materialien in der Prothetik", category: "Literatur", points: 10, organizer: "DentEd Online", zfdGroupId: 'literatur' },
  { date: "2025-03-28", title: "Praxismanagement und Kommunikation", category: "Frei", points: 8, organizer: "Zahnärztekammer Wien", zfdGroupId: 'frei' },
  { date: "2025-03-05", title: "Jahresabonnement 'Dental Magazin'", category: "Literatur", points: 10, organizer: "Dental Tribune", zfdGroupId: 'literatur' },
  { date: "2025-02-25", title: "Implantatprothetik für Fortgeschrittene", category: "IMPL", points: 10, organizer: "Universitätsklinik Wien", zfdGroupId: 'berufsbezogen' },
  { date: "2025-02-01", title: "Workshop: Rechtliche Grundlagen", category: "Frei", points: 4, organizer: "ÖZÄK", zfdGroupId: 'frei' },
  { date: "2025-01-15", title: "Jahresabonnement 'Quintessenz Zahnmedizin'", category: "Literatur", points: 10, organizer: "Quintessenz Verlag", zfdGroupId: 'literatur' },
  { date: "2024-12-10", title: "Jahresabonnement 'ZWR'", category: "Literatur", points: 10, organizer: "Thieme", zfdGroupId: 'literatur' },
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

        const totalPoints = historyToSeed.reduce((sum, record) => sum + record.points, 0);
        await updatePerson(user.id, { educationPoints: totalPoints });

        return { success: true, message: `Successfully seeded ${historyToSeed.length} training history records for ${userEmail} and updated total points to ${totalPoints}.` };

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

export async function seedZfdGroups(): Promise<{ success: boolean; message: string }> {
  try {
    let createdCount = 0;
    // Note: ZFD groups don't have a unique field to check for existence other than ID, which is fine for setDoc.
    for (const group of zfdGroupsToSeed) {
        await createZfdGroup(group.id, group.data);
        createdCount++;
    }
    
    return { 
      success: true, 
      message: `Seeding complete. Created/updated: ${createdCount} ZFD groups.` 
    };
  } catch (error) {
    console.error('Error seeding ZFD groups:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error seeding ZFD groups: ${errorMessage}` };
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

const usersToSeed = [
    { id: 'seed-user-markus-weber', email: 'markus.weber@example.com', name: 'Dr. Markus Weber', dentistId: '78954' },
    { id: 'seed-user-julia-schmidt', email: 'julia.schmidt@example.com', name: 'Dr. Julia Schmidt', dentistId: '65412' },
    { id: 'seed-user-thomas-mueller', email: 'thomas.mueller@example.com', name: 'Dr. Thomas Müller', dentistId: '34567' },
    { id: 'seed-user-sabine-becker', email: 'sabine.becker@example.com', name: 'Dr. Sabine Becker', dentistId: '23456' },
    { id: 'seed-user-lukas-hoffmann', email: 'lukas.hoffmann@example.com', name: 'Dr. Lukas Hoffmann', dentistId: '78954' },
    { id: 'seed-user-anna-schneider', email: 'anna.schneider@example.com', name: 'Dr. Anna Schneider', dentistId: '65412' },
];

export async function seedUsersAndRepresentations(): Promise<{ success: boolean; message: string }> {
    try {
        let usersCreated = 0;
        let representationsCreated = 0;

        // 1. Ensure all users exist
        const userMap = new Map<string, string>(); // email -> id
        const userNamesMap = new Map<string, string>(); // id -> name

        for (const userData of usersToSeed) {
            let user = await findPersonByEmail(userData.email);
            if (!user) {
                const newUser: PersonCreationData = {
                    name: userData.name,
                    email: userData.email,
                    dentistId: userData.dentistId,
                    role: 'dentist',
                    status: 'active',
                    region: 'Wien',
                    otpEnabled: false,
                };
                await createPerson(userData.id, newUser);
                usersCreated++;
                user = await findPersonByEmail(userData.email);
            }
             if (user) {
                userMap.set(user.email, user.id);
                userNamesMap.set(user.id, user.name);
            }
        }

        // 2. Get Sabine Müller's ID
        const sabineMueller = await findPersonByEmail('sabine.mueller@example.com');
        if (!sabineMueller) {
            return { success: false, message: "Could not find sabine.mueller@example.com. Please ensure she exists." };
        }
        userNamesMap.set(sabineMueller.id, sabineMueller.name);

        // 3. Create representation data
        const representationsToCreate: RepresentationCreationData[] = [
            // Sabine represented others
            {
                representingPersonId: sabineMueller.id, representedPersonId: userMap.get('markus.weber@example.com')!,
                representingPersonName: sabineMueller.name, representedPersonName: 'Dr. Markus Weber (ID: 78954)',
                startDate: '2025-05-15T08:00:00', endDate: '2025-05-15T15:00:00', durationHours: 7, status: 'confirmed', confirmedAt: '2025-05-22T09:00:00'
            },
            {
                representingPersonId: sabineMueller.id, representedPersonId: userMap.get('julia.schmidt@example.com')!,
                representingPersonName: sabineMueller.name, representedPersonName: 'Dr. Julia Schmidt (ID: 65412)',
                startDate: '2025-05-01T08:00:00', endDate: '2025-05-02T19:00:00', durationHours: 13, status: 'pending'
            },
            {
                representingPersonId: sabineMueller.id, representedPersonId: userMap.get('thomas.mueller@example.com')!,
                representingPersonName: sabineMueller.name, representedPersonName: 'Dr. Thomas Müller (ID: 34567)',
                startDate: '2025-04-15T08:00:00', endDate: '2025-04-15T18:00:00', durationHours: 8, status: 'confirmed', confirmedAt: '2025-04-21T09:00:00'
            },
            {
                representingPersonId: sabineMueller.id, representedPersonId: userMap.get('sabine.becker@example.com')!,
                representingPersonName: sabineMueller.name, representedPersonName: 'Dr. Sabine Becker (ID: 23456)',
                startDate: '2025-04-01T07:00:00', endDate: '2025-04-01T13:00:00', durationHours: 6, status: 'confirmed', confirmedAt: '2025-04-12T09:00:00'
            },
            // Others represented Sabine
            {
                representingPersonId: userMap.get('lukas.hoffmann@example.com')!, representedPersonId: sabineMueller.id,
                representingPersonName: userNamesMap.get(userMap.get('lukas.hoffmann@example.com')!)!, representedPersonName: sabineMueller.name,
                startDate: '2025-05-10T08:30:00', endDate: '2025-05-10T17:00:00', durationHours: 8.5, status: 'pending'
            },
            {
                representingPersonId: userMap.get('lukas.hoffmann@example.com')!, representedPersonId: sabineMueller.id,
                representingPersonName: userNamesMap.get(userMap.get('lukas.hoffmann@example.com')!)!, representedPersonName: sabineMueller.name,
                startDate: '2025-05-11T15:00:00', endDate: '2025-05-11T18:00:00', durationHours: 3, status: 'pending'
            },
            {
                representingPersonId: userMap.get('anna.schneider@example.com')!, representedPersonId: sabineMueller.id,
                representingPersonName: userNamesMap.get(userMap.get('anna.schneider@example.com')!)!, representedPersonName: sabineMueller.name,
                startDate: '2025-05-02T10:00:00', endDate: '2025-05-02T17:00:00', durationHours: 7, status: 'pending'
            },
             {
                representingPersonId: userMap.get('thomas.mueller@example.com')!, representedPersonId: sabineMueller.id,
                representingPersonName: userNamesMap.get(userMap.get('thomas.mueller@example.com')!)!, representedPersonName: sabineMueller.name,
                startDate: '2024-12-15T15:00:00', endDate: '2024-12-15T18:00:00', durationHours: 3, status: 'confirmed', confirmedAt: '2024-12-21T09:00:00'
            }
        ];

        for (const repData of representationsToCreate) {
            await createRepresentation(repData);
            representationsCreated++;
        }

        return { success: true, message: `Seeding complete. Created ${usersCreated} new users and ${representationsCreated} representation records.` };
    } catch (error) {
        console.error('Error seeding users and representations:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Error seeding data: ${errorMessage}` };
    }
}
