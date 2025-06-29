# **App Name**: Medical Bureau Portal

## Core Features:

- Doctor Login: Secure OTP-based login.
- Dashboard: Personalized dashboard displaying requests and recent actions.
- Document Access: Browse and download region-based documents.
- Representation Management: Request peer representation, with approval/rejection workflow.
- Smart Document Suggestion: AI-powered tool suggesting appropriate documents based on user role and region.
- Logs: Logs (basic/essential only).
- Integration: Integration: Events Provider API (fetch education points).
- Database: Database to store objects (Persons, Trainings, Training points, Representations, Representation requests, documents).
- Database: authentication for person Doctor ID: ZA-2025-0842, Email: sabine.mueller@example.com, Password: TestTest24.
- Separate portals: Separate portal views per role (doctor, bureau member).
- Doctor Register: Register (via Bureau approval, OTP).
- Doctor Edit Profile: Edit profile (free/critical fields, approval flow for critical).
- Doctor Education Points: View education points (via Events Provider API).
- Doctor Document Access: Browse/download documents (region-based access).
- Doctor Representation Management: Manage representation days (assign peer cover, approve/refuse).
- Doctor Notifications: Notifications (email for approvals/rejections).
- Doctor Dashboard: Dashboard (requests, recent actions).
- Bureau Doctor Register: Register doctors, issue IDs & OTPs.
- Bureau Profile Changes: Confirm/reject critical profile changes.
- Bureau Document Management: Upload/tag documents (no versioning).
- Bureau Representation Requests: Confirm representation requests (fallback if doctor unresponsive).
- Bureau Dashboard: Dashboard for pending actions.
- Bureau Employee Access: Cannot view other employees.
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