# Phase 1, 3, 4, and 5 Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining pending and partial work for Phases 1, 3, 4, and 5 so the codebase matches the operationalization plan end-to-end.

**Architecture:** Keep the current API and page structure intact and close the gaps with minimal targeted changes. Add only the smallest new API surface needed for UI gating and public discount validation, move fragile UI logic to stable id-based flows, and preserve existing route/module boundaries.

**Tech Stack:** NestJS, Prisma, React, React Router, TypeScript

---

## File Map

### API
- Modify: `apps/api/src/modules/billing/billing.service.ts`
  - Extend billing summary with downgrade eligibility and reasons.
- Modify: `apps/api/src/modules/consult/consult.service.ts`
  - Expose booking/client ids needed by the schedule completion flow if not already present in the existing therapist bookings payload.
  - Optionally include applied discount metadata in booking responses only if needed by the booking confirmation UX.
- Modify: `apps/api/src/modules/discount/discount.service.ts`
  - Return richer preview data for the booking page discount summary.
- Modify: `apps/api/src/modules/discount/discount.controller.ts`
  - Keep public validation endpoint contract aligned with the booking UI.
- Modify: `apps/api/src/modules/tenant/tenant.service.ts`
  - Expose the authenticated tenant onboarding completion status if it is not already available from the existing auth/profile payload.

### Web
- Modify: `apps/web/src/pages/ClientBookingPage.tsx`
  - Add discount application UX and final-price breakdown.
- Modify: `apps/web/src/pages/SubscriptionSettingsPage.tsx`
  - Add disabled downgrade states and explanatory copy.
- Modify: `apps/web/src/pages/auth/LoginPage.tsx`
  - Gate onboarding recovery CTA behind actual incomplete onboarding state.
- Modify: `apps/web/src/pages/SchedulePage.tsx`
  - Use stable ids for SOAP modal navigation.
- Modify: `apps/web/src/context/AuthContext.tsx`
  - Ensure onboarding completion state is accessible to the login/resume logic if needed.

### Validation
- Use: existing typecheck scripts for `apps/api` and `apps/web`
- Use: existing test commands if present; otherwise validate via typecheck and focused browser/manual API testing

---

### Task 1: Make SOAP Note Follow-up Navigation Stable

**Files:**
- Modify: `apps/web/src/pages/SchedulePage.tsx`
- Modify: `apps/api/src/modules/consult/consult.service.ts`

- [ ] **Step 1: Inspect current schedule event shape and therapist bookings payload**

Read and confirm where `CalendarEvent` is defined in `apps/web/src/pages/SchedulePage.tsx`, and where therapist bookings are mapped in `apps/api/src/modules/consult/consult.service.ts`.

Expected outcome: identify whether `clientId` is already available in the API response or needs to be added.

- [ ] **Step 2: Add `clientId` to therapist booking payload if missing**

In `apps/api/src/modules/consult/consult.service.ts`, update the `getTherapistBookings` mapper to include a stable `clientId` field from `b.client.id`.

Target shape in the returned object:

```ts
return bookings.map((b) => ({
  id: b.id.toString(),
  clientId: b.client.id.toString(),
  clientName: `${b.client.firstName || ''} ${b.client.lastName || ''}`.trim() || 'Client',
  clientEmail: b.client.email,
  clientPhone: b.client.phone,
  serviceTitle: b.service.title,
  durationMinutes: b.service.durationMinutes,
  startsAt: b.availability.startsAt.toISOString(),
  endsAt: b.availability.endsAt.toISOString(),
  status: b.status,
  videoRoomLink: b.videoRoomName ? (b.videoRoomName.startsWith('http') ? b.videoRoomName : `https://meet.jit.si/${b.videoRoomName}`) : null,
  notes: b.notes,
}));
```

- [ ] **Step 3: Run typecheck for API after payload change**

Run: `npm run typecheck`

Workdir: `apps/api`

Expected: successful typecheck with no new type errors.

- [ ] **Step 4: Update schedule event typing to carry `clientId`**

In `apps/web/src/pages/SchedulePage.tsx`, extend the schedule event shape so events derived from bookings keep `clientId` alongside booking `id`.

Target pattern:

```ts
type CalendarEvent = {
  id: string;
  clientId?: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt: string;
  category: string;
  status?: string;
};
```

And in the booking-to-event mapping:

```ts
clientId: booking.clientId,
```

- [ ] **Step 5: Replace name-based modal routing with id-based routing**

In `apps/web/src/pages/SchedulePage.tsx`, replace:

```ts
const client = clients.find(c => c.name === sessionCompleteEvent.title);
if (client) {
  navigate(`/portal/clients/${client.id}?tab=notes&booking=${sessionCompleteEvent.id}`);
}
```

with:

```ts
if (sessionCompleteEvent.clientId) {
  navigate(`/portal/clients/${sessionCompleteEvent.clientId}?tab=notes&booking=${sessionCompleteEvent.id}`);
}
```

- [ ] **Step 6: Run web typecheck**

Run: `npm run typecheck`

Workdir: `apps/web`

Expected: successful typecheck with no new type errors.

- [ ] **Step 7: Manual verification of completion modal flow**

Verify in the running app:
- mark a session complete
- modal opens
- clicking `Write SOAP note` routes to the correct client notes page
- duplicate client names do not affect navigation

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/consult/consult.service.ts apps/web/src/pages/SchedulePage.tsx
git commit -m "fix: use stable ids for soap note routing"
```

---

### Task 2: Gate Onboarding Recovery Behind Actual Incomplete State

**Files:**
- Modify: `apps/web/src/pages/auth/LoginPage.tsx`
- Modify: `apps/web/src/context/AuthContext.tsx`
- Modify: `apps/api/src/modules/tenant/tenant.service.ts` (only if needed)

- [ ] **Step 1: Inspect how onboarding completion is represented in auth/profile state**

Read the auth context and current profile shape to confirm whether a field such as `onboardingCompleted`, `practiceName`, `tenantSlug`, or equivalent already exists.

Expected outcome: determine whether the fix can be done entirely in `LoginPage.tsx` or requires exposing one more field through auth/profile loading.

- [ ] **Step 2: Remove blind pre-login banner rendering**

In `apps/web/src/pages/auth/LoginPage.tsx`, remove the unconditional banner block:

```tsx
{localStorage.getItem('unclutter_onboarding_v1') && (
  ...
)}
```

This banner should not render solely from local storage presence.

- [ ] **Step 3: Redirect to onboarding only after successful login when resume conditions are true**

Update `handleLogin` in `apps/web/src/pages/auth/LoginPage.tsx` to:
- read the saved wizard draft from `localStorage`
- check the returned profile for incomplete onboarding
- route to onboarding only when both are true

Target pattern:

```ts
const profile = await login(email, password);
const hasSavedOnboarding = !!localStorage.getItem('unclutter_onboarding_v1');
const onboardingIncomplete = profile.type !== 'user' && profile.onboardingCompleted === false;

if (hasSavedOnboarding && onboardingIncomplete) {
  navigate('/register/onboarding', { state: { resumeOnboarding: true } });
  return;
}

navigate(profile.type === 'user' ? '/dashboard' : profile.type === 'platform_admin' ? '/admin' : '/portal');
```

If the project uses a different onboarding field name, use that exact field instead.

- [ ] **Step 4: Expose onboarding completion field through auth context if missing**

If `profile.onboardingCompleted` is not available today, add it in the smallest possible way where the authenticated profile is normalized in `apps/web/src/context/AuthContext.tsx`.

Target shape example:

```ts
type AuthProfile = {
  ...
  onboardingCompleted?: boolean;
};
```

If the backend payload lacks this field entirely, add a minimal source for it from the existing tenant/profile response rather than creating a new endpoint unless necessary.

- [ ] **Step 5: Run web typecheck**

Run: `npm run typecheck`

Workdir: `apps/web`

Expected: successful typecheck.

- [ ] **Step 6: Manual verification of login recovery behavior**

Verify:
- saved draft + incomplete onboarding redirects into onboarding
- saved draft + completed onboarding lands in normal dashboard/portal
- no draft behaves exactly as before

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/pages/auth/LoginPage.tsx apps/web/src/context/AuthContext.tsx
git commit -m "fix: gate onboarding recovery on incomplete setup"
```

---

### Task 3: Add Downgrade Eligibility Metadata to Billing Summary

**Files:**
- Modify: `apps/api/src/modules/billing/billing.service.ts`
- Modify: `apps/web/src/pages/SubscriptionSettingsPage.tsx`

- [ ] **Step 1: Extend billing summary API with downgrade guard data**

In `apps/api/src/modules/billing/billing.service.ts`, compute:
- `staffCount` for roles not in `CLIENT`, `OWNER`
- `therapistCount` for role `THERAPIST`
- `canDowngradeToStarter`
- `canDowngradeToPro`
- `starterBlockReason`
- `proBlockReason`

Target logic:

```ts
const staffCount = await this.prisma.profile.count({
  where: { tenantId, role: { notIn: ['CLIENT', 'OWNER'] } },
});

const therapistCount = await this.prisma.profile.count({
  where: { tenantId, role: 'THERAPIST' },
});

const canDowngradeToStarter = staffCount === 0;
const canDowngradeToPro = therapistCount <= 1;

const starterBlockReason = canDowngradeToStarter
  ? null
  : 'Remove active staff members before downgrading to Starter.';

const proBlockReason = canDowngradeToPro
  ? null
  : 'Group practices with multiple therapists require the Clinic plan.';
```

Return them inside `subscription` or a sibling `eligibility` object, keeping the shape simple.

- [ ] **Step 2: Run API typecheck**

Run: `npm run typecheck`

Workdir: `apps/api`

Expected: successful typecheck.

- [ ] **Step 3: Update web billing summary types**

In `apps/web/src/pages/SubscriptionSettingsPage.tsx`, extend `SubscriptionRecord` or introduce an `eligibility` type matching the API response.

Target example:

```ts
type SubscriptionRecord = {
  subscriptionTier: 'STARTER' | 'PRO' | 'CLINIC';
  nextBillingDate: string;
  nextChargeAmount: string;
  currentMonthBookings?: number;
  canDowngradeToStarter?: boolean;
  canDowngradeToPro?: boolean;
  starterBlockReason?: string | null;
  proBlockReason?: string | null;
};
```

- [ ] **Step 4: Disable blocked downgrade cards in the subscription UI**

Update the plan card render logic in `apps/web/src/pages/SubscriptionSettingsPage.tsx` so blocked downgrade targets are not clickable.

Target helper pattern:

```ts
function getPlanDisabledReason(plan: 'STARTER' | 'PRO' | 'CLINIC', subscription: SubscriptionRecord) {
  if (plan === 'STARTER' && subscription.canDowngradeToStarter === false) return subscription.starterBlockReason || 'Downgrade blocked';
  if (plan === 'PRO' && subscription.canDowngradeToPro === false && subscription.subscriptionTier === 'CLINIC') return subscription.proBlockReason || 'Downgrade blocked';
  return null;
}
```

Use the result to:
- prevent `handleSelectPlan` from firing
- add muted styling
- render helper text inside the card

- [ ] **Step 5: Add explanatory text on blocked plans**

Inside the card body, add visible copy when blocked.

Target pattern:

```tsx
{disabledReason ? (
  <div className="rounded-[12px] bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] font-medium text-amber-800">
    {disabledReason}
  </div>
) : null}
```

- [ ] **Step 6: Run web typecheck**

Run: `npm run typecheck`

Workdir: `apps/web`

Expected: successful typecheck.

- [ ] **Step 7: Manual verification of downgrade UX**

Verify:
- eligible downgrade stays clickable
- blocked downgrade is visibly disabled
- explanatory reason is visible
- API rejection path still works if UI state drifts

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/billing/billing.service.ts apps/web/src/pages/SubscriptionSettingsPage.tsx
git commit -m "feat: show downgrade eligibility in subscription ui"
```

---

### Task 4: Complete Discount Code Flow on Public Booking Page

**Files:**
- Modify: `apps/web/src/pages/ClientBookingPage.tsx`
- Modify: `apps/api/src/modules/discount/discount.service.ts`
- Modify: `apps/api/src/modules/discount/discount.controller.ts`
- Modify: `apps/api/src/modules/consult/consult.service.ts` (only if extra response fields are needed)

- [ ] **Step 1: Confirm public booking page has access to tenant id**

Inspect the booking page’s brand/public context source. If `tenantId` is already available through the current public tenant payload, reuse it. If not, expose it in the smallest current payload already fetched by the booking page.

Expected outcome: the booking page can call `POST /v1/discount/validate` with `tenantId`, `code`, and `priceKobo`.

- [ ] **Step 2: Extend discount validation response for UI preview**

In `apps/api/src/modules/discount/discount.service.ts`, return a richer preview object including amount saved.

Replace the current return block with:

```ts
const finalKobo = Math.round(discounted);
const amountSavedKobo = Math.max(0, Number(priceKobo) - finalKobo);

return {
  discountType: dc.discountType,
  originalKobo: priceKobo.toString(),
  finalKobo: finalKobo.toString(),
  amountSavedKobo: amountSavedKobo.toString(),
  code: dc.code,
  label: dc.label,
  discountPercent: dc.discountPercent,
  discountAmountKobo: dc.discountAmountKobo?.toString() ?? null,
};
```

- [ ] **Step 3: Run API typecheck after discount response update**

Run: `npm run typecheck`

Workdir: `apps/api`

Expected: successful typecheck.

- [ ] **Step 4: Add local state for discount input and preview to booking page**

In `apps/web/src/pages/ClientBookingPage.tsx`, add state for:

```ts
const [discountCode, setDiscountCode] = useState('');
const [discountLoading, setDiscountLoading] = useState(false);
const [discountError, setDiscountError] = useState<string | null>(null);
const [discountPreview, setDiscountPreview] = useState<{
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  originalKobo: string;
  finalKobo: string;
  amountSavedKobo: string;
  discountPercent?: number | null;
  discountAmountKobo?: string | null;
} | null>(null);
```

- [ ] **Step 5: Add apply-discount action to booking page**

In `apps/web/src/pages/ClientBookingPage.tsx`, create a handler that validates against the selected service price.

Target pattern:

```ts
const handleApplyDiscount = async () => {
  if (!selectedService || !discountCode.trim() || !brand.id) return;
  setDiscountLoading(true);
  setDiscountError(null);
  try {
    const preview = await api.post('/v1/discount/validate', {
      tenantId: brand.id,
      code: discountCode.trim(),
      priceKobo: selectedService.priceKobo,
    });
    setDiscountPreview(preview);
  } catch (err) {
    setDiscountPreview(null);
    setDiscountError(err instanceof Error ? err.message : 'Unable to apply code');
  } finally {
    setDiscountLoading(false);
  }
};
```

If `brand.id` is not the actual field name, use the real public tenant id field.

- [ ] **Step 6: Clear stale discount preview when service changes**

Add a `useEffect` in `apps/web/src/pages/ClientBookingPage.tsx` so changing the selected service resets the preview, since price and eligibility may differ.

Target pattern:

```ts
useEffect(() => {
  setDiscountPreview(null);
  setDiscountError(null);
}, [selectedServiceId]);
```

- [ ] **Step 7: Render discount input and pricing breakdown in the booking summary**

In `apps/web/src/pages/ClientBookingPage.tsx`, replace the single total-only summary with:
- input field for code
- `Apply code` button
- applied badge or inline success text
- `Original`
- `Discount`
- `Final total`

Target UI structure:

```tsx
<div className="space-y-3">
  <div className="flex gap-2">
    <input ... value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} />
    <button type="button" onClick={handleApplyDiscount} disabled={discountLoading || !discountCode.trim()}>
      {discountLoading ? 'Applying...' : 'Apply code'}
    </button>
  </div>
  {discountError ? <p className="text-[11.5px] text-red-500 font-medium">{discountError}</p> : null}
  {discountPreview ? <p className="text-[11.5px] text-emerald-700 font-bold">Code {discountPreview.code} applied</p> : null}
</div>
```

And pricing rows:

```tsx
const originalKobo = selectedService?.priceKobo ?? '0';
const finalKobo = discountPreview?.finalKobo ?? originalKobo;
const amountSavedKobo = discountPreview?.amountSavedKobo ?? '0';
```

- [ ] **Step 8: Pass discount code during booking submission**

Update the booking request in `apps/web/src/pages/ClientBookingPage.tsx` to include the applied code only when a preview exists.

Target payload fragment:

```ts
discountCode: discountPreview ? discountPreview.code : undefined,
```

- [ ] **Step 9: Keep booking backend response unchanged unless UI needs more fields**

Only modify `apps/api/src/modules/consult/consult.service.ts` if the confirmation page or booking flow needs discount values after booking succeeds. If not needed, do not expand the booking response.

- [ ] **Step 10: Run web typecheck**

Run: `npm run typecheck`

Workdir: `apps/web`

Expected: successful typecheck.

- [ ] **Step 11: Manual verification of discount flow**

Verify:
- valid percent code updates summary
- valid fixed code updates summary
- invalid code shows inline error
- changing service clears applied code preview
- final booking request includes `discountCode`
- backend increments `usedCount`

- [ ] **Step 12: Commit**

```bash
git add apps/web/src/pages/ClientBookingPage.tsx apps/api/src/modules/discount/discount.service.ts apps/api/src/modules/discount/discount.controller.ts
git commit -m "feat: add public booking discount flow"
```

---

### Task 5: Reconcile Walkthrough Documentation With Actual State

**Files:**
- Modify: `/Users/olalekan/.gemini/antigravity/brain/13f15e0c-cfc3-4e14-ab32-fb95a030e885/walkthrough.md`

- [ ] **Step 1: Re-read the implemented behavior after Tasks 1-4**

Confirm the final shipped behavior in the touched files matches the operationalization claims.

- [ ] **Step 2: Update walkthrough wording to describe the final state exactly**

Edit `walkthrough.md` so it:
- describes Phases 1, 3, 4, and 5 as fully complete only if Tasks 1-4 are finished
- removes any wording that implies behavior not present in the code
- keeps remaining phases limited to 2 and 6

- [ ] **Step 3: Proofread for contradictions against `implementation_plan.md`**

Check specifically:
- Phase 1 UI and API claims
- Phase 3 note prompt claims
- Phase 4 onboarding recovery claims
- Phase 5 end-to-end booking discount claims

- [ ] **Step 4: Commit**

```bash
git add /Users/olalekan/.gemini/antigravity/brain/13f15e0c-cfc3-4e14-ab32-fb95a030e885/walkthrough.md
git commit -m "docs: align walkthrough with delivered phases"
```

---

## Final Validation

- [ ] Run API typecheck

Run: `npm run typecheck`

Workdir: `apps/api`

Expected: PASS

- [ ] Run web typecheck

Run: `npm run typecheck`

Workdir: `apps/web`

Expected: PASS

- [ ] Smoke test the following user flows

Verify:
- mark session complete -> navigate to correct SOAP note target
- login with saved onboarding draft and incomplete onboarding -> resume onboarding
- login with stale draft and completed onboarding -> normal landing
- blocked downgrade plans are visibly disabled with reasons
- booking page supports discount apply and final price preview

- [ ] Review `git diff` for only intended files

Run: `git diff -- apps/api/src/modules/billing/billing.service.ts apps/api/src/modules/consult/consult.service.ts apps/api/src/modules/discount/discount.controller.ts apps/api/src/modules/discount/discount.service.ts apps/web/src/pages/ClientBookingPage.tsx apps/web/src/pages/SubscriptionSettingsPage.tsx apps/web/src/pages/auth/LoginPage.tsx apps/web/src/pages/SchedulePage.tsx apps/web/src/context/AuthContext.tsx "/Users/olalekan/.gemini/antigravity/brain/13f15e0c-cfc3-4e14-ab32-fb95a030e885/walkthrough.md"`

Expected: only planned changes present.
