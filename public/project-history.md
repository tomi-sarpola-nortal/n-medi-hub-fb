# Project History and Implemented Features

This document provides a summary of the features that have been implemented in the Zahn Aerzte Kammer V6 portal.

## Core Implemented Features

### User Authentication & Roles
- **Secure Login:** A robust login system for dentists and other user roles.
- **Role-Based Portals:** Separate views and navigation for `dentist` and `lk_member` (Landeskammer Member) roles.
- **Registration Flow:** A comprehensive, multi-step registration process for new dentists, including data collection for personal, professional, and practice information, along with document uploads.
- **Pending User State:** New users are in a "pending" state after registration. They can log in to view their submitted data on the settings page but cannot access other parts of the portal until approved by an LK member.

### Dentist Portal
- **Dashboard:** Personalized dashboard displaying key information and pending actions.
- **Education Points:** View education points and progress towards ZFD and specialist diplomas. (Currently using mock data, API integration pending).
- **Representation Management:** Manage representation days with an approval/rejection workflow (assign peer cover, approve/refuse). (Currently using mock data).
- **Document Access:** Browse and download region-based documents and templates.
- **Profile Management:** Dentists can view and edit their profile information via the Settings page.

### Landeskammer (LK) Member Portal
- **LK Dashboard:** A dashboard highlighting pending actions, primarily member reviews.
- **Member Overview:** A full list of all registered members, with filtering and search capabilities.
- **Member Review Workflow:** LK members can review new registrations, view all submitted data and documents, and then `approve`, `reject`, or `deny` the application. Approved members get a Dentist ID and become active.

### Technical & System Features
- **Internationalization (i18n):** Support for English (`en`) and German (`de`) languages, with URL-based routing and a language switcher.
- **Firestore Database:** Utilizes Firestore for storing all major data objects including Persons, State Chambers, and Training information.
- **Database Seeding:** A developer module exists to seed the database with initial data for categories, organizers, state chambers, and mock user history.
- **State Chambers:** A dedicated `state_chambers` collection stores information for all nine Austrian chambers. Each dentist is linked to a state chamber, with Vienna as the default.

## Feature Examples from PRD

- **Dashboard:** Personalized dashboard displaying requests and recent actions.
- **Dentist Education Points:** View education points (via Events Provider API).
- **Dentist Representation Management:** Manage peer representation days with approval/rejection workflow (assign peer cover, approve/refuse).
