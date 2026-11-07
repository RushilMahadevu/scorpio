# School deployment readiness — November 7, 2026

## Implemented locally

- Protected feature endpoints authenticate Firebase tokens/session cookies, check revocation, reject mismatched account IDs, and enforce teacher/resource ownership. Page routing verifies the signed session and reads the server-managed role.
- Registration provisions profiles and networks on the server. Teacher invites are redeemed atomically; neither browser profile writes nor session-body fields can grant teacher access. Student signup without a class code remains supported. Joining a class resolves the teacher/network on the server.
- Firestore and Storage rules isolate students, classes, and networks. Account roles, enrollment, subscription state, usage counters, answer keys, and student submission writes are server-controlled.
- Assignment creation splits answer keys into `assignment_keys`; student documents contain only public questions. Teacher viewing and permitted Waypoint copying retrieve keys through the authenticated API. Legacy unsanitized assignments are denied to students until migrated.
- Submission API normalizes answer fields, calculates late status and point totals, validates attachment ownership, and prevents overwriting finalized work. Repeated submission is idempotent.
- Manual assignments are not automatically AI-graded. AI/provider/parse failures leave work pending review instead of assigning zero. Grading leases prevent overlapping requests; finalized grades are preserved.
- AI calls use bounded inputs/outputs, enabled safety thresholds, a server-only key, and transactional budget reservations. Monthly student counters roll over on use. Provider usage is settled even when later response parsing fails. Model accounting is Gemini 2.5 Flash text input $0.30/million and output $2.50/million, including reported thinking tokens; the configured requests disable thinking. Review rates when changing models.
- Usage settlement creates a durable billing outbox. A retry-enabled Firebase function delivers events to Polar with a stable external ID. Signed subscription webhooks deduplicate and reject older state; order creation does not activate subscriptions, and repeated same-period events do not reset usage.
- Account export/deletion is server-authorized. Deletion requires recent sign-in and covers profiles, submissions, uploads, notebooks, tutor sessions, practice history, and portfolios. Teacher accounts with active ownership/classes require a handoff first. Billing/security records and provider backups have separate retention concerns.
- Portfolio generation masks the student's name instead of including it in the prompt. Notebook text receives identifier masking. Privacy copy explains AI processors and does not claim blanket compliance. Research execution now runs server-side behind the server admin secret.

## Verification

Commands:

```sh
npm test -- --runInBand
npm run test:security
npm --prefix functions run build
SCORPIO_BUILD_DIR=.next-verify npm run build
```

The security suite uses only `demo-scorpio-security` with local Firestore and Storage emulators. It covers role escalation, cross-school reads/writes, answer secrecy, storage ownership, signup, invite races, draft/final submission, enrollment, concurrent budget limits, monthly rollover, webhook replay/order handling, export, and deletion. It does not use production records or paid AI/payment calls.

Browser smoke checks verified login/signup rendering, signed-out teacher-page redirects, and no captured browser console errors on those pages. HTTP checks returned 200 for public pages, 307 to login for protected pages, 401 for seven protected APIs without credentials, and rejection of a forged teacher cookie.

Build verification uncovered two obsolete local `.env.production` flags (`TURBOPACK=0`, `NEXT_PRIVATE_LOCAL_WEBPACK=1`); they were removed locally. The tracked build script now explicitly selects webpack. Verification output is isolated in `.next-verify` to avoid the existing development server's output directory.

Repository-wide lint was already failing before this work (317 errors/333 warnings in source). It is not a clean release gate yet; type/build and targeted functional/security tests are the evidence for this change, not a claim that the repository has zero lint debt.

## Coordinated rollout required

No deployment, production data migration, or live school onboarding was performed.

1. Use a staging Firebase project first. Review existing teacher identities and enrollment: historical profiles could have been client-created under the old rules, and new rules cannot prove their original legitimacy. Revoke sessions and correct unauthorized profiles if found.
2. Back up existing Firestore data and test restore. Put the application in maintenance mode during the production migration so old clients cannot keep writing the previous schema.
3. Run the assignment migration with explicit project and Application Default Credentials. It is read-only by default:

   ```sh
   FIREBASE_PROJECT_ID=YOUR_STAGING_PROJECT node tools/migrate-school-security.cjs
   FIREBASE_PROJECT_ID=YOUR_STAGING_PROJECT node tools/migrate-school-security.cjs --apply
   ```

   Review the count first. The migration moves embedded answer keys/rubrics and marks student-readable documents. Do not deploy stricter rules alone and expect unmigrated legacy assignments to remain visible. Old teacher-code-only enrollment must be resolved to trusted course/user records separately.
4. Deploy the application, Firestore/Storage rules and indexes, and Functions as one coordinated release. The new `deliverBillingUsage` function requires the `POLAR_ACCESS_TOKEN` Firebase secret. Confirm the app's customer mapping, billing environment, signed subscription events, and model settings against the intended sandbox/production account. Existing pending outbox documents created before its trigger is deployed need replay; use staging first.
5. Configure `GEMINI_API_KEY`, Firebase Admin credentials, Storage bucket, `ADMIN_SECRET`, Polar variables, and an explicit `LANDING_ORG_ID` for public demo/research usage. Do not expose secrets through `NEXT_PUBLIC_*`. Remove obsolete public research/teacher access passwords; rotate any actual secret that was also exposed publicly.
6. Run a real staging teacher/student browser walkthrough: signup and invite, class creation/join, assignment and copy, draft/submit, manual and AI grading, tutor/notebook, upload/download, export/deletion, and billing sandbox lifecycle. Emulator tests mock identity/provider boundaries and do not replace this live integration check.

## Remaining launch constraints

- The direct Gemini API terms prohibit applications directed toward or likely to be accessed by under-18s. Confirm a separately applicable provider/product agreement before student AI use. A software change or school approval alone does not resolve that restriction: https://ai.google.dev/gemini-api/terms
- Establish school-specific authorization, processor agreements, retention/deletion periods, support ownership, and incident response. Masking identifiers is not guaranteed anonymization or a compliance certification.
- Verify production rules, provider credentials, real Firebase Auth/Storage behavior, real AI grading quality, and Polar sandbox end-to-end. These were not exercised against live accounts here.
- A timed-out provider call retains its budget reservation because the billable outcome is unknown. Monitor `ai_reservations` with `status=pending`; reconcile against provider usage before releasing it. Do not blindly expire pending reservations or reset counters. Billing trigger retries also require monitoring and replay after a prolonged outage.
- Student monthly allowances currently count initiated provider requests, including failed attempts. AI budget settlement records actual returned usage; no-response calls retain the reservation for review.
- Validate accessibility, classroom concurrency/latency, operational monitoring, backups/restoration, and any school-device restrictions before a broad launch. These are separate acceptance checks, not evidence supplied by a successful build.

Provider references used for implementation: https://ai.google.dev/gemini-api/docs/pricing and https://polar.sh/docs/api-reference/events/ingest (duplicate external event IDs are skipped).
