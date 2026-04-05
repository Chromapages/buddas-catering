# Buddas CRM — Sales Rep Workspace Full Audit
> Audit date: 2026-04-01 | Scope: Every rep-facing page, component, workflow, button, and data flow

---

## Audit Scorecard

| Area | Grade | Status |
|---|---|---|
| RepDashboard | B+ | Renders correctly; priority bar counts still hardcoded |
| Leads Page | B | Functional; rep filter not auto-set; status badges missing Won/Approved |
| Lead Detail | A- | Most complete page in the rep workspace; all buttons wired |
| Lead SlideOver | B | Works; duplicate timeline (inline + ActivityLog component) |
| Orders Page | B | Full CRUD; missing Invoiced/Paid status; not React Query (useEffect) |
| Orders/New | A- | Query param pre-fill works; membership discount not shown |
| Tasks Page | D+ | Thin wrapper around TaskWidget only; no grouped view |
| TaskWidget | B+ | Overdue/today/upcoming grouping works; completes task correctly |
| Scorecard Page | D | Page renders; 90% of values are static hardcoded strings |
| Companies Page | B- | Functional; no health-state filter chips |
| Company Detail | A- | Best implemented page; edit, commitment, health panel, banners all work |
| Account Health Panel | C+ | Renders; rep name shows "Service Team" not real name; Next Task is hardcoded |
| CommitmentProgress | A- | Visual and data correct; date field has dual-path (`endDate`/`renewalDate`) |
| ActivityLog (component) | B | Works; duplicate with QuickLogDrawer functionality |
| QuickLogDrawer | B+ | Solid UX; status bump prompt and `autoExpandFollowUp` prop working |
| MobileNavBar | A- | 5 correct links; global quick-log via `entitySearchMode` working |
| NewCommitmentModal | C+ | Works; tier names are Gold/Platinum/Black (not 2/4/6 events) |
| Menus Page | B | Sanity-backed; functional after category object bug fix |
| Scorecard Insights | D | Two hardcoded static insight strings |
| **Overall** | **B-** | Solid foundation; 6 specific fixable gaps prevent field readiness |

---

## Section 1 — RepDashboard (`/app`)

### What Works
- `<RepDashboard>` correctly rendered for `role === 'rep'` via `page.tsx:83`
- New Leads widget: live Firestore data via `getNeedsAttentionLeads(repId, 'rep')`
- Activation Pipeline: live via `getActivationPipeline(repId)`
- Stale Leads: live via `getStaleLeads(repId)`
- Inline "Log Call" / "Log Touch" buttons → open `<QuickLogDrawer>` correctly
- Monthly mini-scorecard: `getRepMonthlyStats(repId)` live
- TaskWidget renders correctly in sidebar column

### Bugs & Gaps

**BUG 1 — Priority bar counts are hardcoded**
```
File: src/components/crm/RepDashboard.tsx:78-93
```
The chips show hardcoded `"2 Overdue"` and `"4 Due Today"`. `getRepTaskSummary(repId)` exists in `task.service.ts:125` and returns live `{ overdue, dueToday }`. The priority bar just never calls it.

**Fix:**
```tsx
const { data: taskSummary } = useQuery({
  queryKey: ['task-summary', repId],
  queryFn: () => getRepTaskSummary(repId),
  enabled: !!repId,
});
// Then use: taskSummary?.overdue, taskSummary?.dueToday
```

**BUG 2 — TaskWidget queries only `"Upcoming"` status**
```
File: src/components/crm/TaskWidget.tsx:34
queryFn: () => getTasksByRep(user!.uid, "Upcoming")
```
`getTasksByRep` with `status = "Upcoming"` applies a Firestore `where("status", "==", "Upcoming")` filter. Overdue tasks are `status: "Upcoming"` with a past `dueDate` — this is correct. But the query `orderBy("dueDate", "asc")` combined with `where("status", "==", ...)` requires a composite Firestore index. If this index is missing, the query silently returns empty.

**Action:** Verify `firestore.indexes.json` has: `tasks` → `assignedRepId ASC + status ASC + dueDate ASC`.

**UX ISSUE — No empty state for each bucket**
If there are no overdue tasks but there are tasks due today, the UI is fine. But if there are zero tasks at all, the single empty state icon is correct. No issue here — confirmed working.

**DESIGN ISSUE — Priority bar horizontal scroll loses context on narrow screens**
The `no-scrollbar` class hides the scrollbar, so there's no affordance that more chips exist off-screen. Consider adding a right-side fade gradient to indicate overflow:
```tsx
<div className="relative">
  <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">...</div>
  <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-gray-bg pointer-events-none" />
</div>
```

---

## Section 2 — Leads Page (`/app/leads`)

### What Works
- Table with all columns renders and paginates correctly
- Status filter chips: New / Contacted / Quote Sent / Approved / Won / Lost (all present ✓)
- Rep filter dropdown works
- Duplicate email badge renders
- Bulk select + batch status update / assign / delete working
- Export CSV working
- LeadSlideOver opens on row click
- Inline "Log" button → opens `QuickLogDrawer`
- Board view link → `/app/leads/board`

### Bugs & Gaps

**BUG 3 — Rep filter not auto-set to self for reps**
```
File: src/app/(crm)/app/leads/page.tsx:46
const [repFilter, setRepFilter] = useState("All");
```
Reps see every lead from every rep. For `isRep`, this should initialize to `user.uid`. The rep filter dropdown should also be hidden for reps — they have no reason to view another rep's leads.

**BUG 4 — Status badge missing Won/Approved variants**
```
File: src/app/(crm)/app/leads/page.tsx:199-207
```
`getStatusBadge()` has cases for New / Contacted / Quote Sent / Lost but falls to `default: Badge variant="neutral"` for Approved and Won. These should be `variant="success"`.

**BUG 5 — Batch status update missing Won/Approved options**
```
File: src/app/(crm)/app/leads/page.tsx:481-488
```
The batch "Mark as..." select only offers: New / Contacted / Quote Sent / Lost. Won and Approved are missing.

**UX ISSUE — Mobile table overflow**
The leads table uses `overflow-x-auto` correctly but on narrow mobile screens, the `whitespace-nowrap` table renders 9 columns compressed. Reps using a phone will see a horizontally scrollable table with no visible scroll affordance. Consider a card-list fallback at `sm:` breakpoint.

**UX ISSUE — "Add Lead" button on mobile is a full desktop button**
On mobile, the "Add Lead" button in the header is full-width and visible. This is fine. But the "Export CSV" button has `hidden sm:flex` — it simply disappears on mobile with no mobile alternative. Acceptable for now.

---

## Section 3 — Lead Detail (`/app/leads/[id]`)

### What Works ✓
- Full inline edit form (contact name, phone, catering need, group size, notes, rep reassign)
- Status dropdown: New / Contacted / Quote Sent / Approved / Won / Lost — all trigger `updateLeadStatus()`
- **"Convert to Company" button: WIRED** → calls `convertLeadToCompany()` → updates status to Won → redirects to `/app/companies/[id]`
- **"Create Order" button: WIRED** → only shows when `status === 'Quote Sent' || 'Contacted'` → navigates to `/app/orders/new` with full query params pre-filled
- **"View Menu Options" link: WIRED** → `/app/menus` ✓
- **"Send Email" link: WIRED** → `mailto:` link ✓
- StatusTimeline (real `activities` Firestore data)
- Lead ownership card with rep display + avatar initial
- Loading and not-found states

### Gaps

**GAP — "Create Order" only shows for Contacted and Quote Sent**
```
File: src/app/(crm)/app/leads/[id]/page.tsx:434
{(lead.status === "Quote Sent" || lead.status === "Contacted") && (
```
What about `status === "Approved"`? An approved lead should also be able to have an order created. Add `"Approved"` to the condition.

**GAP — Status select missing "Membership Discussed"**
The LeadStatus type in `src/lib/types/index.ts` includes `'Membership Discussed'` but the status dropdown in lead detail only has: New / Contacted / Quote Sent / Approved / Won / Lost. Rep can never set this status from the detail page.

**GAP — "Convert to Company" button shows even after lead already has companyId**
```
File: src/app/(crm)/app/leads/[id]/page.tsx:432
```
When `lead.companyId` exists, the button label switches to "View Company" and `handleConvertToCompany` navigates to the company. This is correct behavior. However the button still uses `convertLeadToCompany` styling — it should visually look like a secondary navigation link, not a CTA.

**DESIGN — No visual indicator of lead age / urgency**
New leads have no "assigned X hours ago" or SLA warning. Leads assigned today and leads assigned 6 days ago look identical.

---

## Section 4 — Lead SlideOver (`<LeadSlideOver>`)

### What Works ✓
- Opens correctly from leads table row click
- Status dropdown (inline state machine) + save button → calls `updateLeadStatus()`
- Contact info grid (email, phone, company)
- Follow-up date input → calls `updateLead()` immediately on change (auto-save)
- Activity timeline (manual fetch via `getActivitiesByEntity`)
- `<ActivityLog>` component embedded at bottom for inline logging
- Convert to Account + Convert to Order buttons in footer

### Bugs & Gaps

**BUG 6 — Duplicate activity logging interface**
The SlideOver renders:
1. A custom inline activity timeline (lines 280-325) built with manual `getActivitiesByEntity` fetch
2. The `<ActivityLog>` component below it (line 316)

`<ActivityLog>` is a self-contained log input form. But the SlideOver already has a note input in the custom timeline section. A rep sees two separate "log activity" UIs in the same panel — this is confusing.

**Fix:** Remove the custom timeline section's note input. Keep the `<ActivityLog>` component only, and replace the inline timeline display with `<StatusTimeline entityType="LEAD" entityId={lead.id} />` (the real Firestore-backed component already used on lead detail page).

**BUG 7 — `handleAddNote` calls `createNote()` from `note.service`**
```
File: src/components/crm/LeadSlideOver.tsx:117-136
```
This writes to a `notes` collection, not the `activities` collection. But the inline timeline reads from `getActivitiesByEntity` (the `activities` collection). Notes added via this path won't appear in the timeline.

**Note:** `createNote` service exists in `note.service.ts`. The `<ActivityLog>` component calls `logActivity` (writes to `activities`). The SlideOver's handleAddNote calls `createNote` (writes to `notes`). These are different collections — rep notes may silently disappear from the timeline.

**BUG 8 — `handleConvertToOrder` doesn't redirect**
```
File: src/components/crm/LeadSlideOver.tsx:101-114
```
`convertLeadToOrder()` is called, `toast.success()` fires, `onClose()` is called — but there's no navigation. The rep is left on the leads page with no feedback on where the order went. Compare to lead detail page which navigates properly.

**UX ISSUE — Status dropdown in SlideOver shows only 5 statuses**
```
File: src/components/crm/LeadSlideOver.tsx:23
const STATUSES = ["New", "Contacted", "Quote Sent", "Approved", "Lost"];
```
Missing: `"Won"`. A rep closing a deal from the slide-over cannot mark it as Won. They'd have to open the full lead detail page.

---

## Section 5 — Orders Page (`/app/orders`)

### What Works ✓
- Full table with sort, filter (status + program type + date range), search, pagination
- Export CSV working
- "New Order" → `/app/orders/new` ✓
- "Details" → `/app/orders/[id]` ✓
- "Edit Order" → `/app/orders/[id]/edit` ✓
- "Mark Complete" → `completeCateringRequest()` → `toast.success` → `fetchOrders()`
- "Delete Order" → `ConfirmModal` → `deleteCateringRequest()` ✓
- Program badge (PROGRAM) rendering correctly

### Bugs & Gaps

**BUG 9 — Uses `useEffect` + manual `fetchOrders()` instead of React Query**
```
File: src/app/(crm)/app/orders/page.tsx:69-86
```
All other rep pages use React Query. Orders uses `useState + useEffect + manual fetch`. This means:
- No automatic cache invalidation
- `fetchOrders()` called again after every action (unnecessary re-fetch)
- No loading skeleton — just a table spinner
- Stale data on navigation return

**BUG 10 — Status filter missing "Invoiced" and "Paid"**
```
File: src/app/(crm)/app/orders/page.tsx:246-253
```
The `CateringRequest.fulfillmentStatus` type includes `"Invoiced"` and `"Paid"` but the filter dropdown only has: All / Pending / In Progress / Fulfilled / Cancelled. Reps can't filter for invoiced or paid orders.

**BUG 11 — `getStatusBadge()` missing Invoiced and Paid**
```
File: src/app/(crm)/app/orders/page.tsx:173-181
```
Orders with `fulfillmentStatus: "Invoiced"` or `"Paid"` fall to `default: Badge variant="neutral"` with no label. Both need explicit cases.

**GAP — Rep can delete orders**
`deleteCateringRequest()` is available from the dropdown for all users. Reps should not be able to delete completed or invoiced orders. Add a role check: only show "Delete Order" for `role !== 'rep'` or when `order.fulfillmentStatus === 'Pending'`.

---

## Section 6 — Orders/New (`/app/orders/new`)

### What Works ✓
- Query param pre-fill: `leadId`, `companyId`, `contactId`, `companyName`, `contactName`, `cateringNeed`, `estimatedGroupSize` — all read and applied ✓
- Company selector loads all companies
- On submit with leadId: `updateLeadStatus(leadId, 'Quote Sent')` + redirect to lead detail ✓
- Without leadId: redirect to `/app/orders` ✓
- Validation: company required before submit ✓

### Gaps

**GAP — No membership discount indicator**
When a company with an active commitment is selected, no discount is surfaced. The rep has no indication that this company gets 10/15/20% off. They might enter the wrong quote amount.

**Fix:** After `handleCompanyChange`, fetch `getActiveCommitmentByCompanyId(companyId)`. If found, render a badge near the Quote Amount field: `"Active Program: 15% discount applies"`.

**GAP — `inputMode` missing on number fields**
Group Size and Quote Amount use `type="number"` but no `inputMode="numeric"` or `inputMode="decimal"`. On iOS this opens the wrong keyboard layout.

**GAP — No contact selector**
Contact name is a free-text field. When pre-filled from a lead it's fine. But when creating a standalone order for an existing company, the rep should be able to select from the company's known contacts rather than typing a new name.

---

## Section 7 — Tasks Page (`/app/tasks`)

### What Works
- Page renders
- `<TaskWidget>` renders inside

### Bugs & Gaps

**BUG 12 — Tasks page is a nearly empty wrapper**
```
File: src/app/(crm)/app/tasks/page.tsx
```
The entire page is: title text + `<div className="max-w-4xl"><TaskWidget /></div>`.

`getRepTasksByStatus(repId)` exists in `task.service.ts:145` and returns `{ overdue, today, upcoming }`. The TaskWidget already groups these internally. But the page has no:
- Filter tabs (All / Overdue / Today / Upcoming)
- "New Task" creation button
- Task count summary header
- Snooze action per task
- Priority filter

This page needs a rebuild. The TaskWidget is good for the dashboard sidebar. The dedicated page should be a full task management surface.

---

## Section 8 — TaskWidget (`<TaskWidget>`)

### What Works ✓
- Queries `getTasksByRep(uid, "Upcoming")` — returns all non-completed tasks
- Correctly groups into overdue / today / upcoming using `isPast()` and `isToday()` from date-fns
- "Complete" button (checkbox icon) → opens `QuickLogDrawer` with `autoExpandFollowUp={true}` ✓
- After QuickLogDrawer `onSuccess`: calls `completeTask()` → invalidates task query ✓
- Entity link in each task row → correct href based on entityType ✓
- Task entity link for REQUEST goes to `/app/requests/[id]` — this route may not exist (requests was merged into orders). Should be `/app/orders/[id]`

### Bug

**BUG 13 — REQUEST entity link points to wrong route**
```
File: src/components/crm/TaskWidget.tsx:147
: task.entityType === "REQUEST"
  ? `/app/requests/${task.entityId}`
```
The `/app/requests` route was consolidated into `/app/orders`. This link would 404 for any task linked to a catering request.

**Fix:** Change to `/app/orders/${task.entityId}`.

---

## Section 9 — Scorecard Page (`/app/scorecard`)

### What Works
- Page renders without error
- `getRepMonthlyStats(repId)` called — `stats.signups` and `stats.goal` are live
- Progress bar animates to live value
- "View Your Scorecard" link (from RepDashboard mini-card) navigates correctly

### Bugs & Gaps

**BUG 14 — 8 of 10 displayed metrics are hardcoded static values**

| Metric shown | Real vs Hardcoded |
|---|---|
| Monthly sign-up goal | LIVE (`stats.signups / stats.goal`) |
| Goal progress bar | LIVE |
| Pipeline Value | HARDCODED `"$42.5k"` |
| Closing % | HARDCODED `"24.2%"` |
| Activations | HARDCODED `"8"` |
| Est. Commission | HARDCODED `"$1,450"` |
| Win Rate | HARDCODED `"72%"` |
| Avg. Activation | HARDCODED `"14 Days"` |
| New Accounts | LIVE (`stats.signups`) |
| Response Time | HARDCODED `"1.2h"` |

**BUG 15 — "Top 10% this week" badge is hardcoded**
```
File: src/app/(crm)/app/scorecard/page.tsx:47
```
This badge will always display regardless of actual performance. A rep who has closed 0 deals sees "Top 10% this week". This erodes trust in the entire scorecard.

**BUG 16 — Strategic Insights are hardcoded strings**
```
File: src/app/(crm)/app/scorecard/page.tsx:127-145
```
Two static insight strings. These will never change. A rep with 0 overdue follow-ups still sees "Focus on driving first orders for your 3 recently signed accounts."

**BUG 17 — "March 2026" month label is hardcoded**
```
File: src/app/(crm)/app/scorecard/page.tsx:44
"March 2026 Tracking"
```
Will show "March 2026" in April, May, forever. Should be `format(new Date(), 'MMMM yyyy')`.

---

## Section 10 — Company Detail (`/app/companies/[id]`)

### What Works ✓
- Full inline edit: name, type, email, phone, website, address → `updateCompany()` ✓
- Renewal banners: Lapsed (orange) / No First Order (orange) / Expiring in 30d (gold) / Expiring in 60d (teal) — all computed from live data ✓
- `<AccountHealthPanel>`: renders with commitment data ✓
- `<CommitmentProgress>`: progress bar, usage, expiry, qualifying min — all correct ✓
- `<NewCommitmentModal>`: opens from "Create Commitment" in Account Profile card ✓
- `<ContactManager>`: contacts list ✓
- `<ActivityLog>`: inline activity logging ✓
- Orders history table from `getRequestsByCompanyId` ✓
- "Log Activity" button in header — **currently wired to nothing** (see below)

### Bugs & Gaps

**BUG 18 — "Log Activity" header button has no handler**
```
File: src/app/(crm)/app/companies/[id]/page.tsx:159
<Button>Log Activity</Button>
```
No `onClick`. No `asChild`. Button renders and is clickable but does nothing. Should open `<QuickLogDrawer>` for this company entity.

**BUG 19 — AccountHealthPanel shows "Service Team" for owner rep**
```
File: src/components/crm/AccountHealthPanel.tsx:53
company.assignedRepId === 'admin_id' ? 'Admin' : 'Service Team'
```
This is a hardcoded check. Any rep's name will display as "Service Team" unless their UID is exactly `'admin_id'`. The component doesn't receive the rep's display name. It should use the user list or pass the rep name as a prop.

**BUG 20 — AccountHealthPanel "Next Task" is hardcoded "Outreach"**
```
File: src/components/crm/AccountHealthPanel.tsx:118
<span className="text-[11px] font-bold text-teal-dark truncate">Outreach</span>
```
Static string. Should query `getTasksByEntity('COMPANY', company.id)` and show the next upcoming task subject, or "No tasks" if none.

**BUG 21 — `lastActivityDate` passed as first request's `createdAt`**
```
File: src/app/(crm)/app/companies/[id]/page.tsx:167
lastActivityDate={requests[0]?.createdAt && 'toDate' in requests[0].createdAt ? (requests[0].createdAt as any).toDate() : undefined}
```
`requests[0]` is the first catering request — not the last activity. The panel should derive its `lastActivityDate` from the most recent `activities` collection entry for this company. A company with no recent calls but an old order will show an inaccurate "last touched" value.

**BUG 22 — NewCommitmentModal uses Gold/Platinum/Black tier names**
```
File: src/components/crm/NewCommitmentModal.tsx:26-29
{ value: "Gold", label: "Gold (10% Discount)" }
{ value: "Platinum", label: "Platinum (15% Discount)" }
{ value: "Black", label: "Black (20% Discount)" }
```
The Buddas program is "2 events / 4 events / 6 events". The modal uses completely different naming that isn't consistent with the rest of the system (CommitmentProgress shows "Tier 1/2/3", the signup wizard uses "2/4/6 events"). The tierMap maps Gold→tier:1, Platinum→tier:2, Black→tier:3. The labels shown to reps should match the marketing language: "2 Events/Year (10%)" etc.

**GAP — No "Start Commitment" prompt when commitment is null**
When a company has no commitment, the only way to create one is the small "Create Commitment" ghost button in the Account Profile card. A clearer activation prompt (banner or prominent CTA) would help reps know to take this action.

---

## Section 11 — CommitmentProgress Component

### What Works ✓
- Usage percent calculated correctly
- Remaining orders computed
- Expiring alert banner with orange background
- Progress bar color changes to orange at >90%
- Date displayed from either `endDate` or `renewalDate` (dual-path)

### Gap

**GAP — Dual date path can silently show wrong date**
```
File: src/components/crm/CommitmentProgress.tsx:79-80
commitment.endDate && 'toDate' in commitment.endDate ? format((commitment.endDate as any).toDate(), ...) :
commitment.renewalDate && 'toDate' in commitment.renewalDate ? format(...)
```
If both fields exist but are different dates, `endDate` takes priority. There's no warning or normalization. The data model in `crm.ts` has both `endDate: Timestamp` and `renewalDate: Timestamp` on the `Commitment` interface. These should be unified to one field.

---

## Section 12 — ActivityLog Component

### What Works ✓
- Activity type tabs (CALL / EMAIL / MEETING / NOTE) switch correctly
- Note textarea, submit → `logActivity()` writes to `activities` collection
- Follow-up schedule section → `createTask()` writes to `tasks` collection
- Toast feedback on success/fail

### Gaps

**GAP — Icon-only tab buttons have no accessible label**
```
File: src/components/crm/ActivityLog.tsx:96-110
```
The 4 activity type buttons use `title={type.label}` (tooltip on hover) but have no `aria-label`. Screen reader users and keyboard users get no label. Add `aria-label={type.label}` to each button.

**GAP — Submit button `disabled={loading || (!note && !showTask)}`**
If the rep opens the follow-up section but types no note, the button is disabled. But the rep might only want to create a follow-up task with no note — that should be valid. The condition `!showTask` enables submit even when note is empty if the task section is open, but only if `showTask === true`. This is correct. No bug — just confirm the UX intention is "note OR task, not both required".

---

## Section 13 — QuickLogDrawer

### What Works ✓
- Activity type selector: CALL / EMAIL / MEETING / NOTE
- Note textarea with autoFocus
- Follow-up task toggle → expands subject + date fields
- `autoExpandFollowUp` prop: pre-expands follow-up when coming from task context ✓
- `entitySearchMode` prop: renders entity search field when opened from global nav ✓
- Submit → `logActivity()` + optional `createTask()` in single call ✓
- `onSuccess` → invalidates parent queries ✓

### Gaps

**GAP — `entitySearchMode` prop exists on MobileNavBar call but handler logic not visible in file**
```
File: src/components/crm/QuickLogDrawer.tsx
```
The QuickLogDrawer received `entitySearchMode` as a prop in `MobileNavBar.tsx:76`. But reading the QuickLogDrawer file, there's no `entitySearchMode` prop in the interface or handler. The prop would be silently ignored. Either the file was updated after the reading or there's a mismatch.

**Action:** Verify `QuickLogDrawer.tsx` has `entitySearchMode?: boolean` in its `QuickLogDrawerProps` interface and the corresponding search UI.

**GAP — No status bump prompt after CALL/EMAIL on a LEAD entity**
The implementation plan (Sprint 1.3) called for a status bump prompt ("Mark as Contacted?") after logging a call or email on a New lead. This is not visible in the current `QuickLogDrawer.tsx`. The drawer closes after submit with no prompt.

**GAP — No outcome presets / smart defaults**
After selecting "CALL" type, there are no preset outcome options (e.g. "Left voicemail", "Connected - follow up needed", "Not interested"). The rep types freeform every time. Preset chips would speed up logging significantly in the field.

---

## Section 14 — MobileNavBar

### What Works ✓
- Only renders for `role === 'rep'` ✓
- 5 links: Home / My Leads / Tasks / Log / Scorecard — all correct destinations
- "Log" is a button (not a link) → opens `<QuickLogDrawer entitySearchMode />` ✓
- `min-h-[44px]` on all items ✓
- `style={{ touchAction: "manipulation" }}` on all items ✓
- `safe-area-bottom` class on container (handles iPhone notch) ✓
- `z-50` for proper layering ✓

### Gap

**GAP — No active state on "Log" button**
The other 4 links get `text-teal-dark` when active via `isActive` check. The "Log" button is always `text-brown/60` regardless. When the QuickLogDrawer is open, there's no visual feedback that the Log button is "active". Minor UX.

**GAP — "Tasks" mobile link goes to `/app/tasks` — a thin wrapper page**
When a rep taps Tasks from mobile, they see the thin page (title + TaskWidget). A rep on mobile expects a full task management surface, not a widget-in-a-page. This will feel underwhelming compared to the dashboard TaskWidget they already saw. Upgrading the tasks page (Section 7) resolves this.

---

## Section 15 — NewCommitmentModal

### Issues

**Issue 1 — Tier naming inconsistency (Major)**
See BUG 22. Gold/Platinum/Black vs 2/4/6 events.

**Issue 2 — `ordersCommitted` defaults to 10**
```
File: src/components/crm/NewCommitmentModal.tsx:40
ordersCommitted: 10
```
The program tiers are 2, 4, or 6 orders. The default of 10 is wrong and doesn't match any tier. A rep who submits without changing this field creates an invalid commitment.

**Fix:** Set `ordersCommitted` based on selected tier. When tier changes, auto-set this value:
```ts
"Gold" → ordersCommitted: 2
"Platinum" → ordersCommitted: 4  
"Black" → ordersCommitted: 6
```

Or better — remove `ordersCommitted` as a manual field entirely and derive it from the tier selection.

**Issue 3 — `initialCompanyId` disables company selector but shows no company name**
When the modal opens from a specific company page, the company selector is `disabled={!!initialCompanyId}`. But the visible `<Select>` still shows the companies list in its disabled state. Add the company name as text instead of a disabled dropdown.

---

## Section 16 — Menus Page (`/app/menus`)

### What Works ✓
- Sanity fetch via `client.fetch(menuItemsQuery)` working
- Category filter chips working (after GROQ projection fix)
- Search by name/description working
- Dietary badge display (Vegan, GF, Dairy-Free, etc.)
- Bestseller / featured fields available in query (not yet rendered)
- "Edit in Sanity Studio" link ✓

### Gap

**GAP — `isBestseller` and `isFeatured` fetched but not rendered**
The query fetches `isBestseller` and `isFeatured` fields but the card renders neither. A "Bestseller" badge on menu items would help reps pitch specific items to prospects.

**GAP — No price display using `priceTitle`**
The query fetches both `price` (number) and `priceTitle` (string, e.g. "Starting at $12/person"). The `formatPrice()` function handles number prices but `priceTitle` is never used. If `price` is null but `priceTitle` exists, price shows nothing.

**Fix:**
```tsx
{item.priceTitle ? (
  <span className="text-sm font-semibold text-teal-base">{item.priceTitle}</span>
) : item.price != null ? (
  <span className="text-sm font-semibold text-teal-base">{formatPrice(item.price)}</span>
) : null}
```

---

## Section 17 — Type System Gaps Affecting Rep Pages

### CRMTask type vs task.service usage
`CRMTask.entityType` is `'LEAD' | 'COMPANY' | 'CONTACT' | 'REQUEST'` but the TaskWidget uses it to build hrefs including `'/app/requests/'` which is the wrong route. The type should map REQUEST → orders route.

### `Lead.assignedRepName` missing from `crm.ts`
`src/types/crm.ts` Lead interface has `assignedRepId` but no `assignedRepName`. The lead detail page renders `lead.assignedRepName` — this works at runtime via `any` typing but TypeScript doesn't catch typos.

### `Company` — no `assignedRepName`
The AccountHealthPanel needs rep name but Company only has `assignedRepId`. A service lookup or denormalized `assignedRepName` field is needed.

---

## Section 18 — Global UX / Design Observations

### Consistency Issues

**Issue: Two activity logging UIs coexist**
`<ActivityLog>` (card-based inline logger) and `<QuickLogDrawer>` (slide-over drawer) are functionally identical. Both log activities and create tasks. Both appear on the same pages (company detail has ActivityLog; lead detail has QuickLogDrawer accessible from buttons). Pick one pattern per context — use QuickLogDrawer everywhere and remove ActivityLog as a standalone component, or vice versa.

**Issue: Badge colors inconsistent across pages**
- Lead status "New" → `variant="warning"` (orange) on leads page but displayed differently in SlideOver
- "Approved" → no badge in SlideOver STATUSES list, falls to default
- CommitmentStatus "Expiring" → `variant="warning"` in one place, `variant="danger"` in another

**Issue: `input type="date"` styling is inconsistent**
Some date inputs use the shared `<Input>` component, others are raw `<input type="date" className="...">`. On iOS, raw date inputs can look very different from styled ones. Standardize to the `<Input>` component everywhere.

### Missing `inputMode` attributes
All numeric inputs on rep-facing forms are missing `inputMode="numeric"` or `inputMode="decimal"`. On iOS, `type="number"` opens a basic numeric pad without decimal support depending on context.

Affected fields:
- Group size (orders/new, lead edit)
- Quote amount (orders/new)
- All quantity fields

### Overscroll
- `TaskWidget`: has `overscroll-y-contain` on the CardContent scroll container ✓
- `RepDashboard`: no `overscroll-y-contain` — the full page can trigger pull-to-refresh on mobile
- `leads/page.tsx`: no overscroll containment on the main div
- `orders/page.tsx`: no overscroll containment

### Font and heading inconsistency
Some page titles use `text-2xl font-bold font-heading text-teal-dark` and some add `underline-teal text-3xl` (leads page has both `text-2xl` and `text-3xl` applied, which is a bug — the `text-3xl` overrides `text-2xl` but both are present).

```
File: src/app/(crm)/app/leads/page.tsx:220
<h1 className="text-2xl font-bold font-heading text-teal-dark underline-teal text-3xl">
```

---

## Section 19 — Accessibility Gaps

| Issue | Location | Severity |
|---|---|---|
| Icon-only buttons in ActivityLog tabs have no `aria-label` | `ActivityLog.tsx:97-109` | Medium |
| Status dropdown in LeadSlideOver has no `<label>` | `LeadSlideOver.tsx:200` | Medium |
| Checkbox in leads table has no accessible label | `leads/page.tsx:319-323` | Medium |
| QuickLogDrawer activity type buttons use only `<span>` text labels | `QuickLogDrawer.tsx:130-139` | Low |
| Task complete button icon-only with no `aria-label` | `TaskWidget.tsx:154` | Medium |
| "Log" mobile nav button has no `aria-label` | `MobileNavBar.tsx:41-52` | Medium |

---

## Prioritized Fix List

### Critical (Fix Immediately — Affects Daily Rep Use)

| # | Bug | File | Fix |
|---|---|---|---|
| 1 | Priority bar shows hardcoded 2 Overdue / 4 Due Today | `RepDashboard.tsx:78-93` | Query `getRepTaskSummary(repId)` |
| 2 | REQUEST task link → 404 | `TaskWidget.tsx:147` | Change to `/app/orders/` |
| 3 | "Log Activity" button does nothing | `companies/[id]/page.tsx:159` | Add `onClick → QuickLogDrawer` |
| 4 | Scorecard month label hardcoded "March 2026" | `scorecard/page.tsx:44` | `format(new Date(), 'MMMM yyyy')` |
| 5 | "Top 10% this week" badge always shows | `scorecard/page.tsx:47` | Remove until real ranking exists |
| 6 | Scorecard static insights never change | `scorecard/page.tsx:127-145` | Compute from live stats |
| 7 | NewCommitmentModal defaults `ordersCommitted` to 10 | `NewCommitmentModal.tsx:40` | Derive from tier: 2/4/6 |
| 8 | Rep filter not auto-set to self for rep role | `leads/page.tsx:46` | `useState(isRep ? user.uid : "All")` |

### High (Fix Before Wider Rollout)

| # | Bug | File | Fix |
|---|---|---|---|
| 9 | SlideOver note writes to `notes` collection not `activities` | `LeadSlideOver.tsx:117-136` | Replace `createNote()` with `logActivity()` |
| 10 | SlideOver "Convert to Order" has no redirect | `LeadSlideOver.tsx:101-114` | Navigate to order after creation |
| 11 | SlideOver STATUSES missing "Won" | `LeadSlideOver.tsx:23` | Add `"Won"` |
| 12 | Orders page uses useEffect not React Query | `orders/page.tsx:69-86` | Migrate to `useQuery` |
| 13 | AccountHealthPanel rep name shows "Service Team" | `AccountHealthPanel.tsx:53` | Pass real rep name as prop |
| 14 | AccountHealthPanel "Next Task" hardcoded "Outreach" | `AccountHealthPanel.tsx:118` | Query `getTasksByEntity` |
| 15 | NewCommitmentModal Gold/Platinum/Black naming | `NewCommitmentModal.tsx:26-29` | Rename to match program tiers |
| 16 | Status badge missing Won/Approved on leads page | `leads/page.tsx:199-207` | Add `case "Won"` and `case "Approved"` |
| 17 | Batch status update missing Won/Approved | `leads/page.tsx:481-488` | Add both to select options |
| 18 | Orders status filter missing Invoiced/Paid | `orders/page.tsx:246-253` | Add both filter options |

### Medium (Polish and UX)

| # | Issue | File | Fix |
|---|---|---|---|
| 19 | Tasks page is thin wrapper — needs rebuild | `tasks/page.tsx` | Full grouped task surface |
| 20 | Duplicate activity logging UIs | SlideOver + ActivityLog | Unify to one pattern |
| 21 | `isBestseller` not rendered on Menus cards | `menus/page.tsx` | Add badge |
| 22 | `priceTitle` not used on Menus cards | `menus/page.tsx` | Prefer priceTitle string |
| 23 | Priority bar no scroll affordance on mobile | `RepDashboard.tsx` | Right-side fade gradient |
| 24 | Missing `inputMode` on all number inputs | Multiple pages | Add `inputMode="numeric/decimal"` |
| 25 | Leads/orders page no overscroll-contain | `leads/page.tsx`, `orders/page.tsx` | Add `overscroll-y-contain` |
| 26 | Duplicate `text-2xl text-3xl` on leads heading | `leads/page.tsx:220` | Remove `text-2xl` |
| 27 | `entitySearchMode` prop may not be wired in QuickLogDrawer | `QuickLogDrawer.tsx` | Verify prop handler exists |
| 28 | No status bump prompt after call/email log | `QuickLogDrawer.tsx` | Add "Mark as Contacted?" chip |
| 29 | "Create Order" button missing for Approved leads | `leads/[id]/page.tsx:434` | Add `"Approved"` to condition |
| 30 | No accessible labels on activity type tabs | `ActivityLog.tsx` | Add `aria-label` to each button |

---

## Files to Change — Summary

| File | Bugs Fixed |
|---|---|
| `src/components/crm/RepDashboard.tsx` | #1 |
| `src/components/crm/TaskWidget.tsx` | #2 |
| `src/components/crm/LeadSlideOver.tsx` | #9, #10, #11 |
| `src/components/crm/AccountHealthPanel.tsx` | #13, #14 |
| `src/components/crm/NewCommitmentModal.tsx` | #7, #15 |
| `src/components/crm/ActivityLog.tsx` | #30 |
| `src/components/crm/QuickLogDrawer.tsx` | #27, #28 |
| `src/app/(crm)/app/leads/page.tsx` | #8, #16, #17, #26 |
| `src/app/(crm)/app/leads/[id]/page.tsx` | #29 |
| `src/app/(crm)/app/orders/page.tsx` | #12, #18 |
| `src/app/(crm)/app/companies/[id]/page.tsx` | #3 |
| `src/app/(crm)/app/scorecard/page.tsx` | #4, #5, #6 |
| `src/app/(crm)/app/tasks/page.tsx` | #19 |
| `src/app/(crm)/app/menus/page.tsx` | #21, #22 |
