const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables from .env

// Replace with your Firebase Admin SDK credentials
// Ensure you have the FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY
// environment variables set, or replace with your actual credentials object.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline characters
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createDemoUsers() {
  const dentistEmail = process.env.DENTIST_EMAIL;
  const dentistPassword = process.env.DENTIST_PASSWORD;
  const dentistEmail2 = process.env.DENTIST2_EMAIL;
  const dentistPassword2 = process.env.DENTIST2_PASSWORD;
  const lkMemberEmail = process.env.LK_MEMBER_EMAIL;
  const lkMemberPassword = process.env.LK_MEMBER_PASSWORD;

  if (!dentistEmail || !dentistPassword || !dentistEmail2 || !dentistPassword2 || !lkMemberEmail || !lkMemberPassword) {
    console.error('Please ensure DENTIST_EMAIL, DENTIST_PASSWORD, LK_MEMBER_EMAIL, and LK_MEMBER_PASSWORD are set in your environment variables (e.g., in your .env file).');
    process.exit(1);
  }

  try {
    // Create Dentist User
    await admin.auth().createUser({
      email: dentistEmail,
      password: dentistPassword,
    });
    console.log(`Successfully created dentist user: ${dentistEmail}`);

    // Create Dentist User 2
    await admin.auth().createUser({
      email: dentistEmail2,
      password: dentistPassword2,
    });
    console.log(`Successfully created dentist user: ${dentistEmail2}`);

    // Create LK Member User
    await admin.auth().createUser({
      email: lkMemberEmail,
      password: lkMemberPassword,
    });
    console.log(`Successfully created LK member user: ${lkMemberEmail}`);

  } catch (error) {
    console.error('Error creating demo users:', error);
    // You might want to handle specific errors, e.g., auth/email-already-exists
  }
}

createDemoUsers();
