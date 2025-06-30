
'use server';

import { findPersonByEmail, updatePerson, createPerson, getPersonById } from '@/services/personService';
import { createTrainingCategory, findTrainingCategoryByAbbreviation } from '@/services/trainingCategoryService';
import { addTrainingHistoryForUser, getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import type { PersonCreationData, RepresentationCreationData, TrainingCategoryCreationData, TrainingOrganizerCreationData, TrainingHistoryCreationData, StateBureauCreationData, ZfdGroupCreationData, UserRole } from '@/lib/types';
import { createTrainingOrganizer, findTrainingOrganizerByName } from '@/services/trainingOrganizerService';
import { createStateBureau, getStateBureauById } from '@/services/stateChamberService';
import { createZfdGroup } from '@/services/zfdGroupService';
import { createRepresentation } from '@/services/representationService';
import { adminAuth } from '@/lib/firebaseAdminConfig';

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
  { name: 'Charité - Universitätsmedizin Berlin', isActive: true },
  { name: 'Klinikum der Universität München (LMU)', isActive: true },
  { name: 'Universitätsklinikum Heidelberg', isActive: true },
  { name: 'Deutsche Gesellschaft für Zahn-, Mund- und Kieferheilkunde (DGZMK)', isActive: true },
  { name: 'Bundeszahnärztekammer (BZÄK)', isActive: true },
  { name: 'Springer Medizin', isActive: true },
  { name: 'Deutscher Ärzte-Verlag', isActive: true },
  { name: 'Akademie für zahnärztliche Fortbildung Karlsruhe', isActive: true },
];

const bureausToSeed: { id: string, data: StateBureauCreationData }[] = [
    { id: 'bw', data: { name: 'Ärztebüro Baden-Württemberg', address: 'Jahnstraße 5, 70597 Stuttgart', phone: '+49 711 76981-0', email: 'info@laek-bw.de', officeHours: 'Mo-Do: 9:00 - 16:00 Uhr\nFr: 9:00 - 12:00 Uhr' } },
    { id: 'by', data: { name: 'Bayerisches Landesärztebüro', address: 'Mühlbaurstraße 16, 81677 München', phone: '+49 89 4147-0', email: 'info@blaek.de', officeHours: 'Mo-Do: 8:00 - 17:00 Uhr\nFr: 8:00 - 13:00 Uhr' } },
    { id: 'be', data: { name: 'Ärztebüro Berlin', address: 'Friedrichstraße 16, 10969 Berlin', phone: '+49 30 400456-0', email: 'kammer@aekb.de', officeHours: 'Mo-Fr: 9:00 - 15:00 Uhr' } },
    { id: 'bb', data: { name: 'Landesärztebüro Brandenburg', address: 'Dreifertstraße 12, 03044 Cottbus', phone: '+49 355 78010-0', email: 'info@laekb.de', officeHours: 'Mo-Do: 8:30 - 15:30 Uhr\nFr: 8:30 - 12:00 Uhr' } },
    { id: 'hb', data: { name: 'Ärztebüro Bremen', address: 'Schwachhauser Heerstraße 30, 28209 Bremen', phone: '+49 421 3404-200', email: 'info@aekhb.de', officeHours: 'Mo-Do: 9:00 - 16:00 Uhr\nFr: 9:00 - 13:00 Uhr' } },
    { id: 'hh', data: { name: 'Ärztebüro Hamburg', address: 'Weidestraße 122 B, 22083 Hamburg', phone: '+49 40 227197-0', email: 'info@aekhh.de', officeHours: 'Mo-Do: 9:00 - 16:00 Uhr\nFr: 9:00 - 14:00 Uhr' } },
    { id: 'he', data: { name: 'Landesärztebüro Hessen', address: 'Im Vogelsgesang 3, 60488 Frankfurt am Main', phone: '+49 69 97672-0', email: 'info@laekh.de', officeHours: 'Mo-Fr: 8:00 - 16:30 Uhr' } },
    { id: 'mv', data: { name: 'Ärztebüro Mecklenburg-Vorpommern', address: 'August-Bebel-Straße 9a, 18055 Rostock', phone: '+49 381 49280-0', email: 'info@aek-mv.de', officeHours: 'Mo-Do: 8:00 - 16:00 Uhr\nFr: 8:00 - 13:00 Uhr' } },
    { id: 'ni', data: { name: 'Ärztebüro Niedersachsen', address: 'Berliner Allee 20, 30175 Hannover', phone: '+49 511 380-02', email: 'info@aekn.de', officeHours: 'Mo-Fr: 9:00 - 15:00 Uhr' } },
    { id: 'nw', data: { name: 'Ärztebüro Nordrhein', address: 'Tersteegenstraße 9, 40474 Düsseldorf', phone: '+49 211 4302-0', email: 'aerztekammer.nordrhein@aekno.de', officeHours: 'Mo-Fr: 8:00 - 16:00 Uhr' } },
    { id: 'rp', data: { name: 'Landesärztebüro Rheinland-Pfalz', address: 'Deutschhausplatz 3, 55116 Mainz', phone: '+49 6131 28822-0', email: 'info@laek-rlp.de', officeHours: 'Mo-Do: 8:30 - 16:30 Uhr\nFr: 8:30 - 12:30 Uhr' } },
    { id: 'sl', data: { name: 'Ärztebüro des Saarlandes', address: 'Faktoreistraße 4, 66111 Saarbrücken', phone: '+49 681 4003-0', email: 'info@aeksaar.de', officeHours: 'Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 13:00 Uhr' } },
    { id: 'sn', data: { name: 'Sächsisches Landesärztebüro', address: 'Schützenhöhe 16, 01099 Dresden', phone: '+49 351 8267-0', email: 'dresden@slaek.de', officeHours: 'Mo-Fr: 9:00 - 15:00 Uhr' } },
    { id: 'st', data: { name: 'Ärztebüro Sachsen-Anhalt', address: 'Doctor-Eisenbart-Ring 2, 39120 Magdeburg', phone: '+49 391 6054-6', email: 'info@aeksa.de', officeHours: 'Mo-Fr: 8:30 - 15:30 Uhr' } },
    { id: 'sh', data: { name: 'Ärztebüro Schleswig-Holstein', address: 'Bismarckallee 8-12, 23795 Bad Segeberg', phone: '+49 4551 803-0', email: 'info@aeksh.de', officeHours: 'Mo-Fr: 9:00 - 16:00 Uhr' } },
    { id: 'th', data: { name: 'Landesärztebüro Thüringen', address: 'Im Semmicht 33, 07751 Jena-Maua', phone: '+49 3641 614-0', email: 'info@laek-thueringen.de', officeHours: 'Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 13:00 Uhr' } },
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


export async function seedStateBureaus(): Promise<{ success: boolean; message: string }> {
    try {
        let createdCount = 0;
        let skippedCount = 0;

        for (const bureau of bureausToSeed) {
            const existing = await getStateBureauById(bureau.id);
            if (existing) {
                skippedCount++;
            } else {
                await createStateBureau(bureau.id, bureau.data);
                createdCount++;
            }
        }
        
        return { 
        success: true, 
        message: `Seeding complete. Created: ${createdCount} new state bureaus. Skipped: ${skippedCount} existing bureaus.` 
        };
    } catch (error) {
        console.error('Error seeding state bureaus:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Error seeding bureaus: ${errorMessage}` };
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

const historyToSeedForAsif: TrainingHistoryCreationData[] = [
  // This data is crafted to match the ZFD totals in the screenshot (97 points)
  // and the order of visible items.
  { date: "2025-05-22", title: "Modern Procedures in Implantology", category: "IMPL", points: 15, organizer: "Charité - Universitätsmedizin Berlin", zfdGroupId: 'berufsbezogen' },
  { date: "2025-05-15", title: "Digital Workflows in Medical Practice", category: "ZMK", points: 5, organizer: "Bundeszahnärztekammer (BZÄK)", zfdGroupId: 'berufsbezogen' },
  { date: "2025-05-03", title: "Advances in Periodontology", category: "PARO", points: 5, organizer: "Klinikum der Universität München (LMU)", zfdGroupId: 'berufsbezogen' },
  { date: "2025-04-20", title: "Current Trends in Orthodontics", category: "KFO", points: 10, organizer: "Deutsche Gesellschaft für Zahn-, Mund- und Kieferheilkunde (DGZMK)", zfdGroupId: 'berufsbezogen' },
  { date: "2025-04-10", title: "Webinar: New Materials in Prosthetics", category: "Literatur", points: 10, organizer: "Springer Medizin", zfdGroupId: 'literatur' },
  { date: "2025-03-28", title: "Practice Management and Communication", category: "Frei", points: 8, organizer: "Ärztebüro Berlin", zfdGroupId: 'frei' },
  { date: "2025-03-05", title: "Annual Subscription 'Medical Magazine'", category: "Literatur", points: 10, organizer: "Medical Tribune", zfdGroupId: 'literatur' },
  { date: "2025-02-25", title: "Implant Prosthetics for Advanced Practitioners", category: "IMPL", points: 10, organizer: "Universitätsklinikum Heidelberg", zfdGroupId: 'berufsbezogen' },
  { date: "2025-02-01", title: "Workshop: Legal Foundations", category: "Frei", points: 4, organizer: "Bundeszahnärztekammer (BZÄK)", zfdGroupId: 'frei' },
  { date: "2025-01-15", title: "Annual Subscription 'Quintessence Medicine'", category: "Literatur", points: 10, organizer: "Quintessenz Verlag", zfdGroupId: 'literatur' },
  { date: "2024-12-10", title: "Annual Subscription 'ZWR'", category: "Literatur", points: 10, organizer: "Thieme", zfdGroupId: 'literatur' },
];

const historyToSeedForSarah: TrainingHistoryCreationData[] = [
    { date: "2025-06-10", title: "Emergency Management in the Dental Office", category: "ZMK", points: 10, organizer: "Bundeszahnärztekammer (BZÄK)", zfdGroupId: 'berufsbezogen' },
    { date: "2025-05-20", title: "Pediatric Dentistry Update", category: "ZMK", points: 8, organizer: "Universitätsklinikum Heidelberg", zfdGroupId: 'berufsbezogen' },
    { date: "2025-04-18", title: "Advanced Endodontics Workshop", category: "ZMK", points: 12, organizer: "Charité - Universitätsmedizin Berlin", zfdGroupId: 'berufsbezogen' },
    { date: "2025-03-15", title: "Journal Club: Periodontology Research", category: "Literatur", points: 5, organizer: "Quintessenz Verlag", zfdGroupId: 'literatur' },
    { date: "2025-02-20", title: "Ethical Considerations in Dentistry", category: "Frei", points: 5, organizer: "Ärztebüro Berlin", zfdGroupId: 'frei' },
];

export async function seedTrainingHistory(): Promise<{ success: boolean; message: string }> {
    const usersToSeed = [
        { email: process.env.DENTIST2_EMAIL || 'adasd@asdas.com', history: historyToSeedForAsif, name: 'Asif Adidas' },
        { email: process.env.DENTIST_EMAIL || 'sarah.miller@example.com', history: historyToSeedForSarah, name: 'Sarah Miller' },
    ];

    const results = [];

    try {
        for (const { email, history, name } of usersToSeed) {
            const user = await findPersonByEmail(email);
            if (!user) {
                results.push(`User ${name} (${email}) not found. Skipped.`);
                continue;
            }

            const existingHistory = await getTrainingHistoryForUser(user.id);
            if (existingHistory.length > 0) {
                results.push(`Training history for ${name} already exists. Skipped.`);
                continue;
            }

            for (const record of history) {
                await addTrainingHistoryForUser(user.id, record);
            }

            const totalPoints = history.reduce((sum, record) => sum + record.points, 0);
            await updatePerson(user.id, { educationPoints: totalPoints });

            results.push(`Seeded ${history.length} records for ${name} (${totalPoints} points).`);
        }
        return { success: true, message: `Seeding complete. ${results.join(' ')}` };
    } catch (error) {
        console.error('Error seeding training history:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Error seeding history: ${errorMessage}` };
    }
}


export async function setSabineMuellerToPending(): Promise<{ success: boolean; message: string }> {
  const userEmail = process.env.DENTIST_EMAIL || 'sarah.miller@example.com';
  try {
    const user = await findPersonByEmail(userEmail);
    if (!user) {
      return { success: false, message: `User with email ${userEmail} not found. Please run "Seed Demo Users" first.` };
    }

    await updatePerson(user.id, { status: 'pending' });

    return { success: true, message: `Successfully set user ${userEmail} to pending status.` };

  } catch (error) {
    console.error(`Error setting user ${userEmail} to pending:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}

const usersToSeedForReps: { email: string; name: string; dentistId?: string; role: UserRole; stateBureauId: string; }[] = [
    { email: 'mark.weaver@example.com', name: 'Dr. Mark Weaver', dentistId: '78954', role: 'dentist', stateBureauId: 'hh' },
    { email: 'julia.smith@example.com', name: 'Dr. Julia Smith', dentistId: '65412', role: 'dentist', stateBureauId: 'hh' },
    { email: 'thomas.miller@example.com', name: 'Dr. Thomas Miller', dentistId: '34567', role: 'dentist', stateBureauId: 'hh' },
    { email: 'sarah.baker@example.com', name: 'Dr. Sarah Baker', dentistId: '23456', role: 'dentist', stateBureauId: 'hh' },
    { email: 'lucas.hoffman@example.com', name: 'Dr. Lucas Hoffman', dentistId: '78954', role: 'dentist', stateBureauId: 'hh' },
    { email: 'anna.taylor@example.com', name: 'Dr. Anna Taylor', dentistId: '65412', role: 'dentist', stateBureauId: 'hh' },
];

export async function seedUsersAndRepresentations(): Promise<{ success: boolean; message: string }> {
    try {
        let usersCreatedCount = 0;
        let representationsCreated = 0;

        const userMap = new Map<string, string>(); // email -> id
        const userNamesMap = new Map<string, string>(); // id -> name

        for (const userData of usersToSeedForReps) {
             let authUser;
            try {
                authUser = await adminAuth.getUserByEmail(userData.email);
            } catch (error: any) {
                if (error.code === 'auth/user-not-found') {
                    authUser = await adminAuth.createUser({ email: userData.email, password: 'Password123', displayName: userData.name });
                } else {
                    throw error;
                }
            }
            
            let person = await getPersonById(authUser.uid);
            if (!person) {
                const newPersonData: PersonCreationData = {
                    name: userData.name, email: userData.email, dentistId: userData.dentistId,
                    role: userData.role, status: 'active', region: 'Wien', stateBureauId: userData.stateBureauId,
                    otpEnabled: false, notificationSettings: { inApp: true, email: false },
                    avatarUrl: `https://avatar.vercel.sh/${userData.email}.png?size=100`,
                };
                await createPerson(authUser.uid, newPersonData, 'en');
                usersCreatedCount++;
                person = await getPersonById(authUser.uid);
            }

            if (person) {
                userMap.set(person.email, person.id);
                userNamesMap.set(person.id, person.name);
            }
        }
        
        const sarahMillerEmail = process.env.DENTIST2_EMAIL || 'adasd@asdas.com';
        const sarahMiller = await findPersonByEmail(sarahMillerEmail);
        if (!sarahMiller) {
            return { success: false, message: `Could not find Sarah Miller (${sarahMillerEmail}). Please seed demo users first.` };
        }
        userNamesMap.set(sarahMiller.id, sarahMiller.name);

        const representationsToCreate: RepresentationCreationData[] = [
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

        return { success: true, message: `Seeding complete. Created ${usersCreatedCount} new users and ${representationsCreated} representation records.` };
    } catch (error) {
        console.error('Error seeding users and representations:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Error seeding data: ${errorMessage}` };
    }
}


export async function seedDemoUsers(): Promise<{ success: boolean; message: string }> {
  try {
    const demoUsers = [
      { email: process.env.DENTIST_EMAIL, firstName: 'Sarah', lastName: 'Miller', role: 'dentist' as UserRole, dentistId: '12345', title: 'Dr.', stateBureauId: 'by' },
      { email: process.env.DENTIST2_EMAIL, firstName: 'Asif', lastName: 'Adidas', role: 'dentist' as UserRole, dentistId: '54321', title: 'Dr.', stateBureauId: 'nw' },
      { email: process.env.LK_MEMBER_EMAIL, firstName: 'Max', lastName: 'Sample', role: 'lk_member' as UserRole, dentistId: '54326', title: 'Dr.', stateBureauId: 'be' },
    ];

    let createdCount = 0;
    let skippedCount = 0;
    let notFoundInAuthCount = 0;

    for (const demoUser of demoUsers) {
      if (!demoUser.email) {
        console.warn(`Email not found in .env for a demo user, skipping.`);
        continue;
      }
      
      const existingPerson = await findPersonByEmail(demoUser.email);
      if (existingPerson) {
        skippedCount++;
        continue;
      }

      try {
        const authUser = await adminAuth.getUserByEmail(demoUser.email);
        
        const constructedName = [demoUser.title, demoUser.firstName, demoUser.lastName].filter(Boolean).join(' ');

        const personData: PersonCreationData = {
          name: constructedName,
          email: demoUser.email,
          role: demoUser.role,
          status: 'active',
          region: 'Wien',
          stateBureauId: demoUser.stateBureauId,
          dentistId: demoUser.dentistId,
          otpEnabled: false,
          notificationSettings: { inApp: true, email: false },
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          title: demoUser.title,
          avatarUrl: `https://avatar.vercel.sh/${demoUser.email}.png?size=100`,
        };

        await createPerson(authUser.uid, personData, 'en');
        createdCount++;
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.warn(`Auth user for ${demoUser.email} not found. Please run 'node firebase.auth.createDemoUsers.js' first. Skipping this user.`);
          notFoundInAuthCount++;
        } else {
          throw authError;
        }
      }
    }
    
    let message = `Seeding demo users complete. Created: ${createdCount}. Skipped: ${skippedCount}.`;
    if (notFoundInAuthCount > 0) {
        message += ` Could not find ${notFoundInAuthCount} user(s) in Firebase Auth. Please run 'node firebase.auth.createDemoUsers.js' to create them.`;
    }

    return { success: true, message };

  } catch (error) {
    console.error('Error seeding demo users:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error seeding demo users: ${errorMessage}` };
  }
}
