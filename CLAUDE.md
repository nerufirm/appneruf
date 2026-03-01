# CLAUDE.md

## Project Overview

**AppSheetto** is a healthcare record management web application for Japanese nursing/care facilities (介護施設向け記録管理システム). It allows staff to manage resident profiles, record vitals, and view integrated timelines of daily records and chat logs.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 via PostCSS
- **Database**: Supabase (PostgreSQL)
- **Forms**: react-hook-form
- **Icons**: lucide-react
- **Auth**: Cookie-based staff sessions with Next.js middleware

## Project Structure

```
src/
├── app/
│   ├── api/chatwork-sync/route.ts   # Chatwork webhook → Supabase sync
│   ├── login/page.tsx               # Staff login page
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Main dashboard page (server component)
│   └── globals.css                  # Tailwind global styles
├── components/
│   ├── Dashboard.tsx                # Facility-wide overview
│   ├── UserList.tsx                 # Sidebar with resident search/filter
│   ├── UserDetail.tsx               # Resident detail view
│   ├── UserProfile.tsx              # Resident header with medical info
│   ├── TimelineSection.tsx          # Records timeline with filtering
│   ├── Timeline.tsx                 # Timeline rendering
│   ├── StaffHeader.tsx              # Top navigation
│   ├── RecordModal.tsx              # New record modal
│   └── RecordForm.tsx               # Vitals entry form
├── lib/
│   ├── supabase.ts                  # Supabase client (anon key)
│   ├── supabase-admin.ts            # Supabase admin client (service role)
│   ├── chatwork-utils.ts            # Name normalization & timestamp utils
│   ├── staffCookie.ts               # Staff session cookie management
│   └── name-map.ts                  # Name-to-ID mapping cache (5-min TTL)
└── types/
    └── index.ts                     # All TypeScript type definitions
middleware.ts                        # Auth middleware (route protection)
```

## Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (flat config, Next.js core-web-vitals + TypeScript rules)
```

## Architecture

### Component Model
- **Server Components** (async, fetch data from Supabase): `Dashboard`, `UserDetail`, `UserProfile`, `page.tsx`
- **Client Components** (`"use client"`): `UserList`, `TimelineSection`, `RecordForm`, `RecordModal`, `StaffHeader`

### Data Flow
1. Server components fetch from Supabase directly using `@supabase/supabase-js`
2. Client components use browser-side Supabase client for mutations and filtering
3. Chatwork webhook (`/api/chatwork-sync`) receives external messages and syncs to `chat_logs` table

### Authentication
- Staff selects their identity on `/login`, stored in `appsheetto_staff` cookie
- `middleware.ts` protects all routes except `/login`, `/api/*`, and static assets
- Unauthenticated requests redirect to `/login`

### Database Tables (Supabase)
- `users` — Facility residents (name, building_room, care_level, etc.)
- `staff` — Staff members (name, department)
- `daily_records` — Vital signs and care logs (body_temp, bp_high/low, pulse, spo2, etc.)
- `chat_logs` — Chatwork messages (staff_name, message, send_time, category_tag)
- `medical_histories` — Resident conditions (disease_name, onset_date, hospital)
- `medications` — Prescriptions (timing, medicine_name, dosage)

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anonymous/public key
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (server-side only)
CHATWORK_WEBHOOK_SECRET=          # Chatwork webhook authentication secret
```

## Conventions

- **Language in code**: Variable names and code in English; UI text and commit messages in Japanese
- **Path aliases**: Use `@/` to import from `src/` (e.g., `import { supabase } from "@/lib/supabase"`)
- **Type definitions**: All shared types live in `src/types/index.ts`
- **Supabase clients**: Use `supabase` (anon) for client-side; `supabaseAdmin` (service role) for server-side/API routes only
- **No testing framework** is currently configured
- **No CI/CD pipeline** is currently configured
- **No Prettier** — formatting relies on ESLint rules only
