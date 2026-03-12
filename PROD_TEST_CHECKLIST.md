# Production Testing Checklist

## Before You Start

Make sure these are set in your production environment (NOT sandbox values):
- `POLAR_ACCESS_TOKEN` → production token
- `POLAR_WEBHOOK_SECRET` → matches the webhook you registered in Polar dashboard
- `POLAR_MONTHLY_ID` → production product ID
- `POLAR_YEARLY_ID` → production product ID
- `POLAR_ENV` → **not set** (absence = production)

---

## Step 1 — Checkout Flow

1. Log in as a teacher who **owns** an org (free plan)
2. Go to `/teacher/network/billing`
3. Confirm you see the two plan cards (Monthly $4.99 / Yearly $29.88)
4. Click **Start Monthly**, complete checkout with your real card
5. You should land back at `/teacher/network?success=true`

**If the button is grayed out:** you're logged in as a non-owner member — use the owner account.

**If checkout errors:** check server logs for `Polar API error details:` — the most likely cause is `POLAR_MONTHLY_ID` pointing to a wrong/sandbox product.

---

## Step 2 — Webhook Fired Correctly

After completing checkout, go to **Firestore → organizations → {your org doc}** and confirm:

| Field | Expected |
|---|---|
| `subscriptionStatus` | `"active"` |
| `planId` | `"standard_monthly"` |
| `polarCustomerId` | a non-null string starting with `cus_` |
| `aiBudgetLimit` | `10000` |
| `aiUsageCurrent` | `0` |

**If these fields are wrong or missing:** go to Polar dashboard → Webhooks → check the delivery log for your endpoint. Look for a failed delivery and read the error. Most common cause: `POLAR_WEBHOOK_SECRET` mismatch.

---

## Step 3 — AI Features Unblocked

With the subscription active, test each AI feature works end-to-end:

- [ ] Navigation chatbot (the AI assistant icon in the teacher dashboard)
- [ ] Create an assignment using AI generation
- [ ] Synthesize a rubric on a question
- [ ] Grade a student text response
- [ ] Student: use the AI Tutor
- [ ] Student: generate a practice problem

Each one should respond normally. If any returns a 403, check server logs — it will show exactly which budget check failed.

---

## Step 4 — Metering is Recording

After doing a few AI actions, check two places:

**Firestore:** `organizations/{orgId}` → `aiUsageCurrent` should be a small non-zero number (e.g. `0.03`).

**Polar dashboard → Events:** you should see `ai_usage` events with `llm.input_tokens` and `llm.output_tokens` populated.

**If `aiUsageCurrent` is 0:** check server logs for `[Polar] Skipping metering — no polarCustomerId`. This means the webhook didn't save `polarCustomerId` — go back to Step 2.

**If Polar has no events:** check logs for `[Polar] Failed to ingest usage event:` — likely `POLAR_ACCESS_TOKEN` is wrong.

---

## Step 5 — Billing Page Active State

Go back to `/teacher/network/billing` while subscribed.

- Plan cards should be **gone**
- Green "Subscription Active" panel should be visible
- "Manage Invoices" button should open `https://polar.sh/scorpio/portal`

---

## Done

If all 5 steps pass, billing is working end-to-end in production.

---

## Quick Fixes

| Symptom | Fix |
|---|---|
| Checkout button → Polar error | Check `POLAR_MONTHLY_ID` / `POLAR_YEARLY_ID` are production IDs |
| Webhook fires but Firestore not updated | Check `POLAR_WEBHOOK_SECRET` in env matches Polar dashboard |
| AI routes return 403 after subscribing | `polarCustomerId` missing in Firestore — webhook likely failed |
| `aiUsageCurrent` not incrementing | Check logs for `[Polar] Skipping metering` |
| Billing page still shows plan cards | Org `planId` is still `"free"` — webhook didn't fire or failed |
| School hits budget cap | Go to Firestore, set `aiUsageCurrent: 0` to restore access immediately |
