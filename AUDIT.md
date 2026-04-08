# Scorpio — Project Audit
> Last updated: 2026-04-04

A deep-dive audit of bugs, tech debt, and feature gaps across the full stack based on direct codebase analysis.
Items are grouped by severity and area.

---

## 🔴 Critical Fixes (Must Fix)

### 3. Assignment Deadline Enforcement is Incomplete
**File:** `src/app/student/assignment-view/page.tsx` (Lines 879-881)

The `dueDate` field is successfully read from Firestore and rendered in the UI (e.g., `Due: {new Date(assignment.dueDate).toLocaleDateString()}`). However, the application never actually evaluates if the current time has passed the deadline. A student can submit indefinitely after the due date with no warning or blocking. 

---

## 🟡 Important Fixes (Should Fix Soon)

### 4. Firestore Rules: Missing `update` on `practice_history`
**File:** `firestore.rules` (Lines 88-94)

The `practice_history` collection has `read`, `create`, and `delete` rules for students, but **no `update` rule**. This means any attempt by a student client to patch/update an existing practice history entry will silently fail with a permission denied error. 

### 6. Admin Page relies on Client-Side Verification
**File:** `src/app/admin/page.tsx`

The admin dashboard protects itself by asking for a secret text string and validating it against `/api/auth/teacher-code`. However, the page component itself and all the child components (`AccessRequests`, `GlobalAnalytics`, etc.) are bundled and sent to the client. This should be refactored to use standard session-based validation.

---

## 🟢 Good-to-Have Features

### 8. Analytics on Socratic Engagement
Provide teachers with visibility into *how* students use the AI. Are they asking for direct answers? How many prompts does it take them to reach the solution? Adding metrics around Socratic interactions will help educators identify learning gaps faster.

---

## 🔵 Tech Debt

### 9. Monolithic Component Files
**File:** `src/app/teacher/network/page.tsx` 

This file is a massive **88KB** React Server/Client component. It mixes excessive local state, multiple data fetching routines, and complex UI (tabs, modals, member lists) into a single file. This should be broken down into smaller, focused subcomponents inside the `src/components/teacher/` directory.

---

### 10. Widespread TypeScript `any` Usage
**Files:** Codebase-wide

There are **147** instances of `: any` or `any[]` and **35** instances of `as any` across the codebase. Many of these relate to Firestore documents, Timestamps, and API responses. This defeats the purpose of TypeScript and increases the likelihood of silent runtime errors.

---

### 11. Unmanaged `console.log` and `console.error` Statements
**Files:** Codebase-wide

There are over **178** `console.error` statements and **51** `console.log` statements left in the production source code. These should be removed, wrapped in development-only blocks (`if (process.env.NODE_ENV !== 'production')`), or replaced with a structured error reporting library to prevent leaking internal application state or bloating the browser console.

---

## Summary

| Category                | Count  |
| ----------------------- | ------ |
| 🔴 Critical fixes        | 3      |
| 🟡 Important fixes       | 3      |
| 🟢 Good-to-have features | 2      |
| 🔵 Tech debt items       | 3      |
| **Total**               | **11** |
