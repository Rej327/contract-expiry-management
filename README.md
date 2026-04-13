# Contract Expiry Management

A centralized system for tracking, notifying, and renewing employee contracts. This is a feature proposal prototype designed to streamline HR workflows and prevent silent contract expirations.

## Author

Jefferson Resurreccion

## Repository

https://github.com/Rej327/contract-expiry-management

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Supabase (Docker)

Ensure Docker is running, then start the Supabase services:

```bash
npx supabase start
```

After starting, update your `.env.local` with the provided `anon key` and `service_role key`.

#### Database Migrations
To manage your database schema, use the following commands:
- **Create a new migration**: `npx supabase migration new your_migration_name`
- **Apply migrations**: `npx supabase db reset` (This will restart the local DB and apply all migrations).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (Local Docker environment)
- **UI Framework**: Mantine 9 + Mantine DataTable
- **Styling**: Tailwind CSS 4
- **Emails**: Resend
- **Testing**: Jest (Unit) & Playwright (E2E)
- **Icons**: Tabler Icons

## Testing

### Unit Tests

```bash
npm test
```

### End-to-End Tests

```bash
npm run test:e2e
```

## Key Directories

- `/app`: Routing and views
- `/supabase`: Database migrations & configuration
- `/components`: UI component library
- `/lib`: Shared utilities (Supabase client, etc.)
- `/tests`: E2E test suites

## Build Features

- **Production Ready**: Bundled with `removeConsole` for optimized production releases.
- **TopLoader**: Integrated `nextjs-toploader` for smooth page transitions.
- **Notifications**: Pre-configured Mantine notifications system.

---

_Developed for the Formsly Feature Proposal._
