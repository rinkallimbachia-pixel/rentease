# Detailed Project Report: RentEase

**Project title:** RentEase — Furniture & Appliance Rental Platform (Demo)  
**Type:** Single-page web application (frontend prototype)  
**Prepared for:** Internship / academic project documentation  
**Date:** May 2026  

---

## Title page (fill and use on cover)

| Field | Details |
|--------|---------|
| **Report title** | Detailed Project Report — RentEase |
| **Student name** | *[Your full name]* |
| **Roll / enrollment no.** | *[Your number]* |
| **Course / program** | *[e.g. B.Tech CSE, MCA]* |
| **Institution** | *[College / university name]* |
| **Department** | *[Department name]* |
| **Academic year / semester** | *[e.g. 2025–26, Semester 6]* |
| **Guide / supervisor** | *[Name, designation]* |
| **Submission date** | *[Date]* |

---

## Declaration

I hereby declare that this project report titled **“RentEase — Furniture & Appliance Rental Platform”** submitted to **[Institution name]** is my own original work. The design, implementation, and documentation have been carried out by me under the guidance of **[Guide name]**. I have not copied from any source without proper acknowledgment. Any material taken from books, articles, or online resources has been cited where applicable.

I understand that if any part of this work is found to be plagiarized or falsely claimed, appropriate action may be taken as per institutional rules.

**Place:** ___________________  
**Date:** ___________________  

**Signature of student:** ___________________  
**Name:** *[Your full name]*  

---

## Certificate

This is to certify that **[Student full name]**, Roll / Enrollment No. **[number]**, a student of **[Program, Department]**, **[Institution name]**, has completed the project work titled **“RentEase — Furniture & Appliance Rental Platform”** in partial fulfillment of the requirements for the award of **[degree / course]** during the academic year **[year]**.

To the best of my knowledge, the work presented in this report is original and has been carried out under my supervision.

**Guide / Supervisor**  
Name: ___________________  
Designation: ___________________  
Signature: ___________________  
Date: ___________________  

**Head of Department**  
Name: ___________________  
Signature: ___________________  
Date: ___________________  

**External examiner (if applicable)**  
Name: ___________________  
Signature: ___________________  
Date: ___________________  

---

## Acknowledgement

I express my sincere gratitude to **[Institution name]** and the **[Department name]** for providing the opportunity and facilities to carry out this project.

I am deeply thankful to my project guide **[Guide name]**, **[designation]**, for valuable guidance, suggestions, and constant support throughout the development of **RentEase**.

I would also like to thank the faculty members and my peers who helped me with feedback and discussions during the implementation using **Angular**, **TypeScript**, and related tools.

Finally, I thank my family for their encouragement.

**[Your full name]**  
**[Roll / enrollment number]**  

---

## 1. Executive summary

**RentEase** is a browser-based demo application for renting furniture and home appliances. It lets customers browse a catalog, manage a cart, complete a checkout flow, and track rentals. Separate experiences exist for **vendors** (order visibility, logistics) and **admins** (catalog and operational controls). All persistent data lives in the user’s **browser (`localStorage`)**; there is **no backend server**, which keeps deployment simple and makes the project suitable for learning full-stack concepts on the client side first.

---

## 2. Problem statement & motivation

Urban users often need **short-term access** to furniture and appliances (relocating, temporary stays, trials before purchase). Buying is costly; traditional rental workflows can be opaque. RentEase models a **digital rental journey**: discovery → cart → order → ongoing rental management → support (maintenance) and dispute-style **claims**, aligned with how a real marketplace might behave.

---

## 3. Objectives

| Objective | Description |
|-----------|-------------|
| **O1** | Provide a clear catalog of rentable items with monthly price, deposit, and tenure options. |
| **O2** | Support user registration, login, and **role-based** navigation (user, vendor, admin). |
| **O3** | Implement cart, checkout with **service area** and delivery details, and order history. |
| **O4** | Enable **vendor** and **admin** dashboards for operational tasks. |
| **O5** | Demonstrate **maintenance requests** and **claims** workflows with status tracking. |
| **O6** | Deliver a responsive UI (mobile header + desktop sidebar) with a cohesive design system. |

---

## 4. Scope

### 4.1 In scope

- Client-only Angular app with mocked/async-style RxJS delays simulating network latency.
- CRUD-style operations on products (admin), orders (user/vendor/admin flows), maintenance, and claims where implemented in services.
- Session persistence via `localStorage` (users, session token stub, products, orders, etc.).

### 4.2 Out of scope (current demo)

- Real authentication (passwords stored in plain text in local demo data — **not production-safe**).
- Payment gateway, KYC, or document verification.
- Real-time notifications, email/SMS, or multi-device sync.
- Server API, database, and deployment hardening.

---

## 5. Technology stack

| Layer | Technology | Version (from project) |
|-------|------------|-------------------------|
| Framework | **Angular** | ^21.2.x |
| Language | **TypeScript** | ~5.9.x |
| Styling | **SCSS** + **Tailwind CSS** | Tailwind ^3.4.x |
| Reactive programming | **RxJS** | ~7.8.x |
| State (local) | Angular **signals** + `BehaviorSubject` | — |
| Unit tests | **Vitest** (via Angular build) | ^4.0.x |
| Tooling | Angular CLI, Prettier | CLI ^21.2.x |

---

## 6. System architecture

### 6.1 High-level architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    Browser (SPA)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Features   │  │ Core services │  │ Shared models │  │
│  │ (components) │──│ Auth, Storage │──│ User, Order…  │  │
│  └──────────────┘  └──────┬───────┘  └───────────────┘  │
│                           │                              │
│                    localStorage                         │
└─────────────────────────────────────────────────────────┘
```

- **Standalone components** and **lazy-loaded routes** reduce initial bundle size for each screen.
- **Services** centralize business rules and persistence keys (e.g. `rentease_users`, `rentease_orders`, `rentease_products`).

### 6.2 Folder structure (conceptual)

- `src/app/core/` — cross-cutting: `AuthService`, `StorageService`, `ServiceAreaService`.
- `src/app/features/` — feature modules: auth, products, cart, orders, maintenance, admin, vendor, home.
- `src/app/shared/` — reusable pieces: models (`entities.ts`), pipes (e.g. INR formatting), UI components.
- `src/app/pages/` — additional marketing/content-style pages (home, catalog, plans, etc. where used alongside features).

---

## 7. Functional modules & user flows

### 7.1 Authentication (`AuthService`)

- **Register:** rejects duplicate emails; assigns UUID; persists user list.
- **Login:** validates email/password; stores session object `{ token, userId }`; exposes `currentUser` as a signal; computed flags `isAdmin`, `isVendor`.
- **Seed accounts:** demo **admin** (`admin@rentease.com` / `admin123`) and **vendor** (`vendor@rentease.com` / `vendor123`) are ensured on startup.
- **Logout:** clears session and user signal.

### 7.2 Catalog & products (`ProductService`)

- Categories: **Furniture**, **Appliance**.
- Each product: monthly rent, deposit, tenure options, image, availability.
- Admin can add/update/delete/toggle availability (consumed by admin dashboard).

### 7.3 Cart & checkout

- **CartService** holds line items (product id, tenure, quantity).
- **Checkout** collects delivery/service-area context and creates an **Order** via `OrderService`.

### 7.4 Orders (`OrderService`)

- Orders include: user, vendor, items, totals, delivery/pickup dates, service area, location, **status** (`active` | `completed` | `cancelled`).
- Operations include status updates, rental extension per line item, vendor views, and pickup scheduling.

### 7.5 Maintenance & claims

- **Maintenance** requests tied to orders with statuses: `open`, `in-progress`, `resolved`.
- **Dispute / damage claims** (`ClaimService`) with types and review statuses for dispute resolution flows.

### 7.6 Role-based dashboards

- **User dashboard:** personal rentals and related actions.
- **Vendor dashboard:** orders for the vendor, logistics-oriented actions.
- **Admin dashboard:** catalog and broader controls.

### 7.7 Routing (summary)

| Path | Screen |
|------|--------|
| `/` | Home |
| `/login`, `/register` | Auth |
| `/products`, `/products/:id` | Catalog & detail |
| `/cart`, `/checkout` | Cart & checkout |
| `/dashboard` | User rentals |
| `/maintenance` | Support tickets |
| `/admin`, `/vendor` | Role dashboards |

Unknown paths redirect to home (`**` → `''`).

---

## 8. Data model (entities)

Key interfaces (from `shared/models/entities.ts`):

- **User** — `id`, `name`, `email`, `password`, `role` (`user` | `vendor` | `admin`).
- **Product** — rental pricing, deposit, `tenureOptions[]`, `available`.
- **CartItem** — `productId`, `tenure`, `quantity`.
- **Order** — links `userId`, `vendorId`, items, financials, dates, `serviceAreaId`, `deliveryLocation`, `status`.
- **MaintenanceRequest** — `orderId`, issue, status, timestamps.
- **ServiceArea** — city, zone, active flag.
- **DisputeClaim** — order/user linkage, type (`damage` | `dispute`), description, status.

---

## 9. User interface & UX

- **Responsive layout:** mobile sticky header with horizontal nav; **desktop sidebar** with main content scroll isolation.
- **Branding:** “RentEase” with furniture/appliances positioning; custom CSS utility classes (`re-*`) combined with Tailwind.
- **Accessibility-minded patterns:** semantic regions (header, aside, main, footer), focus on readable typography and contrast (per theme tokens in SCSS).
- Footer states clearly: **demo app**, data in **browser storage**, **no server**.

---

## 10. Testing & quality

- **Unit tests** configured with Angular’s Vitest builder (`ng test`).
- Spec files present for e.g. `AuthService`, `InrPipe`, root `App` component.
- **Prettier** in devDependencies for consistent formatting.

---

## 11. Security & ethics (important for report reviewers)

- This is a **learning/demo** project. Credentials and tokens are **not** secured like production systems.
- For a real product: hash passwords, use HTTPS, backend validation, RBAC on APIs, and avoid storing sensitive PII in `localStorage`.

---

## 12. Limitations

1. No server — data is **per-browser** and can be cleared by the user.  
2. No concurrent multi-user consistency.  
3. Images partly rely on external URLs (Unsplash) and local assets — offline behavior varies.  
4. No payment or legal rental agreements.

---

## 13. Future enhancements

- REST or GraphQL **backend** with PostgreSQL/MongoDB and proper auth (JWT/OAuth2).
- **Payment** integration and invoice PDFs.
- **Admin analytics** (revenue, utilization, churn).
- **Push notifications** for delivery and maintenance updates.
- **E2E tests** (Playwright/Cypress) for critical flows.

---

## 14. How to run the project

```bash
npm install
npm start
```

Open `http://localhost:4200/`. Build for production: `npm run build`.

---

## 15. Conclusion

RentEase successfully demonstrates a **multi-role rental marketplace** on the **Angular** platform, with a **modular feature layout**, **reactive services**, and **persistent client-side state**. It is appropriate as an **internship showcase** of frontend architecture, UX for rentals, and domain modeling; extending it with a secure backend would align it with industry-ready deployments.

---

*End of report.*
