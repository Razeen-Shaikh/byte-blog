# Byte Blog

A production-oriented full-stack editorial blog built with Next.js App Router, Prisma, PostgreSQL (Neon), Auth.js, TipTap, and TanStack Query.

## Features

- Public editorial site: home, articles, categories, authors, search, legal pages
- Immersive article reading with TOC, progress, sharing, likes, bookmarks, and comments
- Auth.js authentication with email/password and optional Google OAuth
- Role-based admin dashboard (`USER`, `AUTHOR`, `EDITOR`, `ADMIN`)
- TipTap rich text editor with autosave
- SEO: metadata, Open Graph, sitemap, robots.txt, RSS, JSON-LD
- Seeded development data

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + Radix UI primitives
- Prisma 6 + PostgreSQL
- Auth.js (NextAuth v5)
- Zod + React Hook Form
- TipTap + Framer Motion + Lucide

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and `.env.local`, then set:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="long-random-string"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@byteblog.dev"
ADMIN_PASSWORD="Admin123!ChangeMe"
ADMIN_NAME="Byte Admin"
ADMIN_USERNAME="admin"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Byte Blog"
```

Optional:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Database

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Default seeded admin (from env):

- Email: `admin@byteblog.dev`
- Password: value of `ADMIN_PASSWORD`

Additional seeded authors use password `Password123!`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed categories, tags, articles, users |
| `npm run db:studio` | Open Prisma Studio |

## Architecture

```text
app/
  (site)/          Public website pages
  admin/           Admin dashboard
  api/             Route handlers
  feed.xml/        RSS feed
components/        UI, layout, editor, admin widgets
lib/
  auth.ts          Auth.js config + helpers
  prisma.ts        Prisma client
  services/        Database access layer
  validations/     Zod schemas
prisma/
  schema.prisma
  seed.ts
proxy.ts           Next.js 16 request proxy (admin + auth routes)
```

## Roles

- `USER` — read, comment, like, bookmark, follow
- `AUTHOR` — create/edit own articles
- `EDITOR` — manage content and moderation
- `ADMIN` — full access including user roles

## Notes

- Never commit `.env` or production credentials.
- Google OAuth and Cloudinary are optional; credentials auth and URL-based images work without them.
- Cover images in seed data use Unsplash remote URLs configured in `next.config.ts`.
