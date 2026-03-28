# 📊 Scorpio Platform: Capability Gap Analysis

This document outlines the missing features and technical infrastructure required to transition Scorpio from a functional MVP to a production-ready, enterprise-grade educational platform. Features are ranked by **Severity** (Impact on Launch, Legal, and Core Utility).

---

## 🔴 Severity: Critical (Blockers for Launch & Scale)
*These features are essential for legal compliance, data security, and system stability in a real-world classroom environment.*

### 1. FERPA/COPPA Infrastructure (PII Scrubbing)
*   **Gap:** Current AI interactions send raw student data (submissions/essays) to external LLMs.
*   **Solution:** A middleware layer that uses Regex and Named Entity Recognition (NER) to scrub names, emails, and student IDs from text before it reaches Google Vertex/Gemini.
*   **Impact:** Legal requirement for school contracts in the US and EU.

### 2. Asynchronous Grading Pipeline
*   **Gap:** Synchronous AI grading via Server Actions causes timeouts (>10s) and a poor UX.
*   **Solution:** Transition to a "Job Queue" model: Submission → Firestore Trigger → Cloud Function (Background Grading) → Real-time UI update via `onSnapshot`.
*   **Impact:** System reliability and scalability.

### 3. Hardened Multi-Tenant Isolation
*   **Gap:** Organization-level data isolation is currently handled via soft application logic.
*   **Solution:** Strict Firestore Security Rules that verify `organizationId` via **Firebase Custom Claims**, ensuring zero "leakage" between separate school districts.
*   **Impact:** Data privacy and institutional trust.

---

## 🟠 Severity: High (Core Platform Utility)
*These features represent the standard expectations for a modern Learning Management System (LMS).*

### 4. Shared Physics Asset Library (The "Network")
*   **Gap:** Teachers cannot easily share high-quality assignments with colleagues in their department.
*   **Solution:** A "Network Repository" where assets can be published to an organization. Includes "Forking" logic so teachers can customize shared problems without affecting the original.
*   **Impact:** Viral growth within organizations and reduced teacher friction.

### 5. LMS Integration (LTI 1.3 Lite)
*   **Gap:** Teachers have to manually invite students or manage separate rosters from Canvas/Schoology.
*   **Solution:** Implementation of LTI 1.3 (Common Cartridge) to allow Scorpio assets to be embedded directly into major LMS platforms.
*   **Impact:** Ease of adoption for large institutional buyers.

### 6. Longitudinal Student Analytics
*   **Gap:** Grading is currently "per-assignment" with no way to track conceptual mastery over time.
*   **Solution:** A dashboard that aggregates "Pedagogical Waypoint" data to show which specific physics concepts (e.g., Kinematics, Thermodynamics) a student is struggling with across the whole semester.
*   **Impact:** Differentiation and improved learning outcomes.

---

## 🟡 Severity: Medium (Scalability & Engagement)
*Features that improve the day-to-day experience for teachers and administrators.*

### 7. Real-time Notification Engine
*   **Gap:** Students must constantly refresh to see new assignments or grades.
*   **Solution:** In-app and Email notifications for: "Assignment Due in 24h", "Grade Posted", and "AI Tutor Feedback Available".
*   **Impact:** Student engagement and timely submissions.

### 8. Parent/Guardian Access Portal
*   **Gap:** Parents have no visibility into student progress without student login credentials.
*   **Solution:** A restricted, read-only view for guardians to monitor grades, missing work, and AI-generated "Portfolio Insights".
*   **Impact:** Transparency and support for student learning.

### 9. Bulk Roster Sync (Google Classroom/CSV)
*   **Gap:** Manual class creation and code entry is tedious for sessions with 100+ students.
*   **Solution:** Direct API integration with Google Classroom Roster API for one-click enrollment.
*   **Impact:** Frictionless onboarding for large schools.

---

## 🟢 Severity: Low (Polish & Differentiation)
*Nice-to-have features that provide a competitive advantage and "Wow" factor.*

### 10. Mastery-Based Gamification
*   **Gap:** The platform feels purely academic and lacks motivational loops.
*   **Solution:** Badges for "Physics Ninja" (fast correct responses), "Socratic Master" (asking high-quality questions), and streaks.
*   **Impact:** Student retention and "fun" factor.

### 11. White-Label Institutional Branding
*   **Gap:** The platform is always branded as "Scorpio".
*   **Solution:** Allow organizations to upload their own logos and primary colors for a branded sub-domain (e.g., `school-name.scorpio.network`).
*   **Impact:** Premium feel for private school contracts.

### 12. Student Peer-Review Workflow
*   **Gap:** Communication is strictly Student-to-AI or Student-to-Teacher.
*   **Solution:** Anonymous peer-review stages where students critique each other's derivations based on the teacher's rubric before final submission.
*   **Impact:** Collaborative learning and reduced teacher grading load.
