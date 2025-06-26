
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
2.  **Enable Gemini API**: This project uses Genkit for AI features. You must enable the "Vertex AI API" (which includes Gemini) in your Google Cloud Platform console. You can usually find a link to this in your Firebase project settings or by searching for it in the GCP console associated with your Firebase project.
3.  **Upgrade to Blaze Plan**: To use Firebase Extensions (like the email trigger) and GenAI capabilities, you must upgrade your project to the "Blaze (Pay-as-you-go)" plan. You can do this from the settings in the lower-left corner of your Firebase project dashboard.

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
    *   (Optional) You can manually create the folder structure (`users`, `document_templates`, `logos`) in the Storage bucket via the console.

### Step 6: Set Up Environment Variables

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

### Step 7: Deploy Email Extension

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


### Step 8: Deploy and Seed the Database

Once your environment is deployed and running:

1.  Navigate to the `/developer` page in your deployed application.
2.  In the "Database Seeding" section, click the following buttons **in order**:
    *   **Seed ZFD Groups**: Creates the core groups for continuing education points.
    *   **Seed Training Categories**: Populates the different types of training.
    *   **Seed Training Organizers**: Adds a list of known training organizers.
    *   **Seed State Chambers**: Populates the contact information for the state chambers.
3.  The other seed buttons (`Seed Training History`, `Seed Representations`) are for creating test data and should **not** be used in a production environment.
