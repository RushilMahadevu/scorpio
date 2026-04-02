# Scorpio — Project Audit
> Last updated: 2026-03-31

A deep-dive audit of bugs, tech debt, and feature gaps across the full stack.
Items are grouped by severity and area.

---

## 🔴 Critical Fixes (Must Fix)

<!-- ### 1. `window.alert()` used throughout — Breaks UX and looks broken
**Files:** `student/page-client.tsx`, `student/assignment-view/page.tsx`, `teacher/page-client.tsx`, `teacher/create/page.tsx`, `teacher/uploads/page.tsx`, `teacher/grades/page.tsx`, `teacher/students/page.tsx`

Native `alert()` and `confirm()` dialogs interrupt the browser, are unstyled, look terrible, and block the thread. Every single one should be replaced with the `sonner` toast library (already imported in the vault page) or a Dialog component.

```
alert("Code copied!")                          → toast.success("Code copied!")
alert("Failed to create course")              → toast.error("Failed to create course")
confirm("Are you sure...")                    → <AlertDialog> with confirm button
```

**Count:** ~20+ instances across the codebase.

--- -->

<!-- ### 2. Broken route: `/student/formula-hub` doesn't exist
**File:** `src/app/student/page-client.tsx` (line 545)

The Quick Hub card links to `/student/formula-hub` but the actual route is `/student/vault`. This is a dead link visible on every student's dashboard.

```tsx
// Current (broken)
<Link href="/student/formula-hub">

// Fix
<Link href="/student/vault">
``` -->

---

<!-- ### 3. Duplicate Firestore rule block
**File:** `firestore.rules` (lines 100–111)

The `practice_history` collection rule is defined **twice** (lines 100–105 and 107–111), word-for-word identical. The second block is dead and can cause confusion during future edits. -->

<!-- ---
# REALTIME NOT NECESSARY
### 4. "Instructor notified" message is a lie — tab violation isn't actually sent anywhere
**File:** `student/assignment-view/page.tsx` (line 764)

The UI tells students: *"This event has been logged and your instructor has been notified."* The `unfocusCount` is saved to the submission document, but no notification is actually sent to the teacher in real-time. Either implement the notification or soften the wording.

--- -->


<!-- # WILL BE IMPLEMENTED LATER
### 5. Grade email notification is disabled and left as dead code
**File:** `functions/src/grading.ts` (lines 350–371)

A `GradeAvailableEmail` block is completely commented out with a `//` comment saying "EMAIL NOTIFICATION (DISABLED)". This means students have no automated way to know when they get a grade back. This should either be properly implemented or removed.

--- -->

<!-- ### 6. `window.location.reload()` used instead of proper state updates
**Files:** `student/page-client.tsx` (lines 250, 298), `teacher/network/page.tsx` (lines 372, 482, 519, 559), `roster-import.tsx` (line 112)

Hard reloading the page to refresh state is a poor pattern — it flashes, is slow, and loses scroll position. These should use React state updates or router refresh (`router.refresh()`) instead. -->

<!-- ---

### 7. `any` types scattered across data-critical paths
**Files:** `teacher/page-client.tsx`, `student/practice/page.tsx`, `student/submissions/page.tsx`, `teacher/create/page.tsx`, `teacher/network/page.tsx`

Multiple interfaces use `any[]` for `questions`, `answers`, `history`, and `networkMembers`. These fields are read/written frequently and should have proper TypeScript interfaces.

--- -->

## 🟡 Important Fixes (Should Fix Soon)

<!-- # FIXED FROM PREV. CRIT. FIX
### 8. "Copy code" button shows `alert("Code copied!")` instead of toast
**File:** `teacher/page-client.tsx` (line 459)

This is inside the class code card — arguably the most-used teacher action. Native alert here is especially jarring.

--- -->

<!-- # Already done!
### 9. Settings dialog links to `/about`, `/contact`, `/privacy`, `/terms` — none exist
**File:** `settings-dialog.tsx` (lines 168, 625, 635, 645)

Clicking "Learn More About Scorpio", "Contact & Support", "Privacy Policy", and "Terms of Service" routes to pages that don't exist in the `src/app` directory. These will 404. Either build the pages or remove the buttons.

--- -->

<!-- ### 10. Waypoints version is hardcoded as `v1.2.0`
**File:** `teacher/waypoints/page.tsx` (line 323)

Every waypoint card displays `v1.2.0` as a badge. This is a hardcoded string, not read from any data field, so it's permanently wrong as data evolves. -->

---

<!-- ### 11. Vault "Class Data Stream" section is purely placeholder text
**File:** `student/vault/page.tsx` (lines 496–505)

The card reads: *"Centralized reference for General Physics (V1.2)"* and *"Your teacher has not uploaded specific formula restrictions..."* — this is all hardcoded static text. It should dynamically show teacher-uploaded restrictions (if any) or be removed. -->

<!-- ---

### 12. Grading cloud function: `resendApiKey` secret defined but never used
**File:** `functions/src/grading.ts` (line 7)

`resendApiKey` is imported and declared on the function triggers (lines 379, 389) but the email block that would use it is commented out. This adds unnecessary secret fetching cost on every trigger execution.

--- -->

<!-- ### 13. `practice_history` update rule is missing
**File:** `firestore.rules`

The `practice_history` collection has `read`, `create`, and `delete` rules but **no `update` rule**. This is likely intentional, but it means any patch/update to an existing history entry by a student will silently fail. -->

<!-- ---

### 14. Sidebar "formula-hub" navigation link may also be broken
**File:** `student-sidebar.tsx` or `app-sidebar.tsx`

Related to issue #2 — any sidebar nav link for the Equation Vault should point to `/student/vault` not `/student/formula-hub`. Verify the nav links are consistent.

--- -->

<!-- ### 15. Assignment view "start screen" boxes use hard-coded light-mode colors
**File:** `student/assignment-view/page.tsx` (lines 687–727)

The lockdown warning uses `bg-red-50 border-red-200 text-red-700` and the work submission box uses `bg-blue-50 border-blue-200`. These don't adapt to dark mode and will look washed out or unreadable on dark theme.

--- -->

## 🟢 Good-to-Have Features
<!-- 
### F1. Toast system — unified notification layer
Replace all `alert()` / `confirm()` / `window.*` usage with `sonner` toasts (already installed). Create a `toast.error`, `toast.success`, and a `<ConfirmDialog>` wrapper to standardize the entire platform.

--- -->

### F2. Grade-back email notification for students
Uncomment and complete the grading email trigger in `functions/src/grading.ts`. Students currently have zero automated feedback when a grade arrives. This is a major UX gap for an academic platform.

<!-- ---
# NOT NECESSARY
### F3. Real-time "pending grading" counter on teacher dashboard
The teacher dashboard shows pending submissions pulled on page load. Add a Firestore `onSnapshot` listener so the "Pending Review" stat card updates live without requiring a page refresh.

--- -->

### F4. Student grade trend chart on submissions page
The student dashboard shows a bar chart but only for the last 5 submissions with labels like `A1`, `A2`. Add actual assignment titles as labels and show trend direction (improving/declining) to make it actionable.

---

### F5. Teacher assignment duplicate / clone feature
Currently teachers can "Acquire Template" from the Waypoints library via fork, but can't clone one of their **own** existing assignments. A "Duplicate" button on each assignment card in `/teacher/assignments` would save significant time.

---

### F6. Assignment deadline enforcement on the student side
The `dueDate` field is stored on assignments but the student assignment view never checks if the deadline has passed. A student can submit after the due date with no warning or blocking. Add a deadline check and optionally lock submissions.

---

### F7. Bulk student import feedback improvements
`roster-import.tsx` has basic CSV import. It does a page reload on success and shows minimal feedback on errors. Add per-row success/failure reporting and allow partial imports (skip invalid rows, import valid ones).

<!-- ---
# a couple second delay to ensure completion is correctly checked
### F8. Onboarding checklist auto-dismiss
**File:** `onboarding-checklist.tsx`

Once all checklist items are complete, the checklist stays visible. It should auto-collapse or offer a "Dismiss forever" option. Similarly, it shouldn't re-appear for experienced users who've completed setup long ago.

--- -->

### F9. Teacher "Pending Grading" deep-link to specific submission
In the teacher dashboard, clicking a pending submission item links to the assignment overview (`/teacher/assignment-view?id=...`), not directly to that student's submission. Add a direct link to `/teacher/submission/grade?id=...` to save clicks.

---

### F10. Notebook auto-save / save indicator
**File:** `student/notebook/page.tsx`

The digital notebook is 43KB — likely complex. Verify it has auto-save behavior. Students should never lose notes. Add a visible "Saved" / "Saving..." / "Unsaved changes" indicator.

---

<!-- ### F11. Equation Vault — teacher-defined formula restrictions
The vault currently shows all 25+ formulas to every student regardless of class. The placeholder text in the vault acknowledges this. Build a teacher-side interface to "lock" certain equation categories for specific assignments or courses. This is mentioned in the platform tutorial but not yet implemented. -->

---
<!-- 
# Not available because teachers' own assignments act as waypoints
### F12. Waypoints — "My Waypoints" tab missing
**File:** `teacher/waypoints/page.tsx`

The Waypoints page has "Global" and "Department" tabs. There's no "Mine" tab to see only the teacher's own created waypoints. The current fallback (`where("teacherId", "==", user.uid)`) is only accessible when neither Global nor Network tab is active — this logic is fragile and the tab is effectively hidden.

--- -->

<!-- 
# Fixed already
### F13. Network page — 4 x `window.location.reload()` calls
**File:** `teacher/network/page.tsx` (lines 372, 482, 519, 559)

After network creation, renaming, joining, or leaving — the page does a full reload. Replace these with targeted state updates using `setCourses`, `setOrganization`, etc. This is especially jarring when the network page is visually rich.

--- -->

### F14. AI Tutor — session persistence across page reloads
**File:** `student/tutor/page.tsx`

The tutor chat uses Firestore `tutor_sessions` collection. Verify the session is actually loaded on mount so students don't lose their conversation when refreshing. If it's already done, this is fine — but confirm there's no regression after recent changes.

---

<!--
# Unnecessary as mobile is not supported
 ### F15. Mobile layout — assignment view is not mobile-optimized
**File:** `student/assignment-view/page.tsx`

The assignment view uses `ResizablePanelGroup` with a horizontal split for the Socratic AI panel. On mobile (`isMobile` flag), the AI panel behavior should be a slide-up sheet rather than a side panel. Verify this path is fully tested.

--- -->

<!-- # Fixed!
### F16. Missing 404 page styling consistency
**File:** `src/app/not-found.tsx`

The 404 page exists but may not match the current premium aesthetic. Since the settings dialog links to several non-existent pages (see fix #9), users will hit this often.

--- -->

### F17. Admin dashboard is not protected by role check on client side
**File:** `src/app/admin/page.tsx`

The admin page appears to be a single `page.tsx` file. Verify it's gated behind an admin role check. The Firestore rules alone aren't sufficient — the UI should redirect unauthenticated or non-admin users immediately.

---

## 🔵 Tech Debt

<!-- ### T1. Dual-collection student data model (legacy + unified)
Every student fetch queries BOTH `students/` (legacy) and `users/` (unified). This pattern appears in at least 6 files. The legacy collection should be progressively deprecated. -->

### T2. `any` used for assignment `createdAt` field
**File:** `teacher/page-client.tsx` (line 32 — `createdAt: any`)  
Firestore Timestamps should be typed as `Timestamp | string | Date` and normalized at the point of use.

### T3. Test files in project root
`test-editor.js` and `test-tiptap.js` are sitting in the project root directory. These should be moved to `__tests__/` or deleted.

### T4. `.DS_Store` files committed
Several `.DS_Store` files exist in `src/` subfolders. Add `**/.DS_Store` to `.gitignore` and remove them from git tracking.

### T5. `fix-metadata.js` script in root — purpose unclear
A `fix-metadata.js` file exists in the root but has no documentation. Add a comment explaining what it does and when to run it, or move it to `scripts/`.

### T6. `gemini.ts` has grown to 80KB
**File:** `src/lib/gemini.ts`

At 80,368 bytes, this file is a monolith. It mixes AI prompts, PII scrubbing, response parsing, grading logic, tutor logic, practice generation, and chatbot logic. Split into domain-specific modules (`gemini-grading.ts`, `gemini-tutor.ts`, `gemini-practice.ts`, etc.)

### T7. Empty `/src/components/dashboard/` directory
`src/components/dashboard/` exists but is completely empty. Either populate it or remove it.

---

## Summary

| Category | Count |
|---|---|
| 🔴 Critical fixes | 7 |
| 🟡 Important fixes | 8 |
| 🟢 Good-to-have features | 17 |
| 🔵 Tech debt items | 7 |
| **Total** | **39** |
