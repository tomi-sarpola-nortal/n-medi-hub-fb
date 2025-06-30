
Date: 2024-05-28

# Firebase Studio

This is a NextJS starter template for building applications with Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## New Environment Setup Guide

This guide provides step-by-step instructions for deploying this application to a new environment (e.g., staging or production).

### Step 1: Prerequisites

1.  **Install Node.js**: Ensure you have a recent version of Node.js installed.
2.  **Install Firebase CLI**: Open your terminal and install the Firebase Command Line Interface globally.
    ```bash
    npm install -g firebase-tools
    ```
3.  **Login to Firebase**: Log in to your Google account using the CLI.
    ```bash
    firebase login
    ```
    Follow the on-screen instructions to authenticate in your browser.

### Step 2: Firebase Project Setup

1.  **Create Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Upgrade to Blaze Plan**: To use Firebase Extensions (like the email trigger), you must upgrade your project to the "Blaze (Pay-as-you-go)" plan. You can do this from the settings in the lower-left corner of your Firebase project dashboard.

### Step 3: Local Project Setup

1.  **Clone the Repository**: Get the project code onto your local machine.
2.  **Install Dependencies**: Navigate to the project directory in your terminal and run:
    ```bash
    npm install
    ```

### Step 4: Initialize Firebase in Your Project

1.  **Initialize Firestore & Storage**: In your project's root directory, run the following command, replacing `<YOUR_PROJECT_ID>` with your actual Firebase project ID.
    ```bash
    firebase init firestore storage --project <YOUR_PROJECT_ID> --non-interactive
    ```
    This command will use the `firebase.json`, `firestore.rules`, and `storage.rules` files from this repository to configure your project.

### Step 5: Configure Firebase Services (In Console)

1.  **Authentication**:
    *   In the Firebase Console, go to **Build > Authentication**.
    *   Click "Get started".
    *   Select **Email/Password** from the list of providers, enable it, and save.

2.  **Firestore Database**:
    *   Go to **Build > Firestore Database**.
    *   Click "Create database".
    *   Choose to start in **Production mode**.
    *   Select a location (e.g., `eur3` as specified).
    *   Click "Enable".

3.  **Storage**:
    *   Go to **Build > Storage**.
    *   Click "Get started" and follow the prompts to enable it.
    
### Step 6: Deploy Firestore Indexes

The application requires several composite indexes in Firestore for optimal query performance. The definitions for these indexes are located in the `firestore.indexes.json` file at the root of the project.

To create these indexes in your Firebase project, run the following command from your terminal:

If you haven't set a default Firebase project for your local environment, you may need to run `firebase use --add` first. See the [Firebase CLI documentation](https://firebase.google.com/docs/cli#project_aliases) for more details on managing projects.

```bash
firebase deploy --only firestore:indexes
```
This command only needs to be run once, or whenever the `firestore.indexes.json` file is updated.

### Step 7: Install Firebase Admin SDK and seed Storage

Make sure you have the FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variables set correctly in your environment (e.g., in your .env file)

To run the script for creating Storage folders, you need to install the Firebase Admin SDK:

```bash
    npm install firebase-admin
```
Install dotenv package that loads environment variables from a .env file into process.env.


```bash
    npm install dotenv
```
You can create the folder structure (`users`, `document_templates`, `logos`) in the Storage bucket via the console or execute the script using Node.js:

```bash
    node firebase.storage.setupFolders.js
```


The application connects to Firebase using environment variables.

1.  **Copy the Template**: In your project's root directory, make a copy of `.env.example` and rename it to `.env`.
2.  **Get Client-Side Keys**:
    *   In your Firebase project, go to **Project Settings** (gear icon) > **General**.
    *   Scroll down to "Your apps" and click the `</>` icon to create or view your Web App.
    *   Under "Firebase SDK snippet", select **Config**.
    *   Copy the values from this config object into the corresponding `NEXT_PUBLIC_*` variables in your `.env` file.
3.  **Get Server-Side (Admin) Keys**:
    *   In Project Settings, go to the **Service Accounts** tab.
    *   Click **Generate new private key** and confirm. A JSON file will be downloaded.
    *   Open the JSON file and copy the following values into your `.env` file:
        *   `project_id` -> `FIREBASE_PROJECT_ID`
        *   `client_email` -> `FIREBASE_CLIENT_EMAIL`
        *   `private_key` -> `FIREBASE_PRIVATE_KEY`
    *   **Important**: The `private_key` contains newline characters (`\n`). You must wrap the entire key in double quotes (`"`) to ensure it's parsed correctly.

### Step 8: Deploy Email Extension

This application uses the "Trigger Email" Firebase Extension to send emails.

1.  Go to the [Trigger Email Extension Page](https://firebase.google.com/products/extensions/firebase-email-generator) and click "Install in Firebase console".
2.  Select your new Firebase project.
3.  Follow the on-screen installation steps. You will need to:
    *   Provide your SMTP server's details (e.g., from SendGrid, Mailgun, or another provider).
    *   Leave the `Mail Collection` setting as the default (`mail`).

#### Important: Authenticating Your Sending Domain (SPF & DKIM)

The error message `Sender is unauthenticated` indicates that your email provider (like Gmail, Outlook) is rejecting emails because it cannot verify they are legitimately coming from your domain. To fix this, you must configure **SPF** and **DKIM** records in your domain's DNS settings.

*   **What are they?** SPF (Sender Policy Framework) and DKIM (DomainKeys Identified Mail) are DNS records that prove to mail servers that your SMTP provider (e.g., SendGrid, Mailgun) is authorized to send emails on your behalf.
*   **How to fix it:** Your SMTP provider will give you the specific DNS records (usually TXT or CNAME records) that you need to add to your domain's DNS settings (where you manage your domain, like GoDaddy, Namecheap, Cloudflare, etc.).

Please consult the documentation for your specific SMTP provider for instructions:
*   [SendGrid Instructions](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)
*   [Mailgun Instructions](https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain)
*   [Brevo (formerly Sendinblue) Instructions](https://help.brevo.com/hc/en-us/articles/200227202-Authenticate-your-domain-to-improve-the-deliverability-of-your-emails-SPF-DKIM-DMARC-)

**This step is mandatory for reliable email delivery.** Without it, your emails will likely be marked as spam or blocked entirely.


### Step 9: Deploy and Seed the Database

Once your environment is deployed and running:

1.  Navigate to the `/developer` page in your deployed application.
2.  In the "Database Seeding" section, click the following buttons **in the specified order** to set up the application with essential data and test users.

    **Core Data (Required for basic functionality):**
    *   **Seed ZFD Groups**: Creates the core groups for continuing education points.
    *   **Seed Training Categories**: Populates the different types of training.
    *   **Seed Training Organizers**: Adds a list of known training organizers.
    *   **Seed State Bureaus**: Populates the contact information for the state bureaus.

    **Test Data (For demonstration purposes):**
    *   **Seed Demo Users**: Creates the primary demo users and assigns them to state bureaus. **This must be run before seeding history or representations.**
    *   **Seed Training History**: Populates the training history for the demo users.
    *   **Seed Other Users & Reps**: Creates additional test users and populates representation data for the demo users.
3.  The test data buttons should **not** be used in a production environment.

### Step 10: Seed Firebase Auth

Create the three demo users in your Firebase Authentication. If the users already exist, it might throw an error

```bash
    node firebase.auth.createDemoUsers.js
```
