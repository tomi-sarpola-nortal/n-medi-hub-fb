'use server';

import { findPersonByEmail, updatePerson, createPerson } from '@/services/personService';
import { createTrainingCategory, findTrainingCategoryByAbbreviation } from '@/services/trainingCategoryService';
import { addTrainingHistoryForUser, getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import type { PersonCreationData, RepresentationCreationData, TrainingCategoryCreationData, TrainingOrganizerCreationData, TrainingHistoryCreationData, StateChamberCreationData, ZfdGroupCreationData, UserRole } from '@/lib/types';
import { createTrainingOrganizer, findTrainingOrganizerByName } from '@/services/trainingOrganizerService';
import { createStateChamber, getStateChamberById } from '@/services/stateChamberService';
import { createZfdGroup } from '@/services/zfdGroupService';
import { createRepresentation } from '@/services/representationService';

// ===================================================================================
// ESSENTIAL SEEDING ACTIONS (for new environments)
// These should be run in a new environment to ensure the application functions correctly.
// ===================================================================================

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
  { name: 'Ärztebüro Wien', isActive: true },
  { name: 'Medizinische Universität Wien', isActive: true },
  { name: 'Medical Tribune', isActive: true },
  { name: 'Quintessenz Verlag', isActive: true },
  { name: 'Thieme', isActive: true },
];

const chambersToSeed: { id: string, data: StateChamberCreationData }[] = [
    { id: 'wien', data: { name: 'Ärztebüro Wien', address: 'Kohlmarkt 11/6\n1010 Wien', phone: '+43 1 513 37 31', email: 'office@wr.aerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 14:00 Uhr' } },
    { id: 'noe', data: { name: 'Ärztebüro Niederösterreich', address: 'Kremser Gasse 20\n3100 St. Pölten', phone: '+43 2742 35 35 70', email: 'office@noe.aerztekammer.at', officeHours: 'Mo-Do: 8:00 - 17:00 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'ooe', data: { name: 'Ärztebüro Oberösterreich', address: 'Europaplatz 7\n4020 Linz', phone: '+43 505 11 40 20', email: 'office@ooe.aerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'bgld', data: { name: 'Ärztebüro Burgenland', address: 'Esterházyplatz 1\n7000 Eisenstadt', phone: '+43 2682 66 5 66', email: 'office@bgld.aerztekammer.at', officeHours: 'Mo, Di, Do: 8:00 - 16:00 Uhr\nMi, Fr: 8:00 - 12:00 Uhr' } },
    { id: 'ktn', data: { name: 'Ärztebüro Kärnten', address: 'St. Veiter Straße 34/2\n9020 Klagenfurt', phone: '+43 463 56 3 99', email: 'office@ktn.aerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:00 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'sbg', data: { name: 'Ärztebüro Salzburg', address: 'Glockengasse 4\n5020 Salzburg', phone: '+43 662 87 34 88', email: 'office@sbg.aerztekammer.at', officeHours: 'Mo-Fr: 8:00 - 12:00 Uhr' } },
    { id: 'stmk', data: { name: 'Ärztebüro Steiermark', address: 'Marburger Kai 51/2\n8010 Graz', phone: '+43 316 82 82 02', email: 'office@stmk.aerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:00 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'tirol', data: { name: 'Ärztebüro Tirol', address: 'Anichstraße 7/4\n6020 Innsbruck', phone: '+43 512 58 75 75', email: 'office@tirol.aerztekammer.at', officeHours: 'Mo-Do: 8:00 - 16:00 Uhr\nFr: 8:00 - 12:00 Uhr' } },
    { id: 'vbg', data: { name: 'Ärztebüro Vorarlberg', address: 'Rheinstraße 61\n6900 Bregenz', phone: '+43 5574 45 5 15', email: 'office@vbg.aerztekammer.at', officeHours: 'Mo, Mi, Fr: 8:00 - 12:00 Uhr' } },
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

// ===================================================================================
// DEVELOPMENT & TESTING SEEDING ACTIONS
// These are for populating a development environment with test data.
// Do NOT run these in a production environment.
// ===================================================================================

const historyToSeed: TrainingHistoryCreationData[] = [
  // This data is crafted to match the ZFD totals in the screenshot (97 points)
  // and the order of visible items.
  { date: "2025-05-22", title: "Modern Procedures in Implantology", category: "IMPL", points: 15, organizer: "University Clinic Vienna", zfdGroupId: 'berufsbezogen' },
  { date: "2025-05-15", title: "Digital Workflows in Medical Practice", category: "ZMK", points: 5, organizer: "ÖZÄK", zfdGroupId: 'berufsbezogen' },
  { date: "2025-05-03", title: "Advances in Periodontology", category: "PARO", points: 5, organizer: "Medical University Graz", zfdGroupId: 'berufsbezogen' },
  { date: "2025-04-20", title: "Current Trends in Orthodontics", category: "KFO", points: 10, organizer: "Regional Society for KFO", zfdGroupId: 'berufsbezogen' },
  { date: "2025-04-10", title: "Webinar: New Materials in Prosthetics", category: "Literatur", points: 10, organizer: "DentEd Online", zfdGroupId: 'literatur' },
  { date: "2025-03-28", title: "Practice Management and Communication", category: "Frei", points: 8, organizer: "Medical Bureau Vienna", zfdGroupId: 'frei' },
  { date: "2025-03-05", title: "Annual Subscription 'Medical Magazine'", category: "Literatur", points: 10, organizer: "Medical Tribune", zfdGroupId: 'literatur' },
  { date: "2025-02-25", title: "Implant Prosthetics for Advanced Practitioners", category: "IMPL", points: 10, organizer: "University Clinic Vienna", zfdGroupId: 'berufsbezogen' },
  { date: "2025-02-01", title: "Workshop: Legal Foundations", category: "Frei", points: 4, organizer: "ÖZÄK", zfdGroupId: 'frei' },
  { date: "2025-01-15", title: "Annual Subscription 'Quintessence Medicine'", category: "Literatur", points: 10, organizer: "Quintessenz Verlag", zfdGroupId: 'literatur' },
  { date: "2024-12-10", title: "Annual Subscription 'ZWR'", category: "Literatur", points: 10, organizer: "Thieme", zfdGroupId: 'literatur' },
];

export async function seedTrainingHistory(): Promise<{ success: boolean; message: string }> {
    const userEmail = 'sarah.miller@example.com';
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


export async function setSabineMuellerToPending(): Promise<{ success: boolean; message: string }> {
  const userEmail = 'sarah.miller@example.com';
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

const usersToSeed: { id: string; email: string; name: string; dentistId?: string; role: UserRole }[] = [
    { id: 'seed-user-mark-weaver', email: 'mark.weaver@example.com', name: 'Dr. Mark Weaver', dentistId: '78954', role: 'dentist' },
    { id: 'seed-user-julia-smith', email: 'julia.smith@example.com', name: 'Dr. Julia Smith', dentistId: '65412', role: 'dentist' },
    { id: 'seed-user-thomas-miller', email: 'thomas.miller@example.com', name: 'Dr. Thomas Miller', dentistId: '34567', role: 'dentist' },
    { id: 'seed-user-sarah-baker', email: 'sarah.baker@example.com', name: 'Dr. Sarah Baker', dentistId: '23456', role: 'dentist' },
    { id: 'seed-user-lucas-hoffman', email: 'lucas.hoffman@example.com', name: 'Dr. Lucas Hoffman', dentistId: '78954', role: 'dentist' },
    { id: 'seed-user-anna-taylor', email: 'anna.taylor@example.com', name: 'Dr. Anna Taylor', dentistId: '65412', role: 'dentist' },
    { id: 'seed-user-max-sample', email: 'max.sample@example.com', name: 'Max Sample', role: 'lk_member' },
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
                    role: userData.role,
                    status: 'active',
                    region: 'Wien',
                    otpEnabled: false,
                    notificationSettings: { inApp: true, email: false },
                };
                await createPerson(userData.id, newUser, 'en');
                usersCreated++;
                user = await findPersonByEmail(userData.email);
            }
             if (user) {
                userMap.set(user.email, user.id);
                userNamesMap.set(user.id, user.name);
            }
        }

        // 2. Get Sarah Miller's ID
        const sarahMiller = await findPersonByEmail('sarah.miller@example.com');
        if (!sarahMiller) {
            return { success: false, message: "Could not find sarah.miller@example.com. Please ensure she exists." };
        }
        userNamesMap.set(sarahMiller.id, sarahMiller.name);

        // 3. Create representation data
        const representationsToCreate: RepresentationCreationData[] = [
            // Sarah represented others
            {
                representingPersonId: sarahMiller.id, representedPersonId: userMap.get('mark.weaver@example.com')!,
                representingPersonName: sarahMiller.name, representedPersonName: 'Dr. Mark Weaver (ID: 78954)',
                startDate: '2025-05-15T08:00:00', endDate: '2025-05-15T15:00:00', durationHours: 7, status: 'confirmed', confirmedAt: '2025-05-22T09:00:00'
            },
            {
                representingPersonId: sarahMiller.id, representedPersonId: userMap.get('julia.smith@example.com')!,
                representingPersonName: sarahMiller.name, representedPersonName: 'Dr. Julia Smith (ID: 65412)',
                startDate: '2025-05-01T08:00:00', endDate: '2025-05-02T19:00:00', durationHours: 13, status: 'pending'
            },
            {
                representingPersonId: sarahMiller.id, representedPersonId: userMap.get('thomas.miller@example.com')!,
                representingPersonName: sarahMiller.name, representedPersonName: 'Dr. Thomas Miller (ID: 34567)',
                startDate: '2025-04-15T08:00:00', endDate: '2025-04-15T18:00:00', durationHours: 8, status: 'confirmed', confirmedAt: '2025-04-21T09:00:00'
            },
            {
                representingPersonId: sarahMiller.id, representedPersonId: userMap.get('sarah.baker@example.com')!,
                representingPersonName: sarahMiller.name, representedPersonName: 'Dr. Sarah Baker (ID: 23456)',
                startDate: '2025-04-01T07:00:00', endDate: '2025-04-01T13:30:00', durationHours: 6.5, status: 'confirmed', confirmedAt: '2025-04-12T09:00:00'
            },
            // Others represented Sarah
            {
                representingPersonId: userMap.get('lucas.hoffman@example.com')!, representedPersonId: sarahMiller.id,
                representingPersonName: userNamesMap.get(userMap.get('lucas.hoffman@example.com')!)!, representedPersonName: sarahMiller.name,
                startDate: '2025-05-10T08:30:00', endDate: '2025-05-10T17:00:00', durationHours: 8.5, status: 'pending'
            },
            {
                representingPersonId: userMap.get('lucas.hoffman@example.com')!, representedPersonId: sarahMiller.id,
                representingPersonName: userNamesMap.get(userMap.get('lucas.hoffman@example.com')!)!, representedPersonName: sarahMiller.name,
                startDate: '2025-05-11T15:00:00', endDate: '2025-05-11T18:00:00', durationHours: 3, status: 'pending'
            },
            {
                representingPersonId: userMap.get('anna.taylor@example.com')!, representedPersonId: sarahMiller.id,
                representingPersonName: userNamesMap.get(userMap.get('anna.taylor@example.com')!)!, representedPersonName: sarahMiller.name,
                startDate: '2025-05-02T10:00:00', endDate: '2025-05-02T17:00:00', durationHours: 7, status: 'pending'
            },
             {
                representingPersonId: userMap.get('thomas.miller@example.com')!, representedPersonId: sarahMiller.id,
                representingPersonName: userNamesMap.get(userMap.get('thomas.miller@example.com')!)!, representedPersonName: sarahMiller.name,
                startDate: '2024-12-15T15:00:00', endDate: '2024-12-15T18:00:00', durationHours: 3, status: 'confirmed', confirmedAt: '2024-12-21T09:00:00'
            }
        ];

        for (const repData of representationsToCreate) {
            await createRepresentation(repData, 'en');
            representationsCreated++;
        }

        return { success: true, message: `Seeding complete. Created ${usersCreated} new users and ${representationsCreated} representation records.` };
    } catch (error) {
        console.error('Error seeding users and representations:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Error seeding data: ${errorMessage}` };
    }
}