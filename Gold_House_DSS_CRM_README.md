# Gold House DSS --- Customer Loyalty CRM

## 1. Project Overview

**Project name:** Gold House DSS CRM\
**Business:** Gold House DSS, a jewellery showroom\
**Existing public website:** https://goldhousedss.com\
**Planned CRM URL:** `https://crm.goldhousedss.com`

The goal is to extend Gold House DSS beyond its current public-facing
jewellery showcase website by building a separate, staff-facing Customer
Relationship Management (CRM) application.

This is **not a traditional e-commerce website**. Customers will not
purchase jewellery online through this project. The public website will
continue showcasing jewellery, while the CRM will help staff manage
customer relationships, purchase history, loyalty rewards, family
membership, referrals, and follow-ups.

This README is the project handover/context file. When provided in a new
ChatGPT conversation, use it as the source of truth so the user does not
need to explain the project from the beginning.

------------------------------------------------------------------------

## 2. Confirmed Business Decisions

-   The existing public jewellery website remains separate and continues
    to showcase products and store information.
-   The CRM will be deployed as a separate application on
    `crm.goldhousedss.com`.
-   The CRM is initially for **authorized staff only**.
-   A customer-facing portal may be added in a later phase; do not build
    it in the first release.
-   Gold House already uses billing software, but its name and
    integration capabilities are **not yet known**.
-   The CRM must support existing customer records as well as new
    customer registrations.
-   The loyalty offering includes both reward points and membership
    benefits.
-   The owner will approve the actual reward policy, earning rate,
    redemption rules, tier thresholds, and eligibility rules.
-   Family membership tiers are based on **combined eligible purchases
    by linked family members**.
-   Do not invent or hardcode final reward rates or membership
    thresholds.
-   The frontend should look modern, polished, and premium, appropriate
    for a jewellery brand.
-   Prioritize the staff workflow: clear tables, fast search, responsive
    forms, useful dashboards, and reliable records.

## 3. Recommended Technology Stack

### Frontend

-   React
-   Vite
-   Tailwind CSS
-   shadcn/ui for reusable interface components
-   Lucide React for icons
-   Motion for React for subtle, purposeful animations
-   Recharts for dashboard charts
-   Axios for API requests
-   React Router for routing
-   React Hook Form + Zod for form validation
-   TanStack Table for advanced data tables when needed

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   Server-side authentication and role-based authorization
-   Zod or Joi for request validation

### Hosting and integrations

-   Frontend: Vercel is a possible option.
-   Backend: Render or another suitable production host.
-   Database: MongoDB Atlas or another appropriately configured MongoDB
    deployment.
-   Messaging: an approved WhatsApp Business messaging integration may
    be added in a later phase.
-   Billing integration: initially design for CSV/XLSX import, then add
    a vendor API/webhook adapter if supported by the billing software.

Hosting choices are recommendations and should be confirmed against the
client's integration, security, and operational requirements.

------------------------------------------------------------------------

## 4. Visual Design Direction

Use a premium jewellery-inspired visual identity:

-   Burgundy / deep wine
-   Champagne gold
-   Ivory / warm white
-   Charcoal for contrast
-   Elegant serif headings paired with clean sans-serif body text
-   Subtle shadows, restrained animations, consistent spacing, polished
    tables, and responsive layouts

The CRM should feel premium but remain practical for staff who use it
throughout the working day. Avoid excessive animation, cluttered
dashboards, or low-contrast text.

The public website and staff CRM have different purposes: - Public
website: jewellery imagery, collections, product details, enquiries,
store information, and WhatsApp contact. - CRM: data-heavy staff
workflows, customer profiles, invoices, family membership, rewards,
referrals, and reporting.

------------------------------------------------------------------------

## 5. Planned CRM Modules

### Phase 1 --- Core foundation

1.  Staff login and logout
2.  Admin and staff roles/permissions
3.  Dashboard shell and navigation
4.  Customer management
5.  Customer search, filtering, pagination, and profile view
6.  Import of existing customer records

### Phase 2 --- Purchases and loyalty

1.  Invoice import and validation
2.  Invoice history per customer
3.  Reward policy configuration
4.  Reward points ledger
5.  Redemption workflow
6.  Returns, cancellations, reversals, and audit history
7.  Membership tier calculations

### Phase 3 --- Family Privilege Club

1.  Create Family IDs, e.g. `GHF000001`
2.  Link customers to a family
3.  Store family name and family head
4.  Calculate combined eligible family purchases
5.  Calculate family membership tier using owner-approved rules
6.  Show family members and purchase summaries

### Phase 4 --- Referrals and engagement

1.  Unique referral codes
2.  Track referrer and referred customer
3.  Award referral benefits only after the approved qualification
    condition is met
4.  Birthday and anniversary reminders
5.  Inactive-customer follow-up lists
6.  WhatsApp messages through an approved integration

### Phase 5 --- Reporting and production readiness

1.  Customer, invoice, and rewards reports
2.  Membership and referral summaries
3.  Audit logs
4.  Error monitoring and secure logging
5.  Database backups and restore testing
6.  Permission, security, and workflow testing

### Later phase --- Customer portal

A customer login/portal to view points, membership, purchase history,
and offers may be considered after the staff CRM is stable. It is not
part of the first release.

------------------------------------------------------------------------

## 6. Suggested Frontend Folder Structure

Use a feature-based structure so each CRM module remains organized.

``` text
client/
└── src/
    ├── components/
    │   ├── common/
    │   ├── layout/
    │   └── charts/
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── customers/
    │   ├── families/
    │   ├── invoices/
    │   ├── rewards/
    │   ├── referrals/
    │   ├── memberships/
    │   ├── notifications/
    │   ├── reports/
    │   └── staff/
    ├── services/
    ├── hooks/
    ├── contexts/
    ├── routes/
    ├── utils/
    ├── App.jsx
    └── main.jsx
```

Suggested backend structure:

``` text
server/
└── src/
    ├── config/
    ├── models/
    ├── controllers/
    ├── services/
    ├── routes/
    ├── middleware/
    ├── validators/
    ├── integrations/
    │   └── billing/
    ├── jobs/
    ├── utils/
    ├── app.js
    └── server.js
```

Keep reward calculations and business rules in backend services. The
frontend should display results returned by the API, not calculate
authoritative reward balances.

------------------------------------------------------------------------

## 7. Initial Data Models

These are starting designs, not finalized schemas. Adjust them after
reviewing the billing export and confirming owner policies.

### `User`

-   Name
-   Normalized email
-   Password hash
-   Role (`admin` or `staff`)
-   Active status
-   Last login
-   Created/updated timestamps

### `Customer`

-   Unique Customer ID, e.g. `GHC000001`
-   Name
-   Normalized mobile number
-   Email
-   Birthday
-   Anniversary
-   Address
-   Optional Family ID
-   Unique referral code
-   Optional referrer customer ID
-   Tags, such as Wedding Customer, Gold Buyer, Diamond Buyer, Exchange
    Customer, or VIP
-   Active status
-   Created by / timestamps

Do not assume every family member has a different mobile number. Confirm
how the shop wants to handle shared numbers and duplicate records.

### `Family`

-   Unique Family ID, e.g. `GHF000001`
-   Family name
-   Family head customer
-   Member customer references
-   Derived combined eligible purchase total
-   Derived membership tier
-   Active status
-   Created by / timestamps

Family purchase totals and tiers should be derived from eligible invoice
records, not freely edited by staff.

### `Invoice`

-   Invoice number
-   Billing source
-   Source invoice ID, where available
-   Customer reference
-   Invoice date
-   Currency (INR)
-   Invoice total
-   Eligible amount
-   Product categories or invoice line details, if available
-   Status (`pending`, `posted`, `returned`, `cancelled`)
-   Import job reference
-   Created/updated timestamps

Use a unique source identifier or a documented deduplication strategy to
prevent the same invoice from being processed twice. Store monetary
amounts as integer paise where practical.

### `RewardTransaction`

-   Customer reference
-   Optional family reference
-   Type (`earn`, `redeem`, `reversal`, `adjustment`)
-   Signed points amount
-   Related invoice
-   Related original transaction, where applicable
-   Reward policy version
-   Description/reason
-   Created by
-   Timestamp

Maintain an auditable ledger. Do not silently overwrite reward history.
Correct mistakes through reversal/adjustment entries. Prevent
redemptions beyond the available balance.

### `RewardPolicy`

-   Policy name and version
-   Points earning rate and unit
-   Eligible categories or invoice components
-   Excluded charges
-   Redemption conversion/rules
-   Referral bonus rules
-   Effective dates
-   Active status
-   Approved by

Actual rates and thresholds must remain unset or clearly marked as
drafts until approved by the owner.

### `ImportJob`

-   Source
-   File name
-   Status (`uploaded`, `validating`, `completed`, `failed`)
-   Total, successful, and rejected row counts
-   Row-level error details
-   Started by
-   Completion timestamp

Additional collections may include `Referral`, `NotificationLog`, and
`AuditLog`.

------------------------------------------------------------------------

## 8. API Plan

Use a versioned prefix such as `/api/v1`.

### Authentication

-   `POST /api/v1/auth/login`
-   `POST /api/v1/auth/logout`
-   `GET /api/v1/auth/me`

### Customers

-   `GET /api/v1/customers` --- search, filters, pagination
-   `POST /api/v1/customers` --- create
-   `GET /api/v1/customers/:id` --- details
-   `PATCH /api/v1/customers/:id` --- update
-   `POST /api/v1/customers/import` --- import existing records

### Families

-   `GET /api/v1/families`
-   `POST /api/v1/families`
-   `GET /api/v1/families/:id`
-   `POST /api/v1/families/:id/members`
-   Add suitable endpoints to remove/reassign members with audit
    history.

### Invoices and imports

-   `GET /api/v1/invoices`
-   `GET /api/v1/invoices/:id`
-   `POST /api/v1/invoices/import`
-   `GET /api/v1/imports/:id`

### Rewards and policies

-   `GET /api/v1/customers/:id/rewards`
-   `POST /api/v1/rewards/redemptions`
-   `GET /api/v1/admin/reward-policies`
-   `POST /api/v1/admin/reward-policies`

### Dashboard

-   `GET /api/v1/dashboard/summary`

Add referral, notification, staff, and reporting endpoints when those
phases are implemented. All endpoints must enforce authorization and
validate incoming data on the server.

------------------------------------------------------------------------

## 9. Billing Software Integration Strategy

The existing billing software is used by Gold House, but its
product/vendor name and integration capabilities are not yet known.

**Do not assume a specific billing vendor or invent its API.**

First ask the owner/staff: 1. What is the exact name and version of the
billing software? 2. Can it export invoices to CSV or Excel? 3. Does the
vendor provide an API, webhook, or supported integration? 4. Which
invoice fields are available (invoice ID, invoice number, date, customer
mobile, line items, totals, returns/cancellations)? 5. Can the client
provide an anonymized sample export?

Build a replaceable billing adapter interface. For the initial version,
CSV/XLSX import is a reasonable fallback. If a supported API exists, add
a vendor-specific adapter later without rewriting the reward engine.

Never directly modify the billing system's database unless the vendor
explicitly supports the access method.

### Safe invoice import flow

``` text
Billing export
    ↓
Billing adapter / parser
    ↓
Normalize invoice fields
    ↓
Validate fields and customer match
    ↓
Check duplicate source invoice
    ↓
Preview valid and rejected rows
    ↓
Authorized staff confirms import
    ↓
Post invoice once
    ↓
Apply approved reward policy
    ↓
Update family eligible spending and tier
    ↓
Write audit record
```

The same invoice must never award points twice. Handle returns and
cancellations by reversing the applicable purchase eligibility and
reward entries. Where multiple database updates must succeed together,
use MongoDB transactions if supported by the deployment.

------------------------------------------------------------------------

## 10. Important Business Rules and Safety Requirements

1.  The owner must approve reward earning rates, redemption conversion,
    tier thresholds, eligible purchase components, exclusions, expiry
    rules, referral conditions, and downgrade rules.
2.  Do not hardcode unapproved values in frontend or backend code.
3.  Individual reward points and family membership tiers are different
    concepts. Family spending does not automatically combine each
    member's redeemable points.
4.  Only authorized staff may view or change customer information.
5.  Only authorized roles may change reward policy, approve adjustments,
    manage staff, or export sensitive records.
6.  Validate all inputs on the backend.
7.  Prevent duplicate customers, invoices, referrals, and reward events
    using appropriate database constraints and idempotency checks.
8.  Keep audit history for sensitive actions.
9.  Avoid exposing customer records through public website routes.
10. Use secure authentication, HTTPS, safe secrets management, backups,
    and tested restore procedures.
11. Follow applicable privacy requirements for customer personal data
    and messaging consent.
12. Use realistic-looking sample data only in development; never present
    mock statistics as live production data.

------------------------------------------------------------------------

## 11. Recommended Development Sequence

### Step 1 --- Frontend foundation (start here)

-   Create the React + Vite project.
-   Configure Tailwind CSS and shadcn/ui.
-   Establish the burgundy/gold/ivory design system.
-   Build the responsive CRM sidebar, header, page layout, and
    navigation.
-   Build the dashboard with clearly labeled sample data.
-   Build customer list, customer form, and customer profile UI.

### Step 2 --- Backend foundation

-   Create Express app and MongoDB connection.
-   Configure environment variables and error handling.
-   Implement staff authentication and authorization.
-   Add `User`, `Customer`, and `Family` models.
-   Add customer CRUD, search, pagination, and import.

### Step 3 --- Invoice import

-   Create `Invoice` and `ImportJob` models.
-   Implement CSV/XLSX parsing, validation, preview, duplicate
    detection, and error reporting.
-   Confirm the actual billing software before building any
    vendor-specific integration.

### Step 4 --- Rewards and membership

-   Implement versioned reward policy configuration.
-   Implement reward ledger, redemption, reversals, and audit history.
-   Implement family eligible-spending aggregation and membership tiers.
-   Test returns, duplicate imports, concurrent redemptions, and tier
    changes.

### Step 5 --- Referrals and customer engagement

-   Implement referral codes and qualifying conditions.
-   Add reminders, notification logs, and approved WhatsApp integration.
-   Add reporting and staff workflows.

### Step 6 --- Deployment and launch

-   Configure `crm.goldhousedss.com` DNS and HTTPS.
-   Configure production API and database access.
-   Migrate and reconcile customer data.
-   Test staff permissions, invoice import, backups, and restore.
-   Train staff and launch in a controlled manner.

------------------------------------------------------------------------

## 12. Current Status and Unresolved Questions

### Confirmed

-   [x] Existing public website remains separate.
-   [x] CRM will use `crm.goldhousedss.com`.
-   [x] Initial CRM is staff-only.
-   [x] Rewards include points and membership benefits.
-   [x] Existing and new customer records must be supported.
-   [x] Family tier is based on combined eligible purchases.
-   [x] Owner will approve reward rules.
-   [x] Customer portal is deferred to a later phase.
-   [x] Frontend should have a premium, polished jewellery-brand
    aesthetic.

### Still to confirm

-   [ ] Exact billing software name and version.
-   [ ] Billing export/API/webhook capabilities.
-   [ ] Customer data file structure and quality.
-   [ ] Owner-approved earning, redemption, tier, expiry, referral, and
    return rules.
-   [ ] How the shop wants to handle shared phone numbers and duplicate
    customer records.
-   [ ] Staff roles and which permissions each role needs.
-   [ ] Production hosting, backup, and operational requirements.
-   [ ] Approved WhatsApp provider and customer consent process.

------------------------------------------------------------------------

## 13. Instructions for Continuing This Project in a New Chat

When this README is uploaded in a new conversation:

1.  Read the entire README before suggesting code or asking the user to
    repeat requirements.
2.  Treat confirmed decisions in this file as the current source of
    truth.
3.  Do not turn the project into e-commerce. Online jewellery checkout
    is out of scope.
4.  Do not build the customer portal in the first release.
5.  Do not invent the billing software vendor or its API.
6.  Do not invent or hardcode final reward rates and membership
    thresholds.
7.  Continue from the current development step rather than restarting
    the planning process.
8.  When the user requests code, provide complete, copy-paste-ready code
    for the requested file(s), with file paths and required
    dependencies. Do not provide a downloadable code file when the user
    explicitly asks for copy-paste code.
9.  Keep the interface polished and responsive, but prioritize speed and
    clarity for staff.
10. Keep business logic in backend services and enforce permissions on
    the server.
11. Ask only for information that is genuinely necessary for the next
    step.
12. Before implementing billing integration, request the billing
    software name and an anonymized sample export if those details are
    still unknown.

**Current recommended next task:** Create the frontend project and build
the premium CRM shell (sidebar, header, routing, design tokens) followed
by the dashboard and customer management screens using clearly labeled
mock data. Then begin the backend foundation and connect the customer
module to real APIs.
