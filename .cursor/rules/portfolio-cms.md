# Portfolio CMS Project Rules

This is a Next.js App Router portfolio and admin CMS project.

Stack:
- Next.js App Router
- TypeScript
- Material UI
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase RLS

Design:
- Dark-first UI
- Primary accent: #FF6600
- Rounded cards
- Montserrat headings
- Roboto body text
- Clean, professional, recruiter-friendly design

Architecture rules:
- Use Supabase client from src/lib/supabase/client.ts for client-side auth.
- Do not expose secret/service role keys in frontend code.
- Admin pages live under src/app/admin.
- Public portfolio pages must only read published content.
- Admin pages can read unpublished content after auth/admin verification.
- Keep components reusable.
- Keep forms strongly typed.
- Use Material UI components.
- Keep mobile responsiveness.

CMS MVP:
- Projects
- Blog posts
- Experience
- Education
- Skills
- Contact messages
- Site settings/resume

Do not:
- Redesign the public portfolio unless requested.
- Replace the existing theme system.
- Add a separate backend.
- Use NestJS for this portfolio CMS.