# 🌐 Scorpio: Physics Teacher Network Roadmap

This document outlines the transition of Scorpio into a teacher-centric LMS that supports individual practitioners, small physics departments, and organizations via a "Network" model and Stripe-powered monetization.

---

## 🏗️ Phase 1: Stripe Monetization & Multi-Tenant Architecture

**Objective:** Enable teachers to self-serve subscriptions and optionally pay for "Network" seats (teams) without hitches in data isolation.

### 1.1 Stripe & Organization Schema (Performant)
*Avoid large arrays for members to prevent Firestore's 1MiB document limit. Use sub-collections or indexed lookups.*

#### **organizations Collection** (Root)
```typescript
interface Organization {
  id: string; 
  name: string; // "Mountain View Physics"
  ownerId: string; // Teacher UID (Stripe Billing Owner)
  stripeCustomerId: string;
  subscriptionStatus: "active" | "past_due";
  planId: "pro_teacher" | "department_network";
  // members: string[]; (DEPRECATED: Use organizationId index on user doc instead)
}
```

### 1.2 Access Tiers & Custom Claims
- **Logic:** Instead of checking Firestore roles on every request, embed `role: "teacher" | "student"` and `orgId: string` into **Firebase Auth Custom Claims**.
- **Security:** Logic inside `firestore.rules` will verify `request.auth.token.role == "teacher"` for write operations without a DB hit.

---

## ⚛️ Phase 2: The "Network" Data Model

**Objective:** Flexible relationships where resources are shared within an organization but restricted to students of specific classes.

### 2.1 Unified User Collection (Technical Migration)
*Move from split `teachers/` and `students/` collections to a single `users/` collection to enable easier indexing and RBAC.*

```typescript
interface User {
  uid: string;
  email: string;
  role: "teacher" | "student";
  displayName: string;
  organizationId?: string; // Links to /organizations/{id}
  
  // Membership Lookup Tuning
  teacherId?: string; // For students: ensures they only see their teacher's assignments
  classIds: string[]; // Classes the user belongs to
  createdAt: Timestamp;
}
```

### 2.2 Shared Physics Asset Library
- **Field:** Add `visibility: "private" | "network" | "global"` to all Assignment and Resource docs.
- **Organization Query:** `db.collection('assignments').where('organizationId', '==', orgId).where('visibility', '==', 'network')`.
- **Cloning Logic:** Implement a "Fork" feature where teachers can clone a Network asset to their private library to customize it.

---

## 🔐 Phase 3: AI Physics Pipeline & Compliance

**Objective:** Secure, scalable AI grading that respects student privacy (FERPA/COPPA).

### 3.1 PII Scrubbing (Regex-Layer)
- **File:** `src/lib/gemini.ts`
- **Implementation:** Create a `scrubDataForGemini(input: string)` utility that targets:
  - Email addresses: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
  - Potential names: Matching student roster entries against the submission text.
- **Context Privacy:** Use a hash of the `studentId` as the unique identifier for Gemini sessions instead of real user data.

### 3.2 Asynchronous Grading Pipeline
- **Problem:** Gemini/Vertex AI latency (>10s) causes Next.js Server Action or API timeouts.
- **Solution:** 
  1. Student UI submits to Firestore `/submissions/{id}` using `status: "pending"`.
  2. Cloud Function `onSubmissionCreated` triggers the grading logic in the background.
  3. UI listens to the document for real-time updates (via `onSnapshot`).
  4. Once Gemini returns, function updates doc with `earnedPoints`, `feedback`, and sets `status: "graded"`.

---

## 🚀 Phase 4: Developer Experience & Scale

### 4.1 Server Actions & React Server Components
- Use **Next.js Server Actions** for low-latency mutations (updating preferences).
- Use **RSCs** to pre-fetch physics asset metadata from Firestore for zero-bundle-size initial render of dashboards.

### 4.2 LTI 1.3 Lite
- Generate signed URLs for embedding specific Scorpio Physics Sims (Interactors) inside Canvas or Schoology without a full database integration.

---

## ✅ Technical Checklist

- [ ] **Auth Claims Function:** Deployment of `beforeUserCreated` or `onCall` function for claims.
- [ ] **PII Scrubbing:** Unit tests for `scrubPII` regex in `utils.test.ts`.
- [ ] **Async Grading Trigger:** Setup Firestore Trigger in `/functions` for AI grading.
- [ ] **Stripe Webhook Handler:** Secure API endpoint for `invoice.paid`.
