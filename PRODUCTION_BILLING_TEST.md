# Production Billing & AI Metering: Testing Runbook

**Scope:** Moving Polar from sandbox → production for Scorpio.
**Audience:** Dev team members executing the cutover and QA.
**This document is authoritative. Do not skip steps. Schools depend on this working correctly.**

---

## Table of Contents

1. [Pre-Flight: Environment Cutover](#1-pre-flight-environment-cutover)
2. [Polar Production Dashboard Setup](#2-polar-production-dashboard-setup)
3. [Webhook Endpoint Registration & Verification](#3-webhook-endpoint-registration--verification)
4. [Checkout Flow Testing](#4-checkout-flow-testing)
5. [Webhook Event Lifecycle Testing](#5-webhook-event-lifecycle-testing)
6. [AI Budget Enforcement Testing](#6-ai-budget-enforcement-testing)
7. [Polar Metered Event Ingestion Testing](#7-polar-metered-event-ingestion-testing)
8. [Per-Student Limit Testing](#8-per-student-limit-testing)
9. [Subscription Renewal & Cancellation Testing](#9-subscription-renewal--cancellation-testing)
10. [Firestore State Validation Checklist](#10-firestore-state-validation-checklist)
11. [Known Gaps & Risks](#11-known-gaps--risks)
12. [Rollback Procedure](#12-rollback-procedure)

---

## 1. Pre-Flight: Environment Cutover

### 1.1 Credential Rotation

The codebase reads from these env vars in `src/lib/polar.ts` and `src/app/api/webhooks/polar/route.ts`.
You **must** rotate every value — leaving any sandbox credential in place will silently route charges to the wrong environment.

| Variable | Current Sandbox Value | Action Required |
|---|---|---|
| `POLAR_ACCESS_TOKEN` | `polar_oat_OKAt...` (commented) | Replace with production org access token from Polar dashboard |
| `POLAR_WEBHOOK_SECRET` | `polar_whs_zJhg...` (commented) | Replace with secret from the production webhook you register in Step 3 |
| `POLAR_MONTHLY_ID` | `a342d5dd-0fd5-4ef7-a445-cce27bf5171e` | Replace with production Product ID for Standard Monthly ($4.99) |
| `POLAR_YEARLY_ID` | `3d945de7-3b95-4739-bc24-472e47891596` | Replace with production Product ID for Standard Yearly ($29.88) |
| `POLAR_ENV` | `sandbox` | **Remove this variable entirely** (absence = production) |

**Verify in `src/lib/polar.ts:5`:**
```ts
server: process.env.POLAR_ENV === "sandbox" ? "sandbox" : "production",
```
With `POLAR_ENV` unset, this evaluates to `"production"`. Confirm after deploy:
```bash
curl -s -H "Authorization: Bearer $POLAR_ACCESS_TOKEN" \
  https://api.polar.sh/v1/organizations/me | jq '.name'
```
If the org name matches your production Polar org, you're pointed at the right server.

### 1.2 Verify Firebase Admin SDK is connected

The webhook handler checks `adminDb` at `src/app/api/webhooks/polar/route.ts:30`. A misconfigured Firebase private key will silently return 500 on every webhook, breaking subscription activation without any visible error to the user.

```bash
# Hit a known-protected route with an active-org user and check server logs for:
# "[Polar Webhook] adminDb initialized: true"
```

---

## 2. Polar Production Dashboard Setup

### 2.1 Create Products

In the Polar production organization dashboard, create two products exactly as follows:

**Standard Monthly**
- Price: `$4.99 / month` (recurring)
- Metadata to note: the product ID after creation becomes `POLAR_MONTHLY_ID`

**Standard Yearly**
- Price: `$29.88 / year` (recurring)
- Metadata: product ID becomes `POLAR_YEARLY_ID`

### 2.2 Configure Metered Billing (Critical)

`recordUsage()` in `src/lib/usage-limit.ts:144` calls `polar.events.ingest()` with event name `"ai_usage"` and properties:
- `llm.input_tokens` — integer
- `llm.output_tokens` — integer

In Polar, you must create a **Meter** that aggregates this event:

1. Go to **Products → Meters → New Meter**
2. Event name: `ai_usage`
3. Aggregation: **Sum** on property `llm.input_tokens` → name it "Input Tokens"
4. Create a second meter: **Sum** on property `llm.output_tokens` → name it "Output Tokens"
5. Attach both meters to each subscription product

> **If meters are not created before any paid subscriptions go live, usage events will still be ingested but will not appear on customer invoices. You will need to retroactively reconcile.**

### 2.3 Configure Success URL

The checkout route at `src/app/api/checkout/route.ts` sets:
```ts
successUrl: `${origin}/teacher/network?success=true`
```
Verify your production domain is in Polar's allowed redirect origins list.

### 2.4 Customer Portal Link

The billing page at `src/app/teacher/network/billing/page.tsx:262` hardcodes:
```
https://polar.sh/scorpio/portal
```
Confirm this URL resolves correctly for your production Polar organization slug. If the org slug differs, update this before launch.

---

## 3. Webhook Endpoint Registration & Verification

### 3.1 Register the endpoint

In Polar dashboard → **Webhooks → New Endpoint**:
- URL: `https://your-production-domain.com/api/webhooks/polar`
- Secret: generate a strong secret, save it as `POLAR_WEBHOOK_SECRET`
- Events to subscribe (all required):
  - `subscription.created`
  - `subscription.updated`
  - `subscription.active`
  - `order.created`
  - `subscription.revoked`

### 3.2 Verify signature validation

The webhook handler at `src/app/api/webhooks/polar/route.ts:15` uses `validateEvent()` from `@polar-sh/sdk/webhooks`. A wrong secret returns HTTP 401 and logs `"Polar Webhook validation failed"`.

**Test with Polar's delivery simulator (from the webhook dashboard):**
1. Trigger a test `subscription.created` event
2. Check your server logs for `[Polar Webhook] Event type: subscription.created`
3. Confirm HTTP 200 response in the Polar delivery log
4. If you see 401: `POLAR_WEBHOOK_SECRET` is wrong
5. If you see 500 with `"Database not initialized"`: Firebase Admin SDK env vars are wrong

### 3.3 Verify metadata pass-through

The checkout route injects `metadata: { organizationId, userId, planId }` into the Polar checkout. The webhook reads these back. This chain **must** be intact or Firestore will never be updated.

To verify: after a real test checkout, check the raw event payload in Polar's webhook delivery log. Confirm `metadata.organizationId`, `metadata.userId`, and `metadata.planId` are all present and non-empty.

---

## 4. Checkout Flow Testing

Use a **real test card** in Polar production testing mode (not your own card) for this step.

### 4.1 Monthly Plan — Owner Flow

1. Log in as a teacher who is the `ownerId` of an organization with `planId: "free"`
2. Navigate to `/teacher/network/billing`
3. Confirm the two plan cards are shown (free tier state)
4. Click **Start Monthly**
5. Verify `POST /api/checkout` is called with `{ planId: "standard_monthly", userId, organizationId }`
6. Verify redirect to Polar checkout page (not a 404 or error)
7. Complete checkout with test card
8. Verify redirect back to `/teacher/network?success=true`
9. Check Firestore `organizations/{organizationId}` — see Step 10 for expected state

### 4.2 Yearly Plan — Owner Flow

Repeat 4.1 using the **Claim Annual Plan** button (`planId: "standard_yearly"`).

### 4.3 Non-Owner Guard

1. Log in as a teacher who is a **member** (not `ownerId`) of the organization
2. Navigate to `/teacher/network/billing`
3. Both upgrade buttons must be **disabled** (`disabled={upgrading || !isOwner}`)
4. The text "Only owners can manage billing" must be visible beneath each button

### 4.4 Already-Subscribed State

1. With an org that has `planId !== "free"`, navigate to `/teacher/network/billing`
2. Plan cards must **not** render
3. The green "Subscription Active" panel must be visible
4. The **Polar Portal** button must be visible and link to `https://polar.sh/scorpio/portal`

---

## 5. Webhook Event Lifecycle Testing

For each event below, trigger via a real checkout or via Polar's event simulator, then immediately query Firestore and verify the field values.

### 5.1 `subscription.created`

**Expected Firestore update on `organizations/{organizationId}`:**

| Field | Expected Value |
|---|---|
| `polarCustomerId` | Polar customer ID string (non-null) |
| `subscriptionId` | Polar subscription ID string |
| `subscriptionStatus` | `"active"` |
| `planId` | `"standard_monthly"` or `"standard_yearly"` |
| `aiBudgetLimit` | `200` (cents = $2.00) |
| `aiUsageCurrent` | `0` (reset on `subscription.created`) |
| `baseMonthlyFee` | `499` or `2988` |

> **Critical:** `polarCustomerId` must be non-null. `recordUsage()` skips metered billing if this field is missing (logged as `[Polar] Skipping metering — no polarCustomerId`). If it's null after `subscription.created`, check that the Polar SDK is returning `sub.customerId` — the webhook at `src/app/api/webhooks/polar/route.ts:64` reads `sub.customerId ?? sub.customer_id ?? null`.

### 5.2 `subscription.updated`

**Expected:** Same fields as above *except* `aiUsageCurrent` is **not** reset — only `subscription.created` and `subscription.active` reset it (see `route.ts:69`).

**Verify:** Manually set `aiUsageCurrent: 50` on the org, trigger a `subscription.updated` event, confirm `aiUsageCurrent` is still `50`.

### 5.3 `subscription.active`

**Expected:** Same as `subscription.created` — `aiUsageCurrent` is reset to `0`.

**Verify this does not accidentally wipe usage mid-billing-period.** This event fires when a subscription transitions from `trialing` or `past_due` → `active`. If you do not use trials, this should be fine. If you add trials later, re-evaluate.

### 5.4 `order.created` — New Subscription Path

This fires when a new order is placed alongside a subscription. The webhook checks for `metadata.planId && metadata.userId` to distinguish a new activation from a renewal.

**New subscription path (both fields present):**

| Field | Expected Value |
|---|---|
| `subscriptionStatus` | `"active"` |
| `aiBudgetLimit` | `200` |
| `aiUsageCurrent` | `0` |
| `lastRenewalAt` | Timestamp of now |

**Renewal path (metadata fields absent):**

| Field | Expected Value |
|---|---|
| `aiUsageCurrent` | `0` (budget reset for new billing period) |
| `lastRenewalAt` | Timestamp of now |

**Test the renewal path explicitly:** Confirm that `aiUsageCurrent` resets to `0` on each billing cycle. This is the mechanism that gives schools their monthly budget back.

### 5.5 `subscription.revoked`

**Expected Firestore update:**

| Field | Expected Value |
|---|---|
| `subscriptionStatus` | `"canceled"` |
| `planId` | `"free"` |

**Immediately after this event fires, all AI features for that organization must be blocked.** See Section 6 for the enforcement test.

---

## 6. AI Budget Enforcement Testing

`checkBudget()` in `src/lib/usage-limit.ts` runs before every AI request. These tests verify the enforcement gates work in production.

### 6.1 Free Plan Block

**Setup:** Organization with `planId: "free"`, `subscriptionStatus: "none"`

**Test each AI route:**

| Route | Method | Expected HTTP |
|---|---|---|
| `POST /api/chat` | POST | 403 |
| `POST /api/student/tutor` | POST | 403 |
| `POST /api/practice/generate` | POST | 403 |
| `POST /api/notebook/chat` | POST | 403 |
| `POST /api/grade` | POST | 403 |
| `POST /api/ai/generate` | POST | 403 |
| `POST /api/ai/parse` | POST | 403 |

**Expected error message in response:** `"AI Features require a Standard subscription."`

### 6.2 Canceled Subscription Block

**Setup:** Set `subscriptionStatus: "canceled"` (or `"revoked"`) on an org via Firestore directly, leave `planId` as `"standard_monthly"`.

**Expected:** All AI routes return 403 with `"Your subscription is no longer active."`

### 6.3 Budget Cap Enforcement

**Setup:** Set `aiBudgetLimit: 200` (the production default) and `aiUsageCurrent: 200` on an active org.

**Expected:** All AI routes return 403 with:
```
Monthly AI budget ($2.00) reached. Please increase your limit in Network settings.
```

**Also test boundary condition:** Set `aiUsageCurrent: 199.99999`. The check is `currentUsage >= budgetLimit` (strict >=). Confirm a request at 199.99999 is still allowed and one at exactly 200 is blocked.

### 6.4 Budget Reset After Renewal

After simulating an `order.created` renewal event (no metadata planId), confirm `aiUsageCurrent` resets to `0` and AI requests are unblocked.

### 6.5 Full AI Feature Coverage Matrix

For each feature, confirm both the **budget check** and the **usage recording** fire correctly after a successful response. Check server logs for `[Polar] Ingested ai_usage event for {customerId}`.

| Feature | Route | checkBudget type | recordUsage type | Additional Pool Check |
|---|---|---|---|---|
| Navigation Chat | `/api/chat` | `"navigation"` | `"navigation"` | Rate limit: 30 req/hr per user (stored in `usage/{userId}`) |
| Chat Limits | `/api/chat/limits` | `"navigation"` | `"navigation"` | None |
| AI Tutor (student) | `/api/student/tutor` | `"tutor"` + userId | `"tutor"` + userId | `aiTutorLimitPerStudent` per-student cap |
| Practice Generate | `/api/practice/generate` | `"practice"` | `"practice"` | `practiceUsageCurrent >= practiceLimit` pre-check |
| Notebook Chat | `/api/notebook/chat` | `"notebook"` | `"notebook"` | `notebookUsageCurrent >= notebookLimit` pre-check |
| AI Grading | `/api/grade` | `"grading"` | `"grading"` | None |
| AI Generate | `/api/ai/generate` | `"generation"` | `"generation"` | None |
| AI Parse | `/api/ai/parse` | `"generation"` | `"generation"` | None |
| AI Synthesize Rubric | `/api/ai/synthesize-rubric` | `"generation"` | **NONE — see §11** | None |
| Title Generation | `/api/ai/generate-title` | **NONE — see §11** | **NONE — see §11** | None |

---

## 7. Polar Metered Event Ingestion Testing

After a successful AI request on a subscribed org, verify the usage event reaches Polar.

### 7.1 Verify logs

After any AI request, check server logs:
```
[Polar] polarCustomerId: cus_xxxxx | costCents: 0.003
[Polar] Ingested ai_usage event for cus_xxxxx
```

If you see:
```
[Polar] Skipping metering — no polarCustomerId on org {orgId}
```
The `polarCustomerId` is missing from Firestore. Go back to Step 5.1 and fix the webhook.

### 7.2 Verify events in Polar dashboard

In Polar → **Events** (or Meters), confirm:
- `ai_usage` events appear with the correct `customerId`
- `llm.input_tokens` and `llm.output_tokens` fields are populated
- Meter values accumulate across multiple requests

### 7.3 Cost calculation accuracy

`recordUsage()` computes cost at `src/lib/usage-limit.ts:93`:
```ts
costCents = (inputTokens * 0.000015) + (outputTokens * 0.000060)
```
These match Gemini 2.5 Flash paid tier rates ($0.15/1M input, $0.60/1M output).

Spot-check with a request that returns known token counts (check `usageMetadata` in your AI route response) and verify the `costCents` written to `usage_analytics` matches manual calculation.

---

## 8. Per-Student Limit Testing

### 8.1 AI Tutor per-student cap

**Setup:**
- Organization with `aiTutorLimitPerStudent: 5`
- Student user with `tutorUsageCurrent: 4`

**Test 1 — last allowed message:** Student sends a tutor message. Expect 200 response. After: `tutorUsageCurrent` in user doc = `5`.

**Test 2 — cap hit:** Student sends another message. Expect 403 with:
```
You have used all 5 of your AI Tutor messages for this period.
Contact your teacher to increase your allowance.
```

**Test 3 — zero limit:** Set `aiTutorLimitPerStudent: 0`. The check `if (teacherAllowance > 0 && ...)` means a `0` limit means **no cap is enforced**. This is the intended behavior — `0` means unlimited. Confirm students can use the tutor freely when this is 0.

### 8.2 Practice pool cap

**Setup:** `practiceLimit: 10`, `practiceUsageCurrent: 10` on org.

The check in `/api/practice/generate` runs **before** `checkBudget()`. Expect 403 when the pool is exhausted, regardless of remaining AI budget.

### 8.3 Student → Org resolution via teacherId fallback

Several AI routes resolve the organization from a student's `teacherId` when the student has no direct `organizationId`. This path **must be tested** — it is easy to break.

1. Create a student user with `teacherId` set but **no** `organizationId`
2. Create a teacher with `organizationId` set
3. Have the student call `/api/student/tutor`
4. Confirm the route resolves `student.teacherId → teacher.organizationId` and applies the correct budget

---

## 9. Subscription Renewal & Cancellation Testing

### 9.1 Monthly renewal cycle

Polar fires `order.created` on each billing cycle. The webhook resets `aiUsageCurrent: 0`.

**Simulate by:**
1. Setting `aiUsageCurrent: 180` on an org (near-limit)
2. Sending a simulated `order.created` webhook with **no** `metadata.planId` (renewal path)
3. Confirming `aiUsageCurrent` in Firestore is `0`
4. Confirming AI requests are unblocked

### 9.2 User cancels via Polar portal

1. Open `https://polar.sh/scorpio/portal` as a subscribed school owner
2. Cancel the subscription
3. Polar fires `subscription.revoked`
4. Confirm Firestore: `subscriptionStatus: "canceled"`, `planId: "free"`
5. Confirm all AI routes immediately return 403

### 9.3 Past-due scenario

If payment fails, Polar may set subscription status to `past_due`. The current webhook handler sets `subscriptionStatus: "none"` for any status that is not `"active"` (`route.ts:66`):
```ts
subscriptionStatus: sub.status === "active" ? "active" : "none"
```
The `checkBudget()` function only blocks on `"canceled"` and `"revoked"` — **not** on `"none"**. This means a past-due subscription will **still allow AI access** until revoked.

**Verify your acceptable behavior here.** If you want to block on past-due, this needs a code change.

---

## 10. Firestore State Validation Checklist

After a complete subscription activation, the `organizations/{organizationId}` document must have:

```
polarCustomerId:      "cus_xxxxxxxxxxxx"    # Non-null — breaks metering if missing
subscriptionId:       "sub_xxxxxxxxxxxx"    # Non-null
subscriptionStatus:   "active"
planId:               "standard_monthly" | "standard_yearly"
aiBudgetLimit:        200                   # Cents ($2.00 hard cap by default)
aiUsageCurrent:       0                     # Reset on activation
baseMonthlyFee:       499 | 2988
lastRenewalAt:        <timestamp>           # Set on order.created
```

Query from Firestore console or via CLI:
```bash
firebase firestore:get organizations/{organizationId}
```

Confirm **none** of these fields are `undefined` or `null` after a real checkout completes.

---

## 11. Known Gaps & Risks

Review these before going live. Each one is a real production risk.

### GAP 1: `/api/ai/generate-title` — No metering whatsoever
- **File:** `src/app/api/ai/generate-title/route.ts`
- **Risk:** This route calls the AI model with zero budget check and zero usage recording. Any authenticated teacher can call it unlimited times at no tracked cost.
- **Action Required:** Add `checkBudget()` before the model call and `recordUsage()` after.

### GAP 2: `/api/ai/synthesize-rubric` — `recordUsage` missing (TODO in code)
- **File:** `src/app/api/ai/synthesize-rubric/route.ts:38` (noted as TODO)
- **Risk:** Usage is not recorded. Cost is not tracked. Polar meter will not receive events for rubric synthesis.
- **Action Required:** Add `recordUsage()` call after successful model response. This is a named TODO — it should be done before production launch.

### GAP 3: `aiBudgetLimit` is $2.00 — extremely low for schools in production
- **Value set in webhook:** `aiBudgetLimit: 200` (cents)
- **Risk:** A school with 30 students actively using the AI tutor can easily exhaust $2.00 within hours on the first day. This will cause a hard block mid-lesson.
- **Action Required:** Decide on the correct default budget before launch. The teacher network settings must expose a way to raise this limit, or the default must be higher. Consider `aiBudgetLimit: 10000` ($100/month) until precise usage data is gathered.

### GAP 4: Past-due subscriptions are not blocked
- **Issue:** `subscriptionStatus: "none"` (set on past-due) does not trigger enforcement in `checkBudget()`
- **Risk:** Schools with failed payments continue to use AI
- **Action Required:** Either add `"none"` to the blocked list in `checkBudget()`, or accept this as a grace period behavior and document it explicitly.

### GAP 5: `subscription.updated` does not reset `aiUsageCurrent`
- **Issue:** Only `.created` and `.active` reset usage. An update (e.g., plan change) does not.
- **Risk:** This is likely correct for mid-period plan changes, but confirm with the team.

### GAP 6: No Firestore security rules prevent client-side budget manipulation
- **Risk:** The billing page reads org data client-side. If Firestore rules allow a teacher to write `aiBudgetLimit` directly, they could self-grant unlimited AI.
- **Action Required:** Verify `firestore.rules` restricts writes to billing fields (`aiBudgetLimit`, `subscriptionStatus`, `planId`, `polarCustomerId`) to backend-only (no client writes).

---

## 12. Rollback Procedure

If production billing is broken and schools are affected:

### Immediate: Re-enable sandbox credentials
1. Set `POLAR_ENV=sandbox` in production environment variables
2. Swap `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_MONTHLY_ID`, `POLAR_YEARLY_ID` back to sandbox values
3. Redeploy

### If webhooks are not firing (subscriptions not activating):
Manually set the Firestore org document to simulate a successful webhook:
```json
{
  "subscriptionStatus": "active",
  "planId": "standard_monthly",
  "aiBudgetLimit": 200,
  "aiUsageCurrent": 0,
  "polarCustomerId": "<customer id from Polar dashboard>"
}
```
This unblocks the school immediately while the webhook issue is diagnosed.

### If AI routes are returning 403 unexpectedly:
1. Check `organizations/{orgId}` in Firestore — confirm `planId !== "free"` and `subscriptionStatus === "active"`
2. Check `aiUsageCurrent < aiBudgetLimit`
3. Check server logs for `[Polar Webhook]` entries to see if the last webhook failed
4. Check `POLAR_WEBHOOK_SECRET` matches the value in the Polar dashboard

### Communication
If a school loses AI access during a class period due to a billing bug: manually reset `aiUsageCurrent: 0` in Firestore as an emergency measure. This restores access immediately without any deployment.

---

*Last updated: production cutover preparation. Treat as a living document — update it as the billing system evolves.*
