# Project Demo Overview: Firebase Studio and ÖZÄK Web Application

## 1. Introduction and Project Context

This document provides an overview of our ongoing project to develop a web application for the **Austrian Dentist Chamber (ÖZÄK)** using **Firebase Studio**.

The project commenced on June 4th, with a team of 2 participants nominated for the Skunkworks AI project at Nortal.
Skunkworks AI project goal is to evaluate new ideas and to enable radical innovation of tools and methods for engineering.
Our project objective was to evaluate whether Firebase Studio can significantly enhance our operational efficiency. 
Specifically, we aimed to determine if it can:
- Increase Profit: By leveraging Firebase Studio, we hope to boost our profitability through improved project outcomes and streamlined processes.
- Shorten Development Time: One of our key objectives is to reduce the development time required for our projects. Initially estimated at 310 man-working-days, we are keen to see if Firebase Studio can help us achieve this in a shorter timeframe.
- Reduce Overall Cost: Cost efficiency is another critical factor. We are evaluating if Firebase Studio can bring down the overall project costs to a competitive level, making our operations more financially sustainable.


Customer requested a web application of small to medium complexity for the **Austrian Dentist Chamber (ÖZÄK)**.
Development team had initially estimated the project effort to 310 man-working-days.

## 2. Our Development Process with Firebase Studio

Our process began with a brief kick-off session to introduce customer challenge and objective to Skunkworks AI team.
Then followed with in-depth learning of Firebase features and the creation of early prototypes to understand the platform's capabilities.
Firebase Studio is a cloud-based development environment designed to help you build and ship production-quality full-stack applications.
Firebase Studio integrates Project IDX with specialized generative AI agents and assistance from Gemini APIs to provide a collaborative workspace operated with natural language commands.

- **Prototyping & Evaluation:** We developed 13 distinct projects to evaluate various aspects, including front-end, UI stack, and back-end functionalities.
- **Current Development Environment:** This specific project, which serves as our primary development environment, is **front-end version 6**.
- **Staging & Production Strategy:** Our recommendation for handling staging and production environments is to replicate the development workspace to new project workspaces via GitHub, and then configure Firebase Application Hosting for these separate environments.
- **Feature Scope:** The customer provided 31 distinct feature requirements, encompassing critical functionalities such as:
    - Authorization and Role-Based Database Access
    - Comprehensive User Interfaces
    - Action Dashboards
    - Appointment Bookings
    - Training History Management
    - Activity KPIs
    - Robust Audit Logging
    - An API for connecting to additional user information
- **Development Approach Evaluation:** We explored various development methodologies, including importing designs from Figma, generating apps from plain verbal descriptions, and using a combination of Figma images with verbal descriptions. Our findings recommend the **Figma image combined with verbal description** as the most effective starting point.
- **Reproducing Our Process:** Developers can replicate our successful workflow by following these steps:
    1. Create a new project in [Firebase Studio](https://studio.firebase.google.com/).
    2. Provide the initial prompt and the Figma image from "Onenote Prompt for V6".
    3. Review and update the prototyper plan documented in "Onenote Prototyper plan for V6".
    4. Review and compare the generated output against "Onenote Prototyper output V6".
    5. Extract and refine requirements from the "WBS ÖZÄK 2.xlsx" project file.
    6. Integrate additional design elements from the Figma URL: https://www.figma.com/design/M0wUpnRCI9QIi03ayJ9e81/%C3%96Z%C3%84K-Proposal.

## 3. Project Status

After approximately **two weeks of dedicated work**, the application is currently **60% complete**.

## 4. Findings and Recommendations

Our experience with Firebase Studio's prototyper has yielded significant insights:

- **Efficiency & Scalability:** The Firebase Studio prototyper has proven to be highly efficient, capable of generating features for large-scale applications. It effectively utilizes a wide array of boilerplate architectures and patterns, particularly for Next.js development.
- **Integration Capabilities:** Many complex integrations were successfully implemented through simple verbal commands within the Prototyper environment, highlighting its powerful AI capabilities.
- **Pair Programming Limitations:** A current limitation is the inability to conduct traditional pair programming, as the workspace supports only one prompt session at a time.
    - **Recommendation:** We recommend adopting a shift-based approach, where one individual focuses on development while another handles testing.
- **Code Replication for Testing:** To facilitate robust testing, it is recommended to replicate the codebase to a separate project workspace.
    - **Important Note:** It's crucial to understand that the prototyper functionality is **not available** in project workspaces created based on existing GitHub repositories. Therefore, testing workspaces should be established independently.
- **Integration development:** . Integrations and backend functions was not succesful using Firebase Studio Prototyper. We ended up building separate project for backend. Stack chosen for backend was Java. Firebase Studio and Gemini code assist was not useful in the development of backend.
    - **Recommendation:** Utilize external tool like Claude on desktop to develop Cloud Function on desktop. Claude impressions: TODO@Mohamed . Senior backend developer is needed still for app project to configure and develop backend features.

# Project IDX is now part of Firebase Studio
Stay organized with collections Save and categorize content based on your preferences.

As part of our mission to provide developers with a comprehensive suite of tools for building and publishing high-quality, full-stack apps, we're excited to announce that Project IDX is now part of Firebase Studio.

[Firebase Studio](/docs/studio) is an agentic, cloud-based development environment that gives you powerful tools and AI agents directly in your browser. With Firebase Studio, you can prototype, build, test, publish, and iterate on full-stack AI apps from a single place.

---

## Presentation Proposal: ÖZÄK Web App with Firebase Studio

### Target Audience
Stakeholders, potential clients, development teams evaluating Firebase Studio.

### Duration
Approximately 15-20 minutes (flexible).

### Objective
- To demonstrate the capabilities and efficiency of Firebase Studio in developing complex web applications.
- To showcase the current progress of the ÖZÄK web application.
- To present our findings and recommendations regarding Firebase Studio's impact on development.

### Key Message
Firebase Studio significantly enhances development speed, cost-effectiveness, and feature delivery for modern web applications.

### Presentation Outline

#### 1. Introduction (2 min)
- Brief overview of the ÖZÄK web application project.
- Context of the Skunkworks AI project and the core objective: evaluate Firebase Studio for profit, time, and cost optimization.
- Initial project scope (310 man-working-days estimate).

#### 2. Our Development Journey with Firebase Studio (5-7 min)
- **Iterative Prototyping:** Highlight the 13 prototype projects and the learning curve.
- **Current State:** Introduce "Front-end Version 6" as the main development environment.
- **Staging/Production Strategy:** Briefly explain the recommended GitHub replication and Firebase Application Hosting approach.
- **Feature Richness:** Emphasize the 31 customer requirements (Authorization, Role-Based Access, Dashboards, Booking, Training History, KPIs, Audit Logging, API).
- **Optimized Development Approach:** Discuss the evaluation of different prompting methods and the recommendation for Figma image + verbal description.
- **Reproducibility:** Briefly mention how others can replicate the process using the documented steps (Firebase Studio project creation, Figma prompts, Onenote plans, WBS, Figma link).

#### 3. Current Project Status (1 min)
- "60% complete after two weeks of work" - emphasize rapid progress and efficiency.

#### 4. Key Findings and Recommendations (5 min)
- **Efficiency & Scalability:** 
    - Firebase Studio is abile to produce large-scale features and leverage Next.js boilerplate code.
- **AI-Powered Integrations:** 
    - Partially able to use with verbal commands for complex integrations.
    - Able to manage NoSQL database collections, indexes, queries, data seed scripts.
    - Issue: Integration of Cloud Functions, Auth, Storage not succesful with verbal commands.
    - Recommendation: Utilize Firebase Console wizards and templates for integration deployments.
    - Issue: AI interface becomes very slow when project grows. 
    - Recommendation: Manage project size by separating test suite and deployment artifacts to own projects. Occasionally clear the prompt history using /clear. Upgrade subscription to increase token limits.
- **Pair Programming Limitation & Solution:**
    - Issue: Single prompt session in workspace. Not possible to have two users doing changes.
    - Recommendation: Shift-based development approach. Role based development where one individual focuses on development while another handles testing.
- **Testing Workflow & Workspace Management:**
    - Recommendation: Replicate code to separate project workspaces for testing.
    - **Crucial Note:** Prototyper functionality is *not available* in project workspaces created based on existing GitHub repositories.

#### 5. Demo (Optional, 5-10 min - depending on time allocation)
- Live demonstration of the current ÖZÄK web application (if applicable).
- Highlight key implemented features (e.g., user authentication flow, dashboard elements, a specific data entry/view).
- Showcase responsiveness and functionality.

#### 6. Q&A / Discussion (Remaining Time)

### Suggested Visual Aids
- Screenshots of Firebase Studio interface (prompts, generated code).
- Screenshots/live demo of the ÖZÄK web app (current state and comparison with target Figma designs).
- Simple flowcharts or bullet points to illustrate process steps and key findings.
- Graphs to show estimated time savings or cost reduction (if data is available).
