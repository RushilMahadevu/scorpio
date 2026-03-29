# 📊 Scorpio Platform: Capability Gap Analysis

This document outlines the missing features and technical infrastructure required to transition Scorpio from a functional MVP to a production-ready, enterprise-grade educational platform. Features are ranked by **Severity** (Impact on Launch, Legal, and Core Utility).

---

## 🔴 Severity: Critical (Blockers for Launch & Scale)
*These features are essential for legal compliance, data security, and system stability in a real-world classroom environment.*

### 3. Hardened Multi-Tenant Isolation
*   **Gap:** Organization-level data isolation is currently handled via soft application logic.
*   **Solution:** Strict Firestore Security Rules that verify `organizationId` via **Firebase Custom Claims**, ensuring zero "leakage" between separate school districts.
*   **Impact:** Data privacy and institutional trust.

## 🟡 Severity: Medium (Scalability & Engagement)
*Features that improve the day-to-day experience for teachers and administrators.*

### 7. Real-time Notification Engine
*   **Gap:** Students must constantly refresh to see new assignments or grades.
*   **Solution:** In-app and Email notifications for: "Assignment Due in 24h", "Grade Posted", and "AI Tutor Feedback Available".
*   **Impact:** Student engagement and timely submissions.

### 8. Student Peer-Review Workflow
*   **Gap:** Communication is strictly Student-to-AI or Student-to-Teacher.
*   **Solution:** Anonymous peer-review stages where students critique each other's derivations based on the teacher's rubric before final submission.
*   **Impact:** Collaborative learning and reduced teacher grading load.
 