# RentEase

RentEase is an Angular-based demo platform for renting furniture and appliances.  
It supports catalog browsing, cart and checkout flow, user rentals, and role-based dashboards for vendor and admin users.

## Features

- User registration and login
- Role-based UI (`user`, `vendor`, `admin`)
- Product catalog with category filtering
- Product detail page
- Cart and checkout flow
- User rental dashboard
- Vendor dashboard
- Admin dashboard
- Maintenance request flow
- Claims/dispute tracking
- Responsive layout for mobile and desktop

## Tech Stack

- Angular 21 (standalone components + lazy routes)
- TypeScript
- RxJS
- SCSS + Tailwind CSS
- Vitest (unit testing)
- Browser `localStorage` for persistence (no backend API)

## Project Structure

```text
src/app/
  core/        # auth, storage, service-area services
  features/    # auth, products, cart, orders, maintenance, admin, vendor
  shared/      # models, pipes, reusable components
  pages/       # static/content pages
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm start
```

Open: [http://localhost:4200/](http://localhost:4200/)

### Build

```bash
npm run build
```

### Run Unit Tests

```bash
npm test
```

## Demo Credentials

These are seeded automatically for demo usage:

- Admin: `admin@rentease.com` / `admin123`
- Vendor: `vendor@rentease.com` / `vendor123`

## Routes Overview

- `/` - Home
- `/login`, `/register` - Authentication
- `/products`, `/products/:id` - Catalog and details
- `/cart`, `/checkout` - Cart and checkout
- `/dashboard` - User rentals
- `/maintenance` - Support/maintenance
- `/vendor` - Vendor panel
- `/admin` - Admin panel

## Notes

- This project is a demo and stores data in browser storage.
- Clearing browser storage will reset users, products, orders, and session data.
- No production-grade authentication or payment integration is included yet.

## Documentation

- Detailed internship/project report: `PROJECT_REPORT.md`

---

For Angular CLI reference, see: [Angular CLI Docs](https://angular.dev/tools/cli)
