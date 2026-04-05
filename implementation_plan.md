# Buddas CRM — Implementation Plan - CRM Architecture Upgrade (Phases 1-6)
> Audit date: 2026-03-30 | Based on full codebase scan

---

## Audit Scorecard

| Area | Grade | Notes |
|---|---|---|
| Architecture | B+ | Solid service layer, clean routes, minor confusion between requests/orders |
| Auth & Permissions | C | Frontend role-checks exist; backend enforces nothing |
| Pages & Routing | C+ | 6 routes navigated to from sidebar/nav that don't exist |
| Data Services | B | Lead/Company/Contact solid; Analytics stubbed; Request incomplete |
| API Routes | B+ | Two routes fully functional; missing CRUD endpoints |
| UI / Button Wiring | C | Multiple buttons with no handlers or routes |
| Type Safety | B | TypeScript throughout; some `any`, magic role strings |
| Error Handling | C+ | Client-side decent; service layer swallows errors silently |
| Performance | B- | React Query good; N+1 on companies; client-side filtering on large sets |
| **Overall** | **C+** | Solid bones, significant gaps before production |

---

## Phase 1 — Critical Blockers
> Nothing else ships without these

### 1.1 — Fix broken navigation destinations
**Files:** `src/components/crm/Sidebar.tsx`, `src/components/crm/TopNav.tsx`

Dead nav links cause 404s for every user on every session. Either build the pages (preferred) or remove the links until built.

| Link | Status | Action |
|---|---|---|
| `/app/menus` | Missing page | Build it (Phase 3) or remove from Sidebar |
| `/app/inbox` | Missing page | Remove from Sidebar (out of scope for now) |
| `/app/profile` | Missing page | Redirect to `/app/settings` or build thin profile page |

**Quick fix (unblock now):** Redirect `/app/profile` → `/app/settings`. Remove Menus and Inbox from Sidebar nav until built.

---

### 1.2 — Wire up "Convert to Company" on Lead Detail
**File:** `src/app/(crm)/app/leads/[id]/page.tsx`
**Service:** `src/lib/firebase/services/lead.service.ts` → `convertLeadToCompany()` (exists, not called)

Button exists, handler exists in the service, click handler is missing entirely. Wire the button → call the service → redirect to `/app/companies/[id]`.

---

### 1.3 — API route auth enforcement
**Files:** `src/app/api/catering-lead/route.ts`, `src/app/api/corporate-signup/route.ts`

Neither API route verifies a Firebase Auth token. Any unauthenticated request can write to Firestore. Add token verification using Firebase Admin SDK at the top of every route handler.

```ts
// Pattern for every protected API route
const token = req.headers.get('authorization')?.split('Bearer ')[1]
if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const decoded = await adminAuth.verifyIdToken(token)
```

> **Exception:** `/api/catering-lead` is called from the *public* landing page (unauthenticated visitors). Keep it open but add rate-limiting.

---

### 1.4 — Backend permission enforcement on destructive service calls
**Files:** `src/lib/firebase/services/lead.service.ts`, `src/lib/firebase/services/request.service.ts`

`deleteLeads()`, `batchUpdateLeads()`, `deleteCateringRequest()` have no permission checks. A rep can currently delete any lead, including ones not assigned to them. Add `callerId` / `callerRole` parameters and enforce ownership/role in each function before executing.

---

## Phase 2 — High Impact Gaps
> Core CRM workflows are incomplete

### 2.1 — Orders: create + edit flows
**Missing routes:**
- `/app/orders/new` — new order form (button exists on Orders page, no destination)
- `/app/orders/[id]/edit` — edit existing order (option exists in row dropdown, no destination)

The auto-creation from lead approval covers inbound leads, but reps need to create orders manually for walk-in and phone accounts. Build a form that calls a new `createCateringRequest()` service method.

### [Component] Rep Accountability (Phase 2)
Implement a systematic task and activity tracking system.

#### [NEW] [task.service.ts](file:///Volumes/MiDRIVE/WORK/A-C/BUDDAS/CATERING/buddas-catering/src/lib/firebase/services/task.service.ts)
- Implement `createTask`, `updateTask`, `completeTask`, `getTasksByRep`, and `getTasksByEntity`.
- Add auto-task creation for lead qualification and membership renewal.

#### [NEW] [FollowUpWidget](file:///Volumes/MiDRIVE/WORK/A-C/BUDDAS/CATERING/buddas-catering/src/components/crm/FollowUpWidget.tsx)
- Reusable dashboard component to show "Due Today" and "Overdue" tasks.

#### [MODIFY] [CompanyDetailPage](file:///Volumes/MiDRIVE/WORK/A-C/BUDDAS/CATERING/buddas-catering/src/app/(crm)/app/companies/[id]/page.tsx)
- Add "Active Tasks" section.
- Integrate "Log Activity & Task" unified creator.

### [Component] Performance & Reporting (Phase 4)
Implement rep scorecards and pipeline funnel visibility.

#### [MODIFY] [analytics.service.ts](file:///Volumes/MiDRIVE/WORK/A-C/BUDDAS/CATERING/buddas-catering/src/lib/firebase/services/analytics.service.ts)
- Add aggregation logic for `leadsContacted`, `firstOrdersBooked`, and `commissionRevenue`.

#### [NEW] [RepScorecard](file:///Volumes/MiDRIVE/WORK/A-C/BUDDAS/CATERING/buddas-catering/src/components/crm/RepScorecard.tsx)
- Visual metrics grid for rep performance.

---

### [Component] Commitment & Commission (Phase 5)
Visual commitment tracking and commission review queue.

#### [NEW] [CommitmentProgress](file:///Volumes/MiDRIVE/WORK/A-C/BUDDAS/CATERING/buddas-catering/src/components/crm/CommitmentProgress.tsx)
- Visualization of tier usage, term dates, and "Qualifying" status.

#### [MODIFY] [CommissionApprovalView](file:///Volumes/MiDRIVE/WORK/A-C/BUDDAS/CATERING/buddas-catering/src/app/(crm)/app/approvals/page.tsx)
- Add "Eligibility Logic" (Reason for mismatch, qualifying total).

---

### [Component] Ops Monitoring (Phase 6)
SLA-style flags and discipline tools.

#### [MODIFY] [Dashboard](file:///Volumes/MiDRIVE/WORK/A-C/BUDDAS/CATERING/buddas-catering/src/app/(crm)/app/page.tsx)
- Add Pipeline Funnel metric blocks.

## Verification Plan
buttons. The approval pattern already exists for commissions. Build matching `approveProgramSignup()` / `rejectProgramSignup()` methods in `membership.service.ts` and add Approve / Reject buttons to the Applications tab.

---

### 2.3 — Commission calculation
**File:** `src/lib/firebase/services/request.service.ts` → `completeCateringRequest()`

Commission records are auto-generated at fulfillment but the `amount` field is always empty. Define a commission rate (configurable in `system_configs`, default 10%) and calculate it against `totalAmount` at the time of fulfillment.

---

### 2.4 — Analytics service — real data
**File:** `src/lib/firebase/services/analytics.service.ts`

All four functions return hardcoded sample arrays. The Reports page is entirely fictional. Replace each with real Firestore aggregation queries:

| Function | Real query |
|---|---|
| `getLeadSourceStats()` | Count leads grouped by `source` field |
| `getRepPerformanceMetrics()` | Leads closed + revenue per `assignedTo` |
| `getCompanyLTVStats()` | Sum of completed request `totalAmount` per `companyId` |
| `getPipelineVelocity()` | Avg days between `createdAt` → `status = Approved` per rep |

---

### 2.5 — Export CSV (leads + orders)
**Files:** Leads page, Orders page

Both have "Export CSV" buttons with no implementation. Add a shared utility:

```ts
// src/lib/utils/export.ts
export function exportToCsv(rows: Record<string, unknown>[], filename: string)
```

Wire each button to call it with the currently-filtered dataset already in React Query cache — no extra Firestore fetch needed.

---

### 2.6 — Contact and Company edit forms
**Files:**
- `src/app/(crm)/app/contacts/[id]/page.tsx` — currently read-only
- `src/app/(crm)/app/companies/[id]/page.tsx` — has create modal, no update path

Add inline-edit or a slide-over edit panel for both. Company service has `createCompany()` — add `updateCompany()`. Contact service needs `updateContact()`.

---

## Phase 3 — Medium Priority
> UX and data integrity

### 3.1 — Menu management page (`/app/menus`)
Build a CRUD page backed by the existing `menu-item` Sanity schema. Reps need to reference what's available when building quotes. Three views: All Items, By Category, Packages. Read from Sanity client; write via Sanity mutations.

---

### 3.2 — Requests vs Orders naming — consolidate
The codebase uses "requests", "orders", and "catering requests" interchangeably. `/app/requests` redirects to `/app/orders`. Pick one term and be consistent:

**Decision:** Use **"Orders"** everywhere in the UI. Keep `cateringRequests` as the Firestore collection name (already indexed). Remove all `/app/requests/*` routes and replace with permanent redirects to `/app/orders/*`.

---

### 3.3 — Orphaned record cleanup on lead delete
**File:** `src/lib/firebase/services/lead.service.ts` → `deleteLeads()`

Deleting a lead leaves its associated `cateringRequest`, `activities`, and `notifications` orphaned in Firestore. Extend the batch delete to also clean up child records.

---

### 3.4 — Lead duplicate flag — surface in UI
**File:** `src/app/(crm)/app/leads/page.tsx`

`isDuplicate: true` is stored on leads but never shown. Add a yellow badge in the leads table and a warning banner on the lead detail page so reps know to merge rather than work duplicates in parallel.

---

### 3.5 — Status history — display in detail views
`statusHistory[]` is stored on leads and requests but never rendered. Add a collapsible `<StatusTimeline>` component on Lead Detail and Order Detail showing each status change with timestamp and author name.

---

### 3.6 — Magic role strings → typed constants
`'owner'`, `'rep'`, `'ops'`, `'marketing'` appear as raw strings across 12+ files. One typo silently breaks permissions.

```ts
// src/lib/constants/roles.ts
export const ROLES = {
  OWNER: 'owner',
  REP: 'rep',
  OPS: 'ops',
  MARKETING: 'marketing',
} as const
export type Role = typeof ROLES[keyof typeof ROLES]
```

Replace all raw string usages throughout the codebase.

---

### 3.7 — Firestore index audit
Several queries filter and order by multiple fields (e.g., leads by `assignedTo` + `status` + `createdAt`). Verify `firestore.indexes.json` covers every compound query in use. Missing indexes cause silent query failures at scale.

---

### 3.8 — Silent error swallowing in services
Services catch errors and return `null` / empty arrays without logging or rethrowing. React Query never enters its error state so the UI shows empty data instead of an error.

```ts
// Bad — UI sees empty result, not the actual error
} catch { return [] }

// Good — let React Query handle it
} catch (err) {
  console.error('[requestService.getAll]', err)
  throw err
}
```

---

## Phase 4 — Low Priority / Polish

### 4.1 — Report action buttons: real behaviour
Three buttons currently show a fake toast only:
- "Generate Custom Audit" — remove or build as a real PDF export
- "Analyze Bottlenecks" — remove or wire to a real slow-lead query
- "Snapshot Export" — wire to `exportToCsv()` from Phase 2.5

---

### 4.2 — `triggerNotification()` stub in base.ts
**File:** `src/lib/firebase/services/base.ts`

Currently `console.log` only. Replace with a real call to `notification.service.ts` → `createNotification()` which already exists and works. One-line change.

---

### 4.3 — Large component refactoring
| File | ~Lines | Split into |
|---|---|---|
| Dashboard page | 600 | `<DashboardKPIs>`, `<ActivityFeed>`, `<ApprovalsQueue>` |
| Orders page | 400 | `<OrdersTable>`, `<OrderFilters>`, `<OrderActions>` |
| Reports page | 500 | `<RevenueSection>`, `<LeaderboardSection>`, `<ChannelSection>` |

---

### 4.4 — Error boundaries
Add a `<ErrorBoundary>` around the CRM layout so a single component crash doesn't whitepage the entire app.

---

### 4.5 — Cursor-based pagination
`getAllLeads()` fetches all leads then filters client-side. At 1,000+ records this becomes slow. Switch to Firestore cursor pagination using `startAfter()` + `limit()`.

---

### 4.6 — Strip console.log from services
Audit and remove all `console.log` / `console.warn` from service files. Replace with a thin `logger` utility that's a no-op in production.

---

## Execution Order (sprints)

| Sprint | Items | Outcome |
|---|---|---|
| **1** | 1.1, 1.2, 1.3, 1.4 | No broken links; auth enforced; convert-to-company works |
| **2** | 2.1, 2.2, 2.3 | Orders manually creatable; memberships approvable; commissions calculated |
| **3** | 2.4, 2.5, 2.6 | Reports show real data; CSV export works; contacts/companies editable |
| **4** | 3.1, 3.2, 3.3, 3.4, 3.5 | Menus page; naming consistent; data integrity; duplicate UX; status history |
| **5** | 3.6, 3.7, 3.8, 4.1–4.6 | Code quality, error handling, polish |

---

## Files to Create (net new)

| File | Purpose |
|---|---|
| `src/app/(crm)/app/orders/new/page.tsx` | New order form |
| `src/app/(crm)/app/orders/[id]/edit/page.tsx` | Edit order |
| `src/app/(crm)/app/menus/page.tsx` | Menu management |
| `src/lib/utils/export.ts` | CSV export utility |
| `src/lib/constants/roles.ts` | Typed role constants |
| `src/components/crm/StatusTimeline.tsx` | Status history display |
| `src/components/crm/ErrorBoundary.tsx` | CRM error boundary |

---

## Files to Modify (significant changes)

| File | Change |
|---|---|
| `src/components/crm/Sidebar.tsx` | Remove Inbox; redirect Profile; gate Menus behind feature flag |
| `src/app/(crm)/app/leads/[id]/page.tsx` | Wire Convert to Company button |
| `src/app/api/catering-lead/route.ts` | Add rate limiting |
| `src/app/api/corporate-signup/route.ts` | Add auth token verification |
| `src/lib/firebase/services/analytics.service.ts` | Replace stubs with real Firestore queries |
| `src/lib/firebase/services/request.service.ts` | Complete CRUD + commission calculation |
| `src/lib/firebase/services/membership.service.ts` | Add approve/reject for program signups |
| `src/lib/firebase/services/lead.service.ts` | Add permission params on destructive methods |
| `src/app/(crm)/app/memberships/page.tsx` | Add Approve/Reject to Applications tab |
| `src/app/(crm)/app/contacts/[id]/page.tsx` | Add edit form |
| `src/app/(crm)/app/companies/[id]/page.tsx` | Add edit form |
| `src/app/(crm)/app/reports/page.tsx` | Wire to real analytics; fix export buttons |
| `firestore.indexes.json` | Add missing compound indexes |
