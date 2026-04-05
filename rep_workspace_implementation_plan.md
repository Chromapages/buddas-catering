# Buddas CRM — Sales Rep Workspace Implementation Plan
> Authored: 2026-04-01 | Scope: Rep-role experience across all pages and components

---

## Objective

Build a focused, mobile-first sales workspace inside the existing CRM for Buddas outbound sales reps. No new backend. No separate app. Role-based views on the same Next.js + Firebase stack. Every item below is grounded in the current codebase.

---

## Audit Snapshot — Rep Experience Today

| Area | Grade | Notes |
|---|---|---|
| Dashboard | C+ | RepDashboard renders; priority bar counts are hardcoded |
| Lead Workflow | C | No status bump after logging activity; rep filter not auto-set |
| Lead → Order Bridge | D | No direct "Create Order from Lead" button exists |
| Activity Logging | B | QuickLogDrawer works; follow-up chaining works; task expansion hidden |
| Task System | B- | TaskWidget functional; Tasks page is thin wrapper only |
| Account Detail | B | CommitmentProgress, ActivityLog, AccountHealth all render |
| Scorecard | D+ | Page exists; 90% of metrics are hardcoded static values |
| Renewals | D | No dedicated rep renewal view; sync not automatic |
| Mobile UX | C | Bottom nav exists; touch targets inconsistent; some delays |
| Menus (proof tool) | B | Sanity-backed; works; not surfaced in rep flow |
| **Overall** | **C** | Strong skeleton, critical workflow gaps |

---

## Sprint 1 — Fix the Core Loop
> Goal: A rep can open the app, see their real workload, log activity, and chain a follow-up — all from mobile.

### 1.1 — Live priority bar counts on RepDashboard
**File:** `src/components/crm/RepDashboard.tsx` (lines 76–93)

The four status chips (Overdue, Due Today, Activation Need, New Leads) pull hardcoded values `2` and `4` for overdue/due-today. Wire them to real Firestore queries.

```ts
// Add to crm service or task.service:
getRepTaskSummary(repId: string): Promise<{
  overdue: number;
  dueToday: number;
}>
```

Query: tasks where `assignedRepId === repId` AND `status !== 'Complete'`:
- `overdue`: `dueDate < today`
- `dueToday`: `dueDate >= startOfToday AND dueDate < endOfToday`

Replace the hardcoded chip labels with live values from a `useQuery` call.

---

### 1.2 — Auto-set rep filter to self on Leads page
**File:** `src/app/(crm)/app/leads/page.tsx` (line 46)

Reps see all leads by default. For `isRep`, initialize `repFilter` state to `user.uid` instead of `"All"`.

```ts
const [repFilter, setRepFilter] = useState(isRep ? user!.uid : "All");
```

Show the rep filter dropdown only for `!isRep`. Reps should never need to filter to someone else's leads.

---

### 1.3 — Status bump prompt inside QuickLogDrawer
**File:** `src/components/crm/QuickLogDrawer.tsx`

After logging a CALL or EMAIL activity on a LEAD entity, surface a one-tap status advance chip before closing.

Logic:
- After successful `logActivity()` call, if `entityType === 'LEAD'` and `selectedType === 'CALL' || 'EMAIL'`
- Show inline prompt: `"Mark lead as Contacted?"` with two buttons: Skip / Mark Contacted
- If confirmed: call `updateLeadStatus(entityId, 'Contacted')` then close

This closes the gap where a rep logs a call but the lead stays "New" in Firestore.

New prop needed: `currentLeadStatus?: string` — pass from calling components so the prompt only appears when status is still "New" or "Contacted" (not "Quote Sent" or beyond).

---

### 1.4 — Expand "Next Step" section by default in task context
**File:** `src/components/crm/QuickLogDrawer.tsx` (line 44)

When the drawer is opened from a Task (i.e., the rep is completing a task and logging outcome), pre-expand the follow-up section so chaining the next task is obvious.

New prop: `autoExpandFollowUp?: boolean`

```ts
const [showTask, setShowTask] = useState(autoExpandFollowUp ?? false);
```

Pass `autoExpandFollowUp={true}` from `TaskWidget` when opening the drawer to complete a task.

---

### 1.5 — Mobile touch target audit
**Files:** `RepDashboard.tsx`, `TaskWidget.tsx`, `QuickLogDrawer.tsx`, `LeadSlideOver.tsx`

Apply `min-h-[44px]` to all action buttons in rep-facing components. Apply `touch-action: manipulation` via `style` or a Tailwind plugin to eliminate 300ms tap delay on interactive elements. Apply `gap-2` minimum between adjacent tap targets.

Priority buttons to fix:
- "Log Call" / "Log Touch" in RepDashboard list items
- Task complete/dismiss buttons in TaskWidget
- QuickLogDrawer activity type selector chips
- LeadSlideOver action row

---

### Sprint 1 Deliverables

| Item | File(s) Changed | Type |
|---|---|---|
| Live overdue/due-today counts | `RepDashboard.tsx`, `task.service.ts` or `crm.ts` | Modify |
| Rep filter defaults to self | `leads/page.tsx` | Modify |
| Status bump after call/email log | `QuickLogDrawer.tsx` | Modify |
| Auto-expand follow-up from task | `QuickLogDrawer.tsx`, `TaskWidget.tsx` | Modify |
| Touch target fixes | 4 component files | Modify |

---

## Sprint 2 — Lead → Account Conversion Flow
> Goal: A rep can take a lead from first contact through to a signed account without leaving the CRM or re-entering data.

### 2.1 — "Create Order from Lead" button on Lead Detail
**File:** `src/app/(crm)/app/leads/[id]/page.tsx`

No path currently exists from lead detail to order creation. Add a "Create Order" button visible when `lead.status === 'Quote Sent' || 'Contacted'`. On click, navigate to:

```
/app/orders/new?leadId={id}&companyId={lead.companyId}&contactId={lead.contactId}&companyName={lead.companyName}&contactName={lead.contactName}
```

**File:** `src/app/(crm)/app/orders/new/page.tsx`

Read query params and pre-populate the form fields. If `leadId` is present:
- Pre-fill company, contact, event type (from `lead.cateringNeed`), group size
- On successful order creation, call `updateLeadStatus(leadId, 'Quote Sent')`
- Redirect to `/app/leads/{leadId}` so the rep stays in context

---

### 2.2 — Wire "Convert to Account" on Lead Detail
**File:** `src/app/(crm)/app/leads/[id]/page.tsx`

`convertLeadToCompany()` exists in `lead.service.ts` but is not called from the UI. The button exists but has no handler.

Wire it:
```ts
const handleConvert = async () => {
  setIsConverting(true);
  try {
    const companyId = await convertLeadToCompany(id, user!.uid);
    await updateLeadStatus(id, 'Won');
    router.push(`/app/companies/${companyId}`);
  } catch {
    toast.error("Conversion failed");
  } finally {
    setIsConverting(false);
  }
};
```

Show the button only when `lead.status !== 'Won'` and `lead.status !== 'Lost'`. Show loading state during conversion.

---

### 2.3 — "Start Commitment" shortcut on Company Detail (rep view)
**File:** `src/app/(crm)/app/companies/[id]/page.tsx`

The `<NewCommitmentModal>` exists but is only accessible from an admin-facing button. For reps viewing their own accounts, surface a prompt when `commitment === null`:

> "No active commitment yet. Ready to sign them up?"  
> [Start Commitment] button

This triggers the same `<NewCommitmentModal>` already in the file. No new modal needed — just add the conditional banner above the CommitmentProgress section.

---

### 2.4 — Lead status flow: add "Approved" visual state
**File:** `src/app/(crm)/app/leads/page.tsx` (getStatusBadge, line 199)

The `Approved` and `Won` statuses exist in the `LeadStatus` type and filter chips but have no styled badge variants. Add:

```ts
case "Approved": return <Badge variant="success">Approved</Badge>;
case "Won": return <Badge variant="success">Won</Badge>;
case "Membership Discussed": return <Badge variant="default">Membership Discussed</Badge>;
case "Quote Sent": return <Badge variant="default">Quote Sent</Badge>;
```

---

### Sprint 2 Deliverables

| Item | File(s) Changed | Type |
|---|---|---|
| Create Order from Lead button | `leads/[id]/page.tsx`, `orders/new/page.tsx` | Modify |
| Convert to Account wired | `leads/[id]/page.tsx` | Modify |
| Start Commitment prompt | `companies/[id]/page.tsx` | Modify |
| Status badge for Approved/Won | `leads/page.tsx` | Modify |

---

## Sprint 3 — Scorecard: Replace Hardcoded Values with Live Data
> Goal: Every number on the rep's scorecard reflects real Firestore data for the current calendar month.

### 3.1 — Extend `getRepMonthlyStats()` with real aggregations
**File:** `src/lib/firebase/services/crm.ts` (or wherever `getRepMonthlyStats` lives)

Current return: `{ signups, goal }` — both partially real.

Add these computed fields:

| Field | Query |
|---|---|
| `leadsAssigned` | leads where `assignedRepId === repId` AND `createdAt >= startOfMonth` |
| `leadsContacted` | leads where `assignedRepId === repId` AND `status !== 'New'` AND `statusChangedAt >= startOfMonth` |
| `quotessent` | leads where `assignedRepId === repId` AND `status === 'Quote Sent'` this month |
| `wonDeals` | leads where `assignedRepId === repId` AND `status === 'Won'` AND `statusChangedAt >= startOfMonth` |
| `winRate` | `wonDeals / leadsContacted` (0 if no contacts) |
| `activationsThisMonth` | companies where `assignedRepId === repId` AND `firstOrderPlaced === true` AND `updatedAt >= startOfMonth` |
| `avgActivationDays` | avg days from company `createdAt` to first qualifying order date (this rep, last 90 days) |
| `overdueFollowUps` | tasks where `assignedRepId === repId` AND `status !== 'Complete'` AND `dueDate < now` |
| `commissionEstimate` | approved commissions where `repId === repId` this month (from `commission_approvals` collection) |

---

### 3.2 — Wire scorecard page to live stats
**File:** `src/app/(crm)/app/scorecard/page.tsx`

Replace every hardcoded metric value with the live field from `getRepMonthlyStats()`:

| Hardcoded | Replace With |
|---|---|
| `"72%"` win rate | `${stats.winRate}%` |
| `"14 Days"` activation | `${stats.avgActivationDays} Days` |
| `stats?.signups` new accounts | `stats.wonDeals` |
| `"1.2h"` response time | (defer — needs activity timestamp analysis, mark as `--` for now) |
| `"$42.5k"` pipeline value | Sum of `quoteAmount` on open leads assigned to rep |
| `"24.2%"` closing % | same as `winRate` or `wonDeals / leadsAssigned` |
| `"8"` activations | `stats.activationsThisMonth` |
| `"$1,450"` commission | `stats.commissionEstimate` formatted as currency |

Remove the hardcoded `"Top 10% this week"` badge until real ranking logic exists. Replace with a contextual nudge based on live data (e.g. "On track for your bonus bracket" if progress > 75% of goal).

---

### 3.3 — Strategic Insights: live nudges
**File:** `src/app/(crm)/app/scorecard/page.tsx` (lines 122–145)

Replace the two hardcoded insight list items with a computed nudge engine. Rules:

```ts
const insights = [];

if (stats.avgActivationDays > 10) {
  insights.push({
    type: 'warning',
    text: `Your activation average is ${stats.avgActivationDays} days — ${stats.avgActivationDays - 10} days over target. Push first orders on your ${activationPipeline.length} pending accounts.`
  });
}
if (stats.overdueFollowUps > 0) {
  insights.push({
    type: 'warning',
    text: `You have ${stats.overdueFollowUps} overdue follow-ups. Clear these before reaching out to new leads.`
  });
}
if (stats.winRate >= 70) {
  insights.push({
    type: 'success',
    text: `Your ${stats.winRate}% win rate is above target. Keep your outreach velocity up.`
  });
}
if (stats.wonDeals >= stats.goal) {
  insights.push({
    type: 'success',
    text: `Goal hit! You've signed ${stats.wonDeals} accounts this month. Focus on activating them.`
  });
}
```

Render max 3 insights. Show success type in teal, warning in orange — using existing color tokens.

---

### Sprint 3 Deliverables

| Item | File(s) Changed | Type |
|---|---|---|
| Extend getRepMonthlyStats | `crm.ts` service | Modify |
| Wire scorecard live metrics | `scorecard/page.tsx` | Modify |
| Live insight nudges | `scorecard/page.tsx` | Modify |

---

## Sprint 4 — Renewals Workspace
> Goal: Reps can see which accounts are expiring, prioritize outreach, and log renewal conversations without leaving the account view.

### 4.1 — Expiring accounts filter on Companies page
**File:** `src/app/(crm)/app/companies/page.tsx`

Add a filter chip group for account health state (existing filter likely shows All / Active / Inactive). Add:

- **Expiring Soon** — companies where linked membership `renewalDate` is within 60 days AND `status !== 'Lapsed'`
- **No First Order** — companies where `firstOrderPlaced === false` AND `createdAt` > 7 days ago
- **Lapsed** — companies where linked membership `status === 'Lapsed'`

Requires a new service function:
```ts
getCompaniesByHealthState(repId: string, state: 'expiring' | 'no-first-order' | 'lapsed'): Promise<Company[]>
```

Query strategy for "expiring": fetch active memberships where `renewalDate < 60 days from now`, then pull company IDs from those memberships.

---

### 4.2 — Renewal status banner on Company Detail
**File:** `src/app/(crm)/app/companies/[id]/page.tsx`

Above the CommitmentProgress section, show a contextual banner based on membership state:

| State | Banner | Color |
|---|---|---|
| `daysToRenewal <= 30` | "Renews in {N} days — start the renewal conversation" | Gold |
| `daysToRenewal <= 60` | "Renewal coming up in {N} days" | Teal |
| `status === 'Lapsed'` | "Commitment lapsed — re-engagement needed" | Orange |
| `firstOrderPlaced === false` AND `>7 days` | "No first order yet — activation priority" | Orange |

Compute `daysToRenewal` client-side from `commitment.renewalDate` (already in data).

---

### 4.3 — Renewal activity type in QuickLogDrawer
**File:** `src/components/crm/QuickLogDrawer.tsx`

Add `RENEWAL` as a selectable activity type alongside CALL, EMAIL, MEETING, NOTE:

```ts
{ id: 'RENEWAL', label: 'Renewal', icon: RefreshCw, color: 'text-teal-500', bg: 'bg-teal-50' },
```

When `selectedType === 'RENEWAL'`, show an additional outcome selector:

```
Outcome:
○ Renewed — agreed to continue
○ Tier Change — moving to different tier  
○ Declined — will not renew
○ Undecided — needs more time
```

Store the outcome in the activity `data` payload as `renewalOutcome`. This lets managers filter the activity log for renewal conversations.

---

### 4.4 — `syncMembershipStatuses()` trigger
**File:** `src/app/(crm)/app/memberships/page.tsx`

`syncMembershipStatuses()` exists in `membership.service.ts` but is never called automatically. For now, add a manual trigger button (owner-only) on the memberships page. Long-term this should be a scheduled Cloud Function — mark as a future item.

```tsx
{role === 'owner' && (
  <Button variant="outline" onClick={handleRunSync}>
    Run Renewal Sync
  </Button>
)}
```

---

### Sprint 4 Deliverables

| Item | File(s) Changed | Type |
|---|---|---|
| Expiring/no-first-order filter | `companies/page.tsx`, `crm.ts` | Modify |
| Renewal state banner | `companies/[id]/page.tsx` | Modify |
| Renewal activity type | `QuickLogDrawer.tsx` | Modify |
| Manual sync trigger (owner) | `memberships/page.tsx` | Modify |

---

## Sprint 5 — Tasks Page Upgrade
> Goal: The Tasks page becomes a real daily work surface, not a thin wrapper around the TaskWidget.

### 5.1 — Full Tasks page rebuild
**File:** `src/app/(crm)/app/tasks/page.tsx`

Current state: renders `<TaskWidget>` inside padding. Replace with a proper tasks workspace.

Layout:

```
Header: "My Tasks" | [+ New Task] button
─────────────────────────────────────────
Filter tabs: All | Overdue | Due Today | Upcoming | Renewal | Activation
─────────────────────────────────────────
Task list — grouped by date bucket:
  OVERDUE
  ├── [entity avatar] Call back: First Baptist Church — due 2 days ago [Complete] [Snooze]
  TODAY
  ├── [entity avatar] Follow up on quote — Riverside Elementary — due today [Complete] [Log]
  UPCOMING
  ├── ...
```

Each task row:
- Entity name (linked to lead or company)
- Task subject
- Due date / overdue indicator
- Priority badge (High / Medium / Low)
- [Complete] button → marks task done, opens QuickLogDrawer to log outcome
- [Snooze] → reschedule modal (pick new date)

New service function needed:
```ts
getRepTasksByStatus(repId: string): Promise<{
  overdue: Task[];
  today: Task[];
  upcoming: Task[];
}>
```

---

### 5.2 — Quick-create task from Tasks page
**File:** `src/app/(crm)/app/tasks/page.tsx`

"+ New Task" button opens a lightweight modal:

Fields:
- Subject (text, required)
- Linked entity: Lead or Company (searchable select — use existing `searchCrm()` from `crm.ts`)
- Due date (date picker)
- Priority (Low / Medium / High)

On submit: calls `createTask()` from `task.service.ts`. Invalidates the tasks query.

---

### 5.3 — Task snooze
**File:** New small `<SnoozeModal>` component, used in tasks page

Simple modal: "Snooze until..." with quick options:
- Tomorrow
- In 2 days
- In 1 week
- Custom date

On confirm: calls `updateTask(taskId, { dueDate: newDate })`. Task moves from Overdue to Upcoming bucket.

---

### Sprint 5 Deliverables

| Item | File(s) Changed | Type |
|---|---|---|
| Tasks page full rebuild | `tasks/page.tsx` | Rewrite |
| `getRepTasksByStatus()` | `task.service.ts` or `crm.ts` | New function |
| Quick-create task modal | `tasks/page.tsx` (inline) | New |
| Snooze modal | `src/components/crm/SnoozeModal.tsx` | New file |

---

## Sprint 6 — Mobile Nav & Field UX Polish
> Goal: The rep's mobile experience is frictionless. Opening the app in the field takes under 3 seconds to first actionable item.

### 6.1 — MobileNavBar: correct rep-only links
**File:** `src/components/crm/MobileNavBar.tsx`

Audit current mobile nav items. For `isRep`, show exactly these 5:
1. Home (RepDashboard)
2. My Leads
3. Tasks
4. Log (opens QuickLogDrawer floating — no entity preselected, rep types search)
5. Scorecard

Remove any admin-only links from the mobile nav when `isRep`. The "Log" shortcut (item 4) should be a global floating quick-log that lets the rep search for any of their leads/companies and log immediately — no navigation required.

---

### 6.2 — Global quick-log from mobile nav
**File:** `src/components/crm/MobileNavBar.tsx`, extend `QuickLogDrawer.tsx`

When "Log" is tapped from the mobile nav with no entity context, open the QuickLogDrawer with an entity search field at the top:

```
Search: [__________________________]
        → First Baptist Church (Company)
        → Riverside Elementary (Lead)
```

On selection, the entity fills in and the drawer proceeds normally. Reuse `searchCrm()` from `crm.ts` — it already returns typed results with `id`, `type`, `title`, `link`.

New prop on QuickLogDrawer: `entitySearchMode?: boolean` — when true, show search field instead of assuming entity is pre-set.

---

### 6.3 — Menus page: surface in rep field flow
**File:** `src/app/(crm)/app/companies/[id]/page.tsx`, `src/app/(crm)/app/leads/[id]/page.tsx`

Add a "Show Menu" button (or link chip) on both lead detail and company detail. Links to `/app/menus`. This surfaces the menus page as a natural step in the rep's pitch flow ("let me show you what we offer") without requiring them to know where to navigate.

Button label: `View Menu Options →`
Placement: Near the catering need / event type section on both pages.

---

### 6.4 — `overscroll-behavior: contain` on list pages
**Files:** `leads/page.tsx`, `tasks/page.tsx`, `RepDashboard.tsx`

Add `overscroll-y-contain` (Tailwind) to the main scrollable container on all rep-facing list pages. This prevents accidental browser pull-to-refresh on mobile mid-scroll, which loses their position.

---

### Sprint 6 Deliverables

| Item | File(s) Changed | Type |
|---|---|---|
| Rep-only MobileNavBar items | `MobileNavBar.tsx` | Modify |
| Global quick-log from nav | `MobileNavBar.tsx`, `QuickLogDrawer.tsx` | Modify |
| "Show Menu" link on lead/account | `leads/[id]/page.tsx`, `companies/[id]/page.tsx` | Modify |
| overscroll-contain on lists | 3 page files | Modify |

---

## Execution Order

| Sprint | Focus | Key Outcome | Effort |
|---|---|---|---|
| **1** | Core loop fixes | Rep opens app, sees real data, logs call, chains follow-up | Low |
| **2** | Lead → account flow | Full conversion path works without leaving CRM | Medium |
| **3** | Live scorecard | Every scorecard number is real Firestore data | Medium |
| **4** | Renewals workspace | Reps can find and action expiring accounts | Medium |
| **5** | Tasks page | Real daily task surface, not a thin wrapper | Medium |
| **6** | Mobile polish | Field-sales grade UX on every rep screen | Low |

---

## Files to Create (net new)

| File | Purpose |
|---|---|
| `src/components/crm/SnoozeModal.tsx` | Task snooze date picker modal |

---

## Files to Modify (significant changes)

| File | Sprints |
|---|---|
| `src/components/crm/RepDashboard.tsx` | 1 |
| `src/components/crm/QuickLogDrawer.tsx` | 1, 4, 6 |
| `src/components/crm/TaskWidget.tsx` | 1 |
| `src/components/crm/MobileNavBar.tsx` | 6 |
| `src/app/(crm)/app/leads/page.tsx` | 1, 2 |
| `src/app/(crm)/app/leads/[id]/page.tsx` | 2, 6 |
| `src/app/(crm)/app/orders/new/page.tsx` | 2 |
| `src/app/(crm)/app/companies/page.tsx` | 4 |
| `src/app/(crm)/app/companies/[id]/page.tsx` | 2, 4, 6 |
| `src/app/(crm)/app/scorecard/page.tsx` | 3 |
| `src/app/(crm)/app/tasks/page.tsx` | 5 |
| `src/app/(crm)/app/memberships/page.tsx` | 4 |
| `src/lib/firebase/services/crm.ts` | 1, 3, 4 |
| `src/lib/firebase/services/task.service.ts` | 1, 5 |

---

## Data / Firestore Requirements

| New query / field | Collection | Notes |
|---|---|---|
| `getRepTaskSummary(repId)` — overdue + due today counts | `tasks` | Compound index: `assignedRepId` + `dueDate` + `status` |
| `getRepMonthlyStats()` extended fields | `leads`, `companies`, `commission_approvals` | Multiple collection queries, compose client-side |
| `getCompaniesByHealthState(repId, state)` | `memberships` → `companies` | Index on `renewalDate` + `status` + `active` |
| `getRepTasksByStatus(repId)` | `tasks` | Index: `assignedRepId` + `status` + `dueDate` |
| `updateTask(taskId, patch)` | `tasks` | For snooze |

Add to `firestore.indexes.json`:
```json
{ "collectionGroup": "tasks", "fields": [
  { "fieldPath": "assignedRepId", "order": "ASCENDING" },
  { "fieldPath": "status", "order": "ASCENDING" },
  { "fieldPath": "dueDate", "order": "ASCENDING" }
]}
```

---

## Role Boundaries (Preserved Throughout)

Nothing in this plan changes what reps can access on the backend. These remain admin-only:

- Commission approval / override → `approvals/page.tsx` (already filtered by role)
- Global rep reassignment → `leads/page.tsx` batch assign (keep owner/ops only)
- Membership CRUD → `memberships/page.tsx` (reps see via company detail only)
- Settings / system config → `settings/page.tsx` (already gated)
- All users list → `getSalesReps()` call (reps should not see this)
- `deleteLeads()`, `batchUpdateLeads()` → enforce `callerRole` check (existing gap, referenced in main plan Phase 1.4)

---

## Success Criteria

A rep workspace is complete when:

- [ ] Opening the app on mobile shows real overdue + due-today counts in under 2 seconds
- [ ] Logging a call takes under 30 seconds from tap to confirmation
- [ ] A new lead can be taken from "New" → "Won" → first order without re-entering data
- [ ] The scorecard shows zero hardcoded values
- [ ] Expiring accounts surface on the companies page without manual searching
- [ ] Tasks page shows overdue / today / upcoming grouped list with complete + snooze actions
- [ ] "Log" from mobile nav works without pre-navigating to a lead or company
- [ ] All action buttons pass 44×44px touch target minimum
