\# SN Studio Project Context



\## Stack

\- React

\- TypeScript

\- Vite

\- Supabase

\- GitHub

\- Dark Premium UI



\## Repository

https://github.com/buisyngoc2811/sn-studio



\## Completed Phases

\- Phase 1: Authentication

\- Phase 2: User Profiles

\- Phase 3: Apps Supabase

\- Phase 4: Marketplace Supabase

\- Phase 5: Admin CMS

\- Admin User Management CRUD

\- Auth users auto-create profiles

\- Banned users are blocked from using the site



\## Supabase

Important tables:

\- profiles

\- apps

\- app\_versions

\- categories

\- marketplace\_categories

\- marketplace\_items

\- marketplace\_versions

\- marketplace\_reviews

\- marketplace\_purchases



Important systems:

\- RLS enabled

\- Auth users trigger creates profiles

\- Admin profile CRUD uses safe RPC

\- Storage buckets:

&#x20; - app-icons

&#x20; - app-files



\## Admin Account

\- Username: admin

\- Email: admin@gmail.com

\- Password: 01022004

\- Role: admin



\## Rules

\- Do not use mock data if real Supabase data exists.

\- Do not redesign UI unless explicitly requested.

\- Keep current dark premium SN Studio style.

\- Always run npm run build.

\- Only commit/push after tests pass.

\- If Supabase migration is needed, generate SQL and ask user to apply it first.

\- Never create recursive RLS policies on profiles.

\- Use SECURITY DEFINER RPC for admin profile mutations if needed.



\## Current Next Phase

Phase 7: Real Marketplace Commerce \& Licensing



Planned features:

\- Real download from Supabase Storage

\- Download logs

\- Purchase table

\- Free claim flow

\- Paid mock purchase flow

\- License keys

\- Hashed license storage

\- License status: active, revoked, expired

\- Version update/download latest

\- Admin license revoke

\- Admin purchase management

\- Banned users cannot download, purchase, or access license keys

