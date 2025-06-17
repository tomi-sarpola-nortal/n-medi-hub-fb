# **App Name**: Zahn Aerzte Kammer V6

## Core Features:

- Dentist Login: Secure OTP-based login.
- Dashboard: Personalized dashboard displaying requests and recent actions.
- Document Access: Browse and download region-based documents.
- Representation Management: Request peer representation, with approval/rejection workflow.
- Smart Document Suggestion: AI-powered tool suggesting appropriate documents based on user role and region.
- Logs: Logs (basic/essential only).
- Integration: Integration: Events Provider API (fetch education points).
- Database: Database to store objects (Persons, Trainings, Training points, Representations, Representation requests, documents).
- Database: authentication for person Dentist ID: ZA-2025-0842, Email: sabine.mueller@example.com, Password: TestTest24.
- Separate portals: Separate portal views per role (dentist, landeskammer member).
- Dentist Register: Register (via LK approval, OTP).
- Dentist Edit Profile: Edit profile (free/critical fields, approval flow for critical).
- Dentist Education Points: View education points (via Events Provider API).
- Dentist Document Access: Browse/download documents (region-based access).
- Dentist Representation Management: Manage representation days (assign peer cover, approve/refuse).
- Dentist Notifications: Notifications (email for approvals/rejections).
- Dentist Dashboard: Dashboard (requests, recent actions).
- LK Dentist Register: Register dentists, issue IDs & OTPs.
- LK Profile Changes: Confirm/reject critical profile changes.
- LK Document Management: Upload/tag documents (no versioning).
- LK Representation Requests: Confirm representation requests (fallback if dentist unresponsive).
- LK Dashboard: Dashboard for pending actions.
- LK Employee Access: Cannot view other employees.
- Language selections: English, German.

## Style Guidelines:

- White `#FFFFFF` (68%)
- Teal `#BEE5E8` (15%)
- Light grey `#F5F5F5` (7%)
- Red `#E33A2B` (5%)
- Charcoal `#333333` (5%)
- Body font: 'Inter', sans-serif.
- Headline font: 'Space Grotesk' (sans-serif).
- Use Material Design icons.
- Implement a clean, card-based layout for displaying information, enhancing usability and visual appeal.