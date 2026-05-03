# Online Invitations (Next.js + MongoDB + Auth)

Modern full-stack web app for creating and sharing premium digital invitations.

## Stack

- Next.js (App Router) + React + Tailwind + Framer Motion
- MongoDB Atlas (Node.js driver)
- Auth: NextAuth (Google OAuth + Email magic link)
- Storage: Cloudinary (optional direct uploads)
- Deployment: Vercel

## Quickstart

1) Copy env file

```bash
cp .env.example .env
```

2) Fill values in `.env` (MongoDB, Google OAuth, SMTP, Cloudinary)

3) Install + run

```bash
npm install
npm run dev
```

4) Create MongoDB indexes (slug unique + TTL)

```bash
curl -X POST http://localhost:3000/api/bootstrap -H "Authorization: Bearer $CRON_SECRET"
```

## Core routes

- `GET /` marketing page
- `GET /signin` sign in (Google + Email)
- `GET /dashboard` protected dashboard
- `GET /dashboard/events` events list + analytics
- `GET /dashboard/events/new` create event
- `GET /dashboard/events/:id/edit` edit event
- `GET /dashboard/events/:id/responses` RSVP responses
- `GET /event/:slug` public invitation page

## Component structure

- `src/themes/types.ts` theme + event type enums
- `src/themes/presets.ts` religion presets + default theme presets
- `src/themes/engine.ts` theme resolver (classes + CSS vars + motion preset)
- `src/components/event/event-renderer.tsx` theme-driven invitation renderer (Framer Motion)
- `src/components/event/event-editor.tsx` step-based builder (conditional fields + live preview)
- `src/components/event/share-bar.tsx` QR + WhatsApp + copy-link sharing
- `src/components/event/rsvp-form.tsx` RSVP form (public page)
- `src/components/event/wishes.tsx` guest wishes (public page)
- `src/app/event/[slug]/page.tsx` dynamic event route
- `src/app/api/events/*` event CRUD APIs
- `src/app/api/event/[slug]/*` RSVP + wishes APIs
- `src/app/api/upload/route.ts` Cloudinary uploads
- `src/app/api/cron/cleanup/route.ts` expiry cleanup cron

## Theme system architecture

- Theme config stored per event:
  - `name` (preset name)
  - `religion: islamic | hindu | christian | neutral`
  - `layoutStyle: classic | luxury | modern`
  - `animationStyle: soft | bold | none`
  - `headingText: string` (top heading / mantra)
  - `pattern: islamic | mandala | floral | minimal | geometric | dots`
  - `fontPairing: { heading: serif|sans, body: serif|sans }`
  - `colors: { primary, secondary, accent }` (hex)
- Rendering:
  - `themeCssVars(theme)` maps palette → CSS variables
  - `themeClasses(theme)` maps religion/layout → classes (`layout-*`, `religion-*`)
  - `motionPreset(theme.animationStyle)` maps to Framer Motion transition config
- Live preview:
  - Builder updates theme/colors in state; preview re-renders instantly (no reloads).

## Database schema (MongoDB)

Collections:

- `events`
  - `ownerId: string` (NextAuth user id)
  - `slug: string` (unique, used at `/event/[slug]`)
  - `type: wedding | reception | engagement | housewarming | birthday | generic`
  - `title: string`
  - `date: Date`
  - `venue: string`
  - `mapLink: string`
  - `description: string`
  - `theme: { name, religion, layoutStyle, animationStyle, colors }`
  - `coupleDetails?` (wedding-only structured fields)
    - `bride: { name, parents: { father, mother } }`
    - `groom: { name, parents: { father, mother } }`
  - `hostDetails?` (non-wedding structured fields)
    - `hostName: string`
  - `coverImage: { url, publicId } | null`
  - `music: { url, publicId } | null`
  - `gallery: []` (reserved for future image gallery)
  - `expiresAt: Date` (date + 48 hours)
  - `purgeAt: Date` (TTL deletion; defaults to 30 days after `expiresAt`)
  - `assetsPurgedAt: Date | null` (set by cleanup cron after Cloudinary deletion)
  - `status: "active" | "ended"`
  - `createdAt, updatedAt`
- `rsvps`
  - `eventId: ObjectId` (index)
  - `name, contact, attending, guestsCount, message, createdAt`
- `wishes`
  - `eventId: ObjectId` (index)
  - `name, message, createdAt`

Indexes are created by `POST /api/bootstrap` (protected by `CRON_SECRET`).

## Expiry + secure cleanup

- Each event expires after `date + 48 hours`:
  - public page shows an expired state
  - RSVP/wishes are disabled by the API
- Cleanup (recommended):
  - call `GET /api/cron/cleanup` with `Authorization: Bearer $CRON_SECRET`
  - deletes Cloudinary assets + removes RSVPs/wishes for expired events
  - keeps the ended event doc for a short grace window; TTL removes it later (`purgeAt`)

### Vercel Cron (recommended)

Create a Vercel Cron job to call:

- `GET /api/cron/cleanup` with `Authorization: Bearer $CRON_SECRET`

This expires due events even if nobody visits the link.
# invitation
