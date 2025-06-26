Date: 2024-05-28

# Firebase Studio

This is a NextJS starter template for building applications with Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Deployment Guide

This guide provides step-by-step instructions for deploying this application to a new environment (e.g., staging or production).

### Step 1: Create a New Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click "Add project" and follow the on-screen instructions to create a new project.
3.  Once created, you will be taken to the project's dashboard.

### Step 2: Configure Firebase Services

You need to enable and configure three core Firebase services.

#### A. Enable Authentication

1.  In the left sidebar, go to **Build > Authentication**.
2.  Click "Get started".
3.  Under the "Sign-in method" tab, select **Email/Password** from the list of providers.
4.  Enable it and click "Save".

#### B. Create Firestore Database

1.  In the left sidebar, go to **Build > Firestore Database**.
2.  Click "Create database".
3.  Choose to start in **Production mode**.
4.  Select a location for your database (choose one close to your users).
5.  Click "Enable".

#### C. Enable Storage

1.  In the left sidebar, go to **Build > Storage**.
2.  Click "Get started".
3.  Follow the on-screen prompts to set up your default storage bucket.

### Step 3: Set Up Environment Variables

The application connects to Firebase using environment variables.

1.  **Copy the Template**: In your project's root directory, make a copy of `.env.example` and rename it to `.env`.
2.  **Get Client-Side Keys**:
    *   In your Firebase project, go to **Project Settings** (gear icon) > **General**.
    *   Scroll down to "Your apps" and find your Web App.
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

### Step 4: Install and Configure Email Extension

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


### Step 5: Deploy and Seed the Database

Once your environment is deployed and running:

1.  Navigate to the `/developer` page in your deployed application.
2.  In the "Database Seeding" section, click the following buttons **in order**:
    *   **Seed ZFD Groups**: Creates the core groups for continuing education points.
    *   **Seed Training Categories**: Populates the different types of training.
    *   **Seed Training Organizers**: Adds a list of known training organizers.
    *   **Seed State Chambers**: Populates the contact information for the state chambers.
3.  The other seed buttons (`Seed Training History`, `Seed Representations`) are for creating test data and should **not** be used in a production environment.
