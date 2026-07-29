# Didar.Press — Art Prints & Posters

A small-batch print studio storefront: browse prints/posters, and a studio
admin area (email/password login) for managing the catalogue. Built with
TanStack Start (React), Tailwind CSS, and Supabase.

## Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework (SSR, routing, server functions)
- [Tailwind CSS v4](https://tailwindcss.com/) + shadcn/ui components
- [Supabase](https://supabase.com/) — database + auth (email/password)
- Deploys to [Vercel](https://vercel.com/) with zero extra config (Nitro is already wired up in `vite.config.ts`)

## Local development

You'll need Node.js 20+.

```sh
npm install
cp .env.example .env   # then fill in your Supabase values
npm run dev
```

The app runs at http://localhost:3000 by default.

## Environment variables

Copy `.env.example` to `.env` and fill in the values from your Supabase
project (Project Settings → API):

| Variable | Where it's used | Public? |
|---|---|---|
| `VITE_SUPABASE_URL` | browser client | yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser client | yes (anon/publishable key) |
| `SUPABASE_URL` | server functions / SSR | yes |
| `SUPABASE_PUBLISHABLE_KEY` | server functions / SSR | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | admin server operations (`client.server.ts`) | **no — secret, server-only** |

`SUPABASE_SERVICE_ROLE_KEY` is not in `.env.example` with a real value on
purpose — grab it from Supabase (Project Settings → API → service_role) and
only ever set it as a server-side environment variable (e.g. in the Vercel
dashboard), never commit it or expose it to the client.

Database schema/migrations live in `supabase/migrations`.

## Setting up posters, poster images, and WhatsApp ordering

This app sells posters with **per-size pricing** (e.g. A4 £8, A3 £12) and
routes all ordering and payment through **WhatsApp** — there's no cart or
online checkout.

1. **Run the migrations** — open your Supabase project → SQL Editor, and run
   each file in `supabase/migrations` in order (oldest to newest). The most
   recent one adds:
   - a `sizes` column on `prints` (per-poster size/price options)
   - a public `poster-images` storage bucket, with upload/edit/delete
     restricted to admins, used by the dashboard's image upload button

2. **Set your WhatsApp number** — open `src/lib/site-config.ts` and replace
   `WHATSAPP_NUMBER` with your real number (country code + number, digits
   only, no `+`, no spaces — e.g. a UK mobile `07123 456789` becomes
   `"447123456789"`). This number is used by the floating WhatsApp button on
   every page and the "Order on WhatsApp" button on each poster page.

3. **Add posters from the dashboard** — sign in at `/auth`, claim admin
   access the first time, then use **Add poster** to upload an image and set
   one or more sizes with their own prices.

## Deploying to Vercel

1. Push this repo to your own GitHub account.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
   Vercel auto-detects TanStack Start + Nitro — no build command overrides
   needed.
3. In the Vercel project's **Settings → Environment Variables**, add the five
   variables listed above (use your real Supabase project's values).
4. Deploy. Once it's live, add your custom domain under **Settings → Domains**
   and point your DNS at Vercel as instructed there.

## Build with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Supabase
