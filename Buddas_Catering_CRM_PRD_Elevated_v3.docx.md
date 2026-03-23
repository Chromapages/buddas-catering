

**BUDDAS HAWAIIAN**  
BAKERY & GRILL

**Catering CRM \+ Marketing**

**Landing Page System**

Product Requirements Document

Elevated Edition — v3.0

Prepared by the Office of the Chief Digital & Growth Officer

March 2026 — Confidential

# **1\. Executive Summary**

## **Elevator Pitch**

Buddas Catering CRM is a two-surface system: a public marketing landing page that converts B2B catering interest into qualified leads, and an internal CRM application that manages those leads through a structured sales pipeline with company accounts, membership tracking, rep attribution, owner-approved commissions, and operational fulfillment. The landing page is the front door; the CRM is the brain. Together they eliminate the spreadsheet chaos, lost leads, and attribution blindness that currently plague Buddas’ catering growth.

## **Success Vision (6 Months Post-Launch)**

In six months, every catering inquiry—whether it originates from LinkedIn, email, a flyer QR code, or a sales rep’s cold call—enters one system of record. The owner sees a live pipeline dashboard every morning. Reps have accountability: their leads are tracked, their follow-ups are timed, and their commissions require explicit owner approval. Recurring corporate accounts are visible by tier (2/4/6 events), and marketing can pull a report showing exact ROAS by source channel. No lead requires manual re-entry. No commission is paid without confirmation. The sales team’s close rate on qualified leads exceeds 35%, and the average time from form submission to first rep contact is under 4 hours.

## **Core Trade-Off**

Speed vs. completeness. V1 prioritizes lead capture, pipeline visibility, and operational control over complex subscription billing, self-serve catering checkout, or automated commission payouts. The system must be operationally useful in Weeks 1–2 without requiring that every edge case be automated first.

## **Success Metrics**

| Metric | Target (6 Months) | Measurement |
| :---- | :---- | :---- |
| Lead capture rate | 100% of inbound inquiries in CRM (zero spreadsheet leakage) | CRM record count vs. known inquiry volume |
| Form-to-first-contact time | \< 4 business hours | CRM activity timestamp delta |
| Lead-to-qualified conversion | \> 50% | Pipeline status progression |
| Qualified-to-won conversion | \> 35% | Pipeline status progression |
| Source attribution coverage | 100% of leads have source \+ medium | CRM field completeness audit |
| Commission disputes | Zero unverified payouts | Approval workflow audit trail |
| Membership tier adoption | \> 40% of won accounts on a recurring tier | Membership records vs. total won |
| CRM daily active usage | Owner \+ all reps log in daily on business days | Auth session logs |
| Landing page LCP | \< 2.5s on 4G mobile | Lighthouse / CrUX |
| Landing page conversion rate | 8–12% on warm traffic, 3–5% on cold | GA4 funnel |

# **2\. User Personas & Journey Maps**

This system serves two fundamentally different user groups: external prospects who interact with the landing page, and internal operators who use the CRM. Both must be designed for with equal rigor.

## **External Personas (Landing Page)**

**Persona A: The Office Coordinator**

* **Title:** Office Manager, Executive Assistant, HR/People-Ops Coordinator

* **Job to Be Done:** “Find reliable, impressive food for a group event with zero drama.”

* **Pain Points:** Unreliable vendors, confusing menus, unclear group pricing, having to call and wait for quotes, no visibility into what happens after submitting an inquiry.

* **Success Criteria:** Submits a lead form in under 90 seconds, feels confident Buddas can handle the event, receives a callback within 4 business hours.

**Persona B: The Community Event Planner**

* **Title:** School Administrator, Church Coordinator, Nonprofit Event Lead

* **Job to Be Done:** “Get good food for a big group at a fair price without managing a caterer.”

* **Pain Points:** Budget sensitivity, need for large-group reliability, unfamiliar with Buddas’ catering capabilities.

**Persona C: The Sales Rep’s Prospect**

* **Context:** Receives Buddas landing page URL via cold email, LinkedIn DM, or door-to-door leave-behind.

* **Behavior:** Spends \< 30 seconds on page. Needs hero credibility, one proof point, and a CTA. May not scroll past the midpoint.

## **Internal Personas (CRM)**

**Persona D: The Owner / Admin**

* **Job to Be Done:** “See my entire catering pipeline at a glance, approve commissions only when I’m satisfied, and hold reps accountable without micromanaging.”

* **Pain Points:** No visibility into lead status, commission disputes with reps, inability to verify which channel is actually driving revenue, duplicate outreach to the same prospect.

* **Success Criteria:** Opens CRM dashboard every morning and knows exactly how many new leads came in, which are unassigned, which are stale, and which need commission approval. Takes action in \< 5 minutes.

**Persona E: The Sales Rep**

* **Job to Be Done:** “See my assigned leads, know who to call first, log my outreach, and move opportunities forward so I get paid.”

* **Pain Points:** No clear lead queue, unclear ownership, manual note-keeping, no confidence that commission will be paid fairly.

* **Success Criteria:** Logs in, sees a sorted list of assigned leads by priority (newest first, then stale). Can add a note, change status, and move to next lead in \< 30 seconds per lead.

**Persona F: Marketing / Admin Support**

* **Job to Be Done:** “Track which channels are producing leads and ensure inbound inquiries are routed correctly.”

* **Pain Points:** No attribution data, unable to compare LinkedIn vs. email vs. flyer QR vs. direct outreach performance.

**Persona G: Ops Manager**

* **Job to Be Done:** “Confirm events were fulfilled, mark delivery/setup complete, and ensure the pipeline reflects reality.”

* **Pain Points:** Disconnected from the sales process, no way to flag issues before commission approval.

## **Key Journey Maps**

**Journey 1: Prospect → Lead (Landing Page)**

1. Prospect clicks link from email, LinkedIn, sales outreach, or QR code.

2. Lands on hero. Decides in \< 5 seconds: “Is this for me?”

3. Scrolls past trust strip. Sees catering paths. Identifies their need.

4. Reviews membership tiers. Understands pricing logic.

5. Submits lead form (\< 90 seconds). Hidden attribution fields captured.

6. Sees success state. CRM records created synchronously before success renders.

7. Internal notification fires. Rep assigned.

**Journey 2: Lead → Won (CRM Sales Flow)**

8. New lead appears on dashboard with “New” status badge.

9. Owner or auto-assignment routes lead to a rep.

10. Rep opens lead detail, reviews company/contact/request info.

11. Rep contacts prospect. Status moves to “Contacted.” Activity logged.

12. Rep qualifies need, discusses quote and membership tier.

13. Status moves through Qualified → Quote Sent → Membership Discussed.

14. Prospect commits. Status: “Won.”

**Journey 3: Won → Commission Approved (Fulfillment \+ Approval)**

15. Event date arrives. Ops confirms fulfillment (delivery, setup, food quality).

16. Status: “Fulfilled.” Ops adds notes.

17. Commission approval request surfaces in Owner’s approval queue.

18. Owner reviews: lead source, rep activity, fulfillment confirmation, any flags.

19. Owner approves or rejects. Approval timestamped with approver identity.

20. Status: “Commission Approved.” Rep notified.

**Journey 4: Error Recovery (Form Submission Failure)**

If the API returns an error, the landing page shows a friendly retry message in the Buddas voice (“Whoops. Our system went surfing. Let’s try that again.”). Form data is preserved. No partial success state is ever shown. The failure is logged server-side for monitoring.

**Journey 5: Duplicate Detection**

When a form submission arrives, the intake endpoint checks for an existing company (exact name match or domain match) and existing contact (exact email match, or phone \+ company match). If a match is found, the system updates the existing record and creates a new catering request linked to it, rather than creating duplicate company/contact records. Fuzzy company matches are flagged for manual review in the CRM.

# **3\. Design System Specification**

The design system covers both surfaces: the public landing page (strict brand compliance with Buddas guidelines v2.9) and the internal CRM (brand-aligned but optimized for data density and operational speed).

## **Typography**

| Context | Element | Font | Weight | Size |
| :---- | :---- | :---- | :---- | :---- |
| Landing Page | H1 / Hero | Poppins | SemiBold (600) | 40–48px fluid |
| Landing Page | H2 / Section | Poppins | SemiBold (600) | 28–32px fluid |
| Landing Page | Body / Buttons | DM Sans | Regular (400) / Medium (500) | 16–18px |
| CRM | Page Title | Poppins | SemiBold (600) | 24px |
| CRM | Section / Card Header | Poppins | Medium (500) | 18px |
| CRM | Table Text / Forms | DM Sans | Regular (400) | 14px |
| CRM | Badges / Labels | DM Sans | Medium (500) | 12px |

Font loading: Only Poppins SemiBold (600), Poppins Medium (500), DM Sans Regular (400), DM Sans Medium (500). No italics. No Bold (700) for Poppins. CRM pages can load DM Sans Mono for code/IDs if needed.

## **Color Tokens**

| Token | Hex | CSS Variable | Landing Page | CRM |
| :---- | :---- | :---- | :---- | :---- |
| Base Teal | \#54BFA5 | \--color-teal-base | Primary CTAs, icons | Active status, success states |
| Dark Teal | \#1C5F56 | \--color-teal-dark | Hero H1, CTA bg (a11y safe) | Sidebar, nav header |
| Island Gold | \#E9C559 | \--color-gold | Tier %, accent badges | Warning states, pending badges |
| Buddas Cream | \#FFF8E8 | \--color-cream | Page background | Card background on gray layout |
| Cocoa Brown | \#5A3A1F | \--color-brown | All body text (never \#000) | Primary text |
| Pure White | \#FFFFFF | \--color-white | Cards, inputs | Table rows, input fields |
| Sunset Orange | \#D36200 | \--color-orange | Error states only | Overdue alerts, lost status |
| CRM Gray | \#F7F7F5 | \--color-gray-bg | N/A | Page background for CRM |
| Border Gray | \#E5E5E3 | \--color-gray-border | N/A | Table borders, dividers |

## **Spacing & Grid**

* **Base unit:** 8px. All spacing values are multiples of 8\.

* **Landing page:** Max-width 1200px centered. Side padding 64px desktop, 24px mobile.

* **CRM layout:** Fixed sidebar (240px) \+ fluid main content. 16px gap between cards. 24px page padding.

* **Cards:** 12px border-radius. Subtle box-shadow (0 1px 3px rgba(0,0,0,0.08)).

* **Buttons:** 8px border-radius. 44px min height (tap target).

* **Tables:** Row height minimum 48px. Cell padding 12px horizontal, 8px vertical.

## **CRM Component Interaction States**

| Component | Default | Hover | Focus | Active | Loading | Empty |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Table Row | White bg | Gray-50 bg | 2px teal outline | Teal-5% bg | — | Centered illustration \+ “No leads yet” |
| Status Badge | Pill with status color | — | — | — | — | — |
| Action Button | Teal bg, white text | Dark Teal bg | 2px ring offset | Scale 0.98 | Spinner replaces text | Disabled at 40% |
| Sidebar Nav | Brown text | Teal-5% bg | Left teal border | Teal bg, white text | — | — |
| Detail Panel | White card | — | — | — | Skeleton pulse | “Select a lead to view details” |
| Approval Card | White card, gold left border | Shadow deepens | 2px teal ring | — | — | “No approvals pending” |

## **Status Badge Color Map**

| Status | Background | Text | Usage |
| :---- | :---- | :---- | :---- |
| New | \#54BFA5 (Teal) at 15% | \#1C5F56 (Dark Teal) | Just arrived, unassigned or untouched |
| Contacted | \#54BFA5 at 25% | \#1C5F56 | Rep has made first outreach |
| Qualified | \#E9C559 (Gold) at 20% | \#5A3A1F (Brown) | Need confirmed, budget aligned |
| Quote Sent | \#E9C559 at 35% | \#5A3A1F | Formal quote delivered |
| Membership Discussed | \#E9C559 at 50% | \#5A3A1F | Recurring tier in conversation |
| Won | \#54BFA5 at 40% | \#1C5F56 | Commitment received |
| Lost | \#D36200 (Orange) at 15% | \#D36200 | Did not convert |
| Fulfilled | \#54BFA5 at 60% | \#FFFFFF | Event delivered and confirmed |
| Commission Approved | \#1C5F56 solid | \#FFFFFF | Owner signed off |

## **Motion Principles**

* All transitions: cubic-bezier(0.25, 0.1, 0.25, 1). 200–300ms for UI interactions.

* Landing page: no heavy animations in v1. FAQ accordion at 250ms.

* CRM: skeleton loading for data fetches (pulse animation, 1.5s loop). Instant optimistic updates for status changes. Toast notifications slide in from top-right, auto-dismiss after 4s.

* CRM detail panel: slide-in from right at 200ms when selecting a row. No page navigation for detail views.

## **Empty States (CRM)**

Every CRM view must have a designed empty state. No blank screens. Each empty state includes a monoline teal icon, a short headline, and an action prompt.

| View | Empty State Headline | Action Prompt |
| :---- | :---- | :---- |
| Dashboard (no leads) | “No leads yet” | “Share your catering page to start generating inquiries.” |
| Leads Table (filtered, no results) | “No leads match this filter” | “Try adjusting your filters or date range.” |
| Lead Detail (no activity) | “No activity recorded” | “Add a note or log your first outreach.” |
| Approval Queue (empty) | “All caught up” | “No approvals waiting. Check back after fulfilled events.” |
| Company Memberships (none) | “No memberships yet” | “Memberships are created when a recurring tier is committed.” |

# **4\. Feature Specifications**

Each feature includes a user story, acceptance criteria in Given/When/Then format, edge cases, MoSCoW priority, and Impact/Effort score (1–5 each).

## **4.1 Landing Page Lead Intake**

* **User Story:** As a catering prospect, I want to submit one simple form so I can request help quickly without calling or emailing.

* **Priority:** Must-Have | Impact: 5 | Effort: 2

**Acceptance Criteria**

***Given*** a prospect fills all required form fields and clicks Submit,

***When*** the form posts to the secure intake endpoint,

***Then*** the endpoint validates inputs, runs duplicate detection, creates or updates Company/Contact/Lead/CateringRequest records, writes an activity log entry, assigns default status “New,” sends an internal notification, and returns a success response. The landing page renders the success state: “Mahalo. Our team will reach out shortly to help plan your catering.”

***Given*** a prospect submits with a missing required field or invalid email,

***When*** inline validation catches it before the API call,

***Then*** the first error field is focused, and a helper message appears in the Buddas voice (e.g., “We’ll need your email to get back to you”). No API call is made.

***Given*** the intake endpoint encounters a server error,

***When*** the landing page receives a non-200 response,

***Then*** a friendly retry message appears (“Whoops. Our system went surfing. Let’s try that again.”). Form data is preserved. The failure is logged server-side. No partial success is shown.

**Form Fields**

| Field | Type | Required | Validation |
| :---- | :---- | :---- | :---- |
| Name | Text | Yes | Min 2 characters |
| Company / Organization | Text | Yes | Min 2 characters |
| Email | Email | Yes | RFC 5322 format |
| Phone | Tel | Yes | Valid US phone format |
| Event Type | Dropdown | Yes | Must select from list |
| Catering Need | Dropdown | Yes | Breakfast / Lunch / Pastries / Not Sure Yet |
| Estimated Group Size | Number | Yes | Min 10 |
| Preferred Date | Date picker | No | Must be future date if provided |
| Notes | Textarea | No | Max 500 characters |

**Hidden Attribution Fields**

* source — from UTM parameter or referrer classification

* medium — from UTM parameter

* campaign — from UTM parameter

* content — from UTM parameter (ad variant)

* refCode — rep referral code or flyer code

* landingPageSlug — page identifier for multivariant testing

* referringURL — document.referrer

**Edge Cases**

* If UTM parameters are absent, source defaults to “direct” and medium defaults to “none.” Never leave source blank.

* If a prospect submits twice with the same email within 24 hours, update the existing lead and create a new catering request linked to it. Do not create a duplicate lead.

* If JavaScript fails and hidden fields are empty, the server-side endpoint still accepts the submission but flags it as “unattributed” for manual review.

## **4.2 Duplicate Detection**

* **User Story:** As Buddas, I want the system to prevent duplicate company and contact records so reps don’t chase the same prospect twice.

* **Priority:** Must-Have | Impact: 5 | Effort: 3

**Acceptance Criteria**

***Given*** a form submission arrives with an email that exactly matches an existing contact,

***When*** the intake endpoint runs duplicate detection,

***Then*** the system links the new lead and catering request to the existing contact and their associated company. No new contact record is created. An activity log entry notes “Returning contact submitted new catering request.”

***Given*** a submission arrives with a new email but a phone number \+ company name that match an existing contact,

***When*** the system flags this as a potential duplicate,

***Then*** a “Review: Possible Duplicate” badge appears on the lead in the CRM. The system creates the new record but does not merge automatically. An admin can merge or dismiss.

**Match Rules**

* **Exact match (auto-link):** Email address is identical (case-insensitive).

* **Strong match (auto-link):** Phone number (normalized to digits) \+ company name (case-insensitive, trimmed).

* **Fuzzy match (flag for review):** Company name Levenshtein distance \< 3, or domain extracted from email matches existing company website domain.

## **4.3 Lead Pipeline & Status Management**

* **User Story:** As a sales rep, I want to see where every lead stands in the pipeline so I know who to contact first and what action to take next.

* **Priority:** Must-Have | Impact: 5 | Effort: 3

**Pipeline Statuses**

| Status | Triggered By | Next Valid Statuses | Notification |
| :---- | :---- | :---- | :---- |
| New | Form submission | Contacted, Lost | New lead alert to owner \+ assigned rep |
| Contacted | Rep logs first outreach | Qualified, Lost | None |
| Qualified | Rep confirms need \+ budget alignment | Quote Sent, Lost | None |
| Quote Sent | Rep sends formal quote | Membership Discussed, Won, Lost | None |
| Membership Discussed | Recurring tier presented | Won, Lost | None |
| Won | Prospect commits | Fulfilled | Won alert to owner |
| Lost | Prospect declines or goes silent | New (reopened) | None |
| Fulfilled | Ops confirms event delivery | Commission Approved | Approval needed alert to owner |
| Commission Approved | Owner approves | Terminal | Commission confirmed to rep |

**Acceptance Criteria**

***Given*** a rep changes a lead’s status,

***When*** the new status is one of the valid next statuses for the current state,

***Then*** the status updates immediately (optimistic UI), an activity log entry is created with the rep’s name and timestamp, and any triggered notifications fire.

***Given*** a rep attempts to change status to an invalid next state (e.g., New → Commission Approved),

***When*** the system prevents the change,

***Then*** a toast notification explains: “This lead must be Fulfilled before commission approval.”

**Edge Cases**

* A “Lost” lead can be reopened to “New” if the prospect re-engages. Activity log records the reopen with reason.

* Status changes are append-only in the activity log. No status history is ever deleted.

## **4.4 Company Management**

* **User Story:** As the owner, I want to see all catering activity for a company in one place so I understand the relationship’s full value.

* **Priority:** Must-Have | Impact: 5 | Effort: 3

**Company Record Fields**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| Company Name | Text | Yes | Deduplicated at intake |
| Company Type | Dropdown | No | Office, School, Church, Nonprofit, Wedding Venue, Other |
| Address | Text | No |  |
| Website | URL | No | Used for domain-based dedup |
| Phone | Tel | No |  |
| Industry / Segment | Text | No |  |
| Assigned Rep | User reference | No | Inherited by new leads for this company |
| Active Membership | Membership reference | No | Links to membership record |
| Total Events Completed | Computed | — | Sum of fulfilled catering requests |
| Notes | Textarea | No |  |
| Source History | Array | Auto | All source attributions from leads linked to this company |

**Acceptance Criteria**

***Given*** a user opens a Company Detail view,

***When*** the page renders,

***Then*** the user sees: company info card, assigned rep, active membership summary (tier/events used/events remaining), a table of all contacts at the company, a table of all leads and catering requests, and a chronological activity timeline aggregating all activity across the company’s contacts and leads.

## **4.5 Contact Management**

* **Priority:** Must-Have | Impact: 4 | Effort: 2

**Contact Record Fields**

| Field | Type | Required |
| :---- | :---- | :---- |
| Full Name | Text | Yes |
| Role / Title | Text | No |
| Email | Email | Yes |
| Phone | Tel | No |
| Primary Company | Company reference | Yes |
| Preferred Contact Method | Dropdown | No |
| Notes | Textarea | No |

## **4.6 Catering Request Management**

* **User Story:** As a rep, I want to see the details of each catering request so I can prepare an accurate quote.

* **Priority:** Must-Have | Impact: 5 | Effort: 2

**Catering Request Fields**

| Field | Type | Source |
| :---- | :---- | :---- |
| Linked Company | Reference | Auto from intake |
| Linked Contact | Reference | Auto from intake |
| Event Type | Dropdown | Form submission |
| Catering Need | Dropdown | Form submission |
| Estimated Group Size | Number | Form submission |
| Preferred Date | Date | Form submission |
| Quote Amount | Currency | Rep enters manually |
| Fulfillment Status | Dropdown | Ops updates |
| Source / Campaign | Text | Hidden form fields |
| Assigned Rep | User reference | Owner or auto-assign |
| Notes | Textarea | Rep or ops |

## **4.7 Membership Tracking**

* **User Story:** As the owner, I want to see which companies are on recurring tiers and how many events they’ve used so I can plan capacity and identify upsell opportunities.

* **Priority:** Must-Have | Impact: 5 | Effort: 3

**Membership Record Fields**

| Field | Type | Notes |
| :---- | :---- | :---- |
| Company | Reference | One active membership per company |
| Tier | Enum: 2/4/6 | Maps to meeting’s agreed structure |
| Discount % | 10 / 15 / 20 | Auto-set based on tier |
| Events Committed | Number | 2, 4, or 6 |
| Events Completed | Computed | Count of fulfilled requests linked to this membership |
| Events Remaining | Computed | Committed minus completed |
| Includes Delivery | Boolean | Always true for all tiers |
| Includes Setup | Boolean | Always true for all tiers |
| Start Date | Date | When membership begins |
| Review / Renewal Date | Date | 12 months from start |
| Active | Boolean | Can be deactivated manually |
| Custom Notes | Textarea | For non-standard arrangements |

**Acceptance Criteria**

***Given*** a company has an active membership and a catering request is fulfilled,

***When*** the system increments Events Completed and decrements Events Remaining,

***Then*** the membership card on the Company Detail view updates in real time. If Events Remaining reaches 1, a “Nearing full usage” notification fires to the owner.

***Given*** a membership’s Events Remaining reaches 0,

***When*** the system marks the membership as “Complete”,

***Then*** a renewal prompt surfaces in the dashboard and the owner receives a notification suggesting outreach for re-commitment.

## **4.8 Rep Attribution & Commission Approval**

* **User Story:** As the owner, I want to approve commissions only after verifying the event was fulfilled and the rep’s contribution was legitimate, so no unearned commissions are paid.

* **Priority:** Must-Have | Impact: 5 | Effort: 3

**Commission Approval Record**

| Field | Type | Notes |
| :---- | :---- | :---- |
| Catering Request | Reference | The fulfilled request generating commission |
| Rep | User reference | The rep assigned to the lead/request |
| Eligible | Boolean | Set to true when request is fulfilled |
| Approved | Boolean | Set by owner only |
| Approved By | User reference | Audit trail |
| Approved At | Timestamp | Audit trail |
| Notes | Textarea | Owner can add context |

**Acceptance Criteria**

***Given*** a catering request moves to “Fulfilled” status,

***When*** the system creates a commission approval record with eligible=true, approved=false,

***Then*** the record appears in the Owner’s Approval Queue with the request details, rep name, fulfillment date, and an Approve/Reject action pair.

***Given*** the owner clicks “Approve” on a commission,

***When*** the system records approvedBy (owner’s userId), approvedAt (timestamp), and sets approved=true,

***Then*** the lead status moves to “Commission Approved,” the rep receives a notification, and the approval action is immutable—it cannot be edited or deleted after confirmation.

***Given*** a sales rep attempts to access the Approval Queue or modify an approval record,

***When*** the system checks role permissions,

***Then*** the rep is denied access. Only Owner/Admin roles can view or act on the Approval Queue.

## **4.9 Activity Timeline**

* **Priority:** Must-Have | Impact: 4 | Effort: 2

Every entity (Lead, Company, Contact, Request) has a chronological activity log. Activities are append-only and never deleted.

**Activity Types**

| Action Type | Trigger | Logged Data |
| :---- | :---- | :---- |
| form\_submitted | Landing page intake | Source, medium, form data summary |
| lead\_assigned | Owner or auto-assign | Rep name, assigner name |
| note\_added | User adds note | Note text, author |
| status\_changed | Status transition | Old status, new status, changed by |
| quote\_sent | Rep logs quote | Quote amount, notes |
| event\_confirmed | Ops confirms upcoming event | Event date, group size |
| event\_fulfilled | Ops marks complete | Fulfillment notes |
| commission\_approved | Owner approves | Approved by, timestamp |
| commission\_rejected | Owner rejects | Rejected by, reason |
| membership\_created | Recurring tier committed | Tier, discount, start date |
| membership\_updated | Events used or tier changed | Change details |

## **4.10 Dashboard**

* **User Story:** As the owner, I want to see the health of my catering pipeline in one screen so I can take action in under 5 minutes each morning.

* **Priority:** Must-Have | Impact: 5 | Effort: 3

**Dashboard Widgets**

| Widget | Data | Visual Treatment |
| :---- | :---- | :---- |
| New Leads Today | Count of leads with status=New created today | Large number, teal accent |
| Unassigned Leads | Leads with no assigned rep | Count with orange alert if \> 0 |
| Overdue Follow-ups | Leads in New/Contacted not updated in \> 24 hours (configurable) | Count with orange alert |
| Quotes Pending | Leads in Quote Sent status | Count |
| Won This Week | Leads moved to Won in last 7 days | Count with teal accent |
| Upcoming Events | Catering requests with future preferred date | Count \+ next 3 events listed |
| Approvals Waiting | Commission approvals with eligible=true, approved=false | Count with gold accent |
| Source Breakdown | Leads grouped by source field | Horizontal bar chart, last 30 days |

**Acceptance Criteria**

***Given*** the owner opens the CRM,

***When*** the dashboard loads,

***Then*** all 8 widgets render with current data within 2 seconds. Skeleton loading states are visible during fetch. Clicking any widget count navigates to the filtered Leads Table showing the relevant records.

## **4.11 Notifications**

* **Priority:** Must-Have | Impact: 4 | Effort: 2

**Notification Rules**

| Event | Recipients | Channel | Urgency |
| :---- | :---- | :---- | :---- |
| New lead | Owner \+ assigned rep (if auto-assigned) | Email \+ in-app | High |
| Unassigned lead (\> 1 hour) | Owner | Email | High |
| Stale lead (no activity \> 24 hours) | Assigned rep \+ owner | In-app | Medium |
| Approval needed | Owner | Email \+ in-app | High |
| Membership nearing full usage (1 event left) | Owner | In-app | Medium |
| Upcoming event (48 hours) | Assigned rep \+ ops | Email \+ in-app | Medium |
| Commission approved | Rep | Email \+ in-app | Low |

## **4.12 Reporting**

* **Priority:** Should-Have | Impact: 4 | Effort: 3

**V1 Reports**

* Leads by source (bar chart, filterable by date range)

* Leads by status (pipeline view or horizontal stacked bar)

* Won/Lost count and rate (with trend over last 90 days)

* Companies by membership tier (table with event usage progress)

* Rep-assigned lead volume and status distribution

* Fulfilled events (table with date, company, group size, rep)

* Commission-pending opportunities (table linked to approval queue)

* Source-to-Won conversion rate (funnel visualization by source)

# **5\. Prioritization Matrix**

| Feature | Priority | Impact | Effort | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Landing page lead form \+ intake endpoint | Must | 5 | 2 | The entire system depends on this |
| Duplicate detection (exact \+ strong match) | Must | 5 | 3 | Prevents rep confusion and data rot |
| Lead pipeline with status management | Must | 5 | 3 | Core operational value |
| Company records with contact linking | Must | 5 | 3 | Foundation for account-based view |
| Contact management | Must | 4 | 2 | Lightweight but essential |
| Catering request records | Must | 5 | 2 | Links form data to pipeline |
| Membership tier tracking | Must | 5 | 3 | Differentiates Buddas from one-off vendors |
| Rep attribution \+ commission approval | Must | 5 | 3 | Non-negotiable per meeting requirements |
| Activity timeline | Must | 4 | 2 | Audit trail for every record |
| Dashboard with 8 widgets | Must | 5 | 3 | Owner’s daily operating view |
| Notifications (email \+ in-app) | Must | 4 | 2 | Prevents lead leakage |
| Role-based auth (Owner, Rep, Marketing, Ops) | Must | 5 | 2 | Security baseline |
| Hidden form attribution fields | Must | 5 | 1 | Zero-effort, massive attribution value |
| Reporting (7 standard views) | Should | 4 | 3 | Not launch-blocking but high value |
| Fuzzy duplicate detection | Should | 3 | 3 | Nice but exact match handles 80% |
| CMS-editable landing page copy | Should | 3 | 3 | Reduces dev dependency |
| Tasting request form branch | Could | 3 | 2 | Add post-launch if conversion data warrants |
| Downloadable PDF menu | Could | 2 | 2 | Leave-behind for offline sales |
| Thank-you email automation | Could | 3 | 2 | Improves perceived responsiveness |
| Calendar integration | Could | 2 | 4 | Nice but not conversion-critical |
| Self-serve catering checkout | Won’t (v1) | 4 | 5 | Premature—manual sales first |
| Billing/subscription engine | Won’t (v1) | 3 | 5 | Overbuilt for current volume |
| Automated commission payouts | Won’t (v1) | 3 | 5 | Owner wants manual control |
| AI lead scoring | Won’t (v1) | 2 | 5 | Insufficient data to train |
| Customer portal / login | Won’t (v1) | 3 | 5 | Adds complexity without clear ROI |
| Birthday program | Won’t (v1) | 3 | 4 | Separate workstream per meeting |

# **6\. Technical Architecture**

## **Stack Recommendation**

| Layer | Technology | Justification |
| :---- | :---- | :---- |
| Landing Page | Next.js (App Router), SSG | Static page served from CDN edge. Sub-second TTFB. No server costs for the public page. |
| CRM Frontend | Next.js (App Router), CSR with SWR/React Query | Client-side rendering for data-heavy views. SWR for stale-while-revalidate caching and optimistic updates. |
| Styling | Tailwind CSS with brand design tokens | Shared token file for both surfaces. Consistent with Buddas color/spacing system. |
| Auth | Firebase Auth (email/password \+ optional Google SSO) | Fast to implement. Supports role-based access via custom claims. |
| Database | Firestore (Firebase) | Real-time listeners for dashboard widgets. Flexible schema for v1 iteration speed. Normalized document structure per data model. |
| API / Functions | Firebase Cloud Functions (Node.js) | Secure intake endpoint, notification triggers, scheduled jobs (stale lead alerts, upcoming event reminders). |
| File Storage | Firebase Storage | PDFs, quote docs, future leave-behind assets. |
| Hosting | Vercel (landing page) \+ Firebase Hosting (CRM) | Vercel for SSG edge delivery. Firebase Hosting for authenticated CRM routes. |
| Analytics | GA4 \+ GTM (landing page) | Event tracking per tracking plan. |
| Email Notifications | SendGrid or Firebase Extensions (Trigger Email) | Transactional emails for lead alerts and commission notifications. |
| CRM State | React Query / SWR | Server-state management with caching. Optimistic updates for status changes. |

## **Rendering Strategy by Surface**

| Surface | Rendering | Rationale |
| :---- | :---- | :---- |
| Landing Page | SSG (Static Site Generation) | No dynamic data. Pre-built at deploy. Instant load from CDN. ISR on-demand revalidation when CMS content changes. |
| CRM Dashboard | CSR (Client-Side Rendering) | Authenticated, data-heavy, real-time. Server-rendering adds latency without SEO benefit for internal tools. |
| CRM Detail Views | CSR with prefetch | Prefetch on row hover for instant panel open. SWR cache prevents redundant fetches. |
| CRM Reports | CSR with lazy loading | Charts loaded on demand. Data fetched at render time with loading skeletons. |

## **API Architecture**

**Public Endpoint**

* **POST /api/catering-lead:** Accepts form payload as JSON. Server-side validation (sanitize inputs, check required fields, validate email format, normalize phone). Runs duplicate detection. Creates/updates CRM records. Sends notification. Returns 200 \+ success or 422 \+ field errors. Rate-limited: 10 submissions per IP per hour.

**Internal CRM API (Authenticated)**

All CRM read/write operations go through Firestore security rules or Cloud Functions with auth middleware. No direct browser-to-Firestore writes for sensitive operations (status changes, commission approvals). Core patterns:

* GET /api/leads — paginated, filterable by status, source, rep, date range

* PATCH /api/leads/:id/status — validates state machine transitions

* POST /api/leads/:id/notes — appends to activity timeline

* POST /api/approvals/:id/approve — owner-only, sets approved=true with audit trail

* GET /api/dashboard — aggregated widget data (cached 30s for performance)

## **Data Model (Entity Relationship)**

The data model follows the original PRD’s Firebase-friendly shape but with important normalization constraints:

* One Company can have many Contacts, many Leads, and one active Membership.

* One Lead belongs to one Company and one primary Contact.

* One Lead can generate multiple Catering Requests over time (re-engagement).

* One Catering Request links to one Lead, one Company, one Contact.

* One Catering Request can generate one Commission Approval record.

* Activities are polymorphic: entityType \+ entityId reference any entity.

* Source Attributions are stored on the Lead record and aggregated on the Company for source history.

## **Security Model**

| Role | Leads | Companies | Approvals | Reports | Users |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Owner / Admin | Full CRUD | Full CRUD | View \+ Approve/Reject | Full access | Manage all |
| Sales Rep | View assigned \+ update status/notes | View assigned | No access | Own leads only | View own profile |
| Marketing | View all (read-only) \+ edit contact info | View all \+ edit | No access | Full access | View own profile |
| Ops Manager | View all \+ update fulfillment status | View all | No access | Fulfillment reports | View own profile |

# **7\. Performance & Accessibility Standards**

## **Landing Page Performance**

| Metric | Target | Failure Threshold |
| :---- | :---- | :---- |
| LCP | \< 2.5s on 4G | \> 4.0s |
| INP | \< 200ms | \> 500ms |
| CLS | \< 0.1 | \> 0.25 |
| TTFB | \< 200ms (CDN edge) | \> 600ms |
| Total Page Weight | \< 500KB | \> 1MB |
| Hero Image | \< 150KB WebP, preloaded | \> 300KB |

## **CRM Performance**

| Metric | Target | Notes |
| :---- | :---- | :---- |
| Dashboard load | \< 2s to interactive | Skeleton states visible during fetch |
| Lead table render | \< 1s for 100 rows | Paginate at 50 rows default |
| Detail panel open | \< 300ms | Prefetch on hover, slide-in animation |
| Status change | \< 500ms perceived | Optimistic UI update, server confirms async |
| Search / filter | \< 500ms for results | Debounced input, indexed queries |

## **Accessibility (WCAG 2.1 AA)**

Landing page and CRM both must meet WCAG 2.1 AA. Key requirements:

* Color contrast: All text/background combinations meet 4.5:1 minimum. Test White on Teal for CTA buttons—if it fails, use Dark Teal as CTA background.

* Form labels: Always visible (no placeholder-only labels). Programmatically associated via for/id.

* Focus indicators: 2px teal ring with 2px offset on all interactive elements. Never remove outline.

* Keyboard navigation: Full tab order for landing page. Full keyboard operability for CRM (table navigation, panel open/close, dropdown selection, modal dismiss).

* Screen readers: ARIA landmarks for all regions. Live regions for toast notifications, form success/error, and dashboard widget updates.

* Tap targets: Minimum 44x44px for all buttons and links on both surfaces.

* CRM tables: Use proper \<table\> semantics with \<th\> scope attributes. Column headers are read by screen readers.

* No autoplay audio or video on any surface. Ever.

# **8\. Launch Readiness Checklist**

## **Pre-Launch Gates**

| Gate | Criteria | Owner | Status |
| :---- | :---- | :---- | :---- |
| Landing Page Lighthouse | Performance \> 95, A11y \> 95, SEO \> 95 | Tech | \[ \] |
| CRM Auth | Login works, role permissions enforced, unauthorized routes blocked | Tech | \[ \] |
| Intake Endpoint | Form → CRM record creation works end-to-end with dedup | Tech | \[ \] |
| Attribution | UTM params persist into hidden fields and land in CRM | Marketing \+ Tech | \[ \] |
| Pipeline | All 9 statuses work with valid transitions enforced | Tech | \[ \] |
| Commission Approval | Owner can approve/reject, reps cannot access queue | Tech | \[ \] |
| Dashboard | All 8 widgets render with real data | Tech \+ Design | \[ \] |
| Notifications | New lead and approval-needed emails fire correctly | Tech | \[ \] |
| Mobile QA (Landing) | Tested iOS Safari, Android Chrome, Samsung Internet | QA | \[ \] |
| Brand Review (Landing) | Colors, type, photography, voice pass brand audit | Design | \[ \] |
| Error Monitoring | Sentry or equivalent live for both surfaces | Tech | \[ \] |
| Sales Team Trained | Reps can log in, view leads, update status, add notes | Ops | \[ \] |
| Response SLA Set | First contact \< 4 business hours, documented and communicated | Ops | \[ \] |

## **Post-Launch Monitoring (First 30 Days)**

* Daily: check new lead volume, unassigned lead count, form error rate in Sentry.

* Weekly: review conversion rate by source, scroll depth heatmap, form abandonment, CRM adoption (logins/day), stale lead count.

* Alert: if landing page conversion rate drops below 2% for 3 consecutive days, trigger copy/CTA audit.

* Alert: if form error rate exceeds 10%, investigate field friction.

* Alert: if average time-to-first-contact exceeds 8 hours, escalate to ops.

* Monthly: compare lead volume, quality, and close rate by source. Adjust campaign spend. Review membership tier adoption.

# **9\. 90-Day Implementation Plan**

## **Weeks 1–2: Foundation & Data Model**

* **Tech:** Define Firestore collections and security rules per data model. Build auth flow with role-based custom claims. Implement intake endpoint with validation, dedup, and record creation. Stand up CRM project skeleton (Next.js \+ Tailwind \+ Firebase).

* **Design:** Finalize landing page hero image and catering card photography. Build CRM wireframes for Dashboard, Leads Table, Lead Detail, Company Detail, and Approval Queue. Create component library in Figma with all interaction states.

* **Marketing:** Write all landing page copy. Define UTM naming conventions for every channel. Create SpotOn discount codes per channel. Prepare launch email and LinkedIn outreach sequence.

* **Ops:** Define owner approval rules. Set lead response SLA (\< 4 hours). Determine rep assignment logic (geographic, round-robin, or manual). Document commission eligibility criteria.

* **Milestone:** Intake endpoint tested end-to-end. CRM auth working. Landing page staging URL live with placeholder content.

## **Weeks 3–6: Core CRM \+ Landing Page Complete**

* **Tech:** Build all CRM screens: Dashboard, Leads Table, Lead Detail, Company Detail, Contact Detail, Catering Request Detail, Membership Detail, Approval Queue. Implement pipeline status machine with transition validation. Wire notifications (new lead, approval needed, stale lead). Build activity timeline component. Implement landing page with CMS-driven content and analytics events.

* **Design:** QA all CRM screens across breakpoints. Verify brand compliance on landing page. Test empty states, loading states, and error states.

* **Marketing:** Load final copy into CMS. Connect campaign traffic sources. Brief sales team on the page and CRM workflow.

* **Ops:** Begin using CRM pipeline with early/test leads. Validate notification timing. Confirm approval workflow matches owner expectations.

* **Milestone:** Feature-complete builds for both landing page and CRM. Internal review with all stakeholders.

## **Weeks 7–8: QA, Training & Launch**

* **Tech:** Full pre-launch checklist. Cross-browser testing (landing page). Load testing on intake endpoint. Verify all security rules. Deploy error monitoring.

* **Design:** Final brand sign-off on landing page. CRM usability review with real rep tasks.

* **Marketing:** Activate all campaign links. Launch email to existing catering leads. Begin LinkedIn outreach.

* **Ops:** Sales team training session (1 hour). Walk through: login, view leads, update status, add notes, understand approval flow.

* **Milestone:** Both surfaces live. All tracking verified in production. Sales team operating in CRM.

## **Weeks 9–12: Optimize & Extend**

* **Tech:** Instrument form abandonment tracking and scroll-depth heatmap. Add fuzzy duplicate detection (Levenshtein). Implement reporting views. Optimize Firestore queries for growing data.

* **Marketing:** Analyze first 30 days. Identify top channel, underperforming sections, and headline A/B test opportunities. Run first source-to-won funnel report.

* **Ops:** Review lead quality with sales team. Assess close rate by tier. Evaluate whether stale lead alerts need tighter thresholds. Identify process gaps in approval flow.

* **Milestone:** First optimization cycle complete. V2 scope defined based on real data.

# **10\. Friction Check**

## **Marketing Wants Traffic Before Ops Is Ready**

If marketing drives volume before the CRM workflow is tested and reps are trained, leads leak and first impressions are blown. Resolution: do not activate paid campaigns or mass outreach until the CRM has been tested with at least 10 manual/test leads and the sales team has completed training (Week 7–8).

## **Sales Wants Flexibility; Ops Needs Structure**

Reps will want to skip pipeline stages, invent custom offers, or mark leads as “Won” without proper qualification. If reps can bypass the state machine, the CRM loses trust and the pipeline data becomes unreliable. Resolution: enforce valid status transitions in code (not just UI). Log every override attempt. Give reps a “Notes” field for flexibility within structure.

## **Tech Wants Elegance; The Business Needs Speed**

The temptation is to build a beautiful, fully automated CRM before shipping. Resist it. V1 must be operationally useful with manual commission approval, manual rep assignment, and manual membership creation. Automation comes in v2 once the process is proven. Resolution: every feature in the “Won’t (v1)” column stays there until lead volume justifies it.

## **Attribution Can Break at Intake**

If UTM parameters are not captured on day one, every future ROAS calculation is compromised. This is the highest-leverage, lowest-effort feature in the entire system. Resolution: hidden attribution fields are a Must-Have with Impact 5 / Effort 1\. Implement in Week 1\. Test before anything else.

## **CRM Adoption Risk**

If the CRM is harder to use than a spreadsheet, reps will revert to spreadsheets within a week. Resolution: the CRM must pass the “30-second test”—a rep can open a lead, add a note, change status, and move to the next lead in under 30 seconds. If it’s slower than that, simplify the UI before launch.

## **Landing Page CTA vs. Internal Workflow Mismatch**

The CTA says “Request Catering” but if the internal response takes 2 days, the prospect’s impression of Buddas is ruined. Resolution: hard SLA of 4 business hours. Notification fires to rep’s phone on every new lead. Track time-to-first-contact as a dashboard KPI. If SLA is routinely missed, escalate to owner.

# **11\. Open Questions**

| \# | Question | Recommended Answer | Owner | Deadline |
| :---- | :---- | :---- | :---- | :---- |
| 1 | What happens if a business misses their 2/4/6 commitment? | Grace period \+ manual conversation for v1. Do not codify a penalty. Let sales handle case-by-case. Revisit when 10+ memberships are active. | Ops | Before v2 |
| 2 | Will there be tiers above 6 annual events? | Yes, but call it “Custom Volume Plan” and handle via sales. Do not add a 4th tier to the page or CRM schema until demand proves it. | Marketing \+ Ops | Q3 2026 |
| 3 | When does the birthday program become phase 2? | After catering CRM is stable (post Week 12). Birthday is a separate funnel with different users, different form fields, and different fulfillment. Do not merge. | Product | Q3 2026 |
| 4 | How far should commission automation go? | V1: manual owner approval only. V2: consider auto-approval for repeat-tier events from verified companies. V3: automated payout integration. Each step requires trust earned from the previous one. | Ops \+ Tech | V2 planning |
| 5 | What qualifies as “Won” vs. merely “Scheduled”? | “Won” \= prospect has verbally or in writing committed to an event with a date and approximate group size. “Scheduled” is not a pipeline status—use the preferred date on the Catering Request to represent scheduling. The pipeline status stays “Won” until the event is “Fulfilled.” | Ops | Week 2 |
| 6 | Does White on Teal pass WCAG AA for CTA buttons? | Likely no for normal-size text (ratio \~3.2:1). Default primary CTA to White on Dark Teal (\#1C5F56). Test and confirm in Week 1\. | Design \+ Tech | Week 1 |
| 7 | Where do form submissions land—Firestore or a hybrid? | Firestore for v1. If query complexity exceeds Firestore’s capabilities (e.g., complex reporting joins), add BigQuery export via Firebase Extensions in v2. | Tech | Week 1 |
| 8 | Should rep assignment be manual, geographic, or round-robin? | Manual for v1 (owner assigns). If rep count exceeds 3, implement round-robin auto-assignment in v2. | Ops | V2 planning |

**Sign-off**

**Chief Digital & Growth Officer:** \[Pending\]

**Creative Director:** \[Pending\]

**Ops Lead:** \[Pending\]

**Founder / CEO:** \[Pending\]

Document version: 3.0 — Elevated Edition

Last updated: March 2026