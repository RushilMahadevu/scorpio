# Project Scorpio Roadmap

This document outlines the development roadmap for the Scorpio SRS (Student Response System) platform. Priorities are based on user value, security requirements, and technical stability.

## 🔴 Now (Phase 1: Security, Stability & Core Infrastructure)
*Focus: Hardening the application architecture and ensuring secure, reliable access.*

### 1. Server-Side Rate Limiting
- **Description:** Move the AI rate limiting logic from client-side `localStorage` (currently in `NavigationChatbot`) to Next.js Middleware or Firebase Functions.
- **Rationale:** Client-side rate limiting is easily bypassed. Moving this to the server ensures cost control for LLM APIs and prevents abuse.

### 2. Robust Role-Based Access Control (RBAC)
- **Description:** Implement strict middleware protection for all `/teacher/*` routes to ensure no leaked data or unauthorized access by student accounts.
- **Rationale:** Security is critical for educational data. Frontend routing checks are insufficient; backend enforcement is required.

### 3. Dynamic AI Context Management
- **Description:** Refactor the `NavigationChatbot` to load its system prompt and navigation paths from a configuration file or Firestore, rather than hardcoded strings.
- **Rationale:** Allows updating the chatbot's knowledge base (e.g., adding new features or changing routes) without requiring a full code deployment.

### 4. CI/CD Pipeline Setup
- **Description:** Configure GitHub Actions to run `jest` tests and linting on every pull request.
- **Rationale:** Prevents regressions and maintains code quality as the team scales.

---

## 🟡 Next (Phase 2: Core AI & Engagement Features)
*Focus: Delivering the unique value propositions of the platform.*

### 1. AI Assignment Generator
- **Description:** Fully implement the backend logic for `/teacher/create` to generate physics problems based on specific topics and difficulty levels using the LLM integration.
- **Rationale:** This is a key differentiator for teachers, saving them significant time in curriculum planning.

### 2. Interactive Physics Tutor
- **Description:** Develop the `/student/tutor` experience. This should be a scaffolded chat interface that guides students to answers rather than just solving problems for them.
- **Rationale:** Provides immediate support to students, increasing engagement and learning outcomes.

### 3. Real-time Grade Notifications
- **Description:** Use Firestore real-time listeners to trigger UI notifications when a teacher grades a submission.
- **Rationale:** Improves the feedback loop for students.

### 4. Analytics Dashboard
- **Description:** Implement data visualization for `/teacher` to show class performance trends, assignment completion rates, and common struggle points.
- **Rationale:** Gives teachers actionable insights to adjust their instruction.

---

## 🟢 Later (Phase 3: Scale, Polish & Ecosystem)
*Focus: Expanding the platform's reach and user experience.*

### 1. Gamification System
- **Description:** Add streaks, badges, and experience points (XP) for completing assignments and using the tutor.
- **Rationale:** Increases student motivation and retention.

### 2. Offline Support (PWA)
- **Description:** Configure Next.js PWA features to allow students to view downloaded resources or assignments without an active internet connection.
- **Rationale:** Improves accessibility for students with unstable internet.

### 3. LMS Integration
- **Description:** Add support for syncing rosters and grades with Google Classroom or Canvas.
- **Rationale:** Reduces friction for adoption by schools already using these systems.

### 4. Dark Mode & UI Theming
- **Description:** Implement a system-wide dark mode toggle using `tailwind` and `next-themes`.
- **Rationale:** A standard user expectation that improves accessibility and reduces eye strain.
