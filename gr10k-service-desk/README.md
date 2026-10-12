# GR10K Service Desk

A shared customer service query tracker for GR10K: order number, date opened, who's
handling it, the reason (return / exchange / damage / lost / etc.), open or closed
status, and who closed it — plus a few extras (channel, priority, customer, notes,
an automatic "overdue" flag for anything open 5+ days, and a live reason breakdown).

Built with **Next.js** (App Router + TypeScript + Tailwind), **Supabase** (Postgres +
realtime sync, so everyone's browser updates live), deployed on **Vercel**. There's a
single shared passcode gate so it isn't open to the whole internet.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com), sign in, and click **New project**.
2. Pick a name (e.g. `gr10k-service-desk`), a region close to your team, and a
   database password (save it somewhere — you won't need it for this app, but
   Supabase asks for one).
3. Once the project has finished provisioning, open **SQL Editor** in the left
   sidebar, click **New query**, paste in the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql) from this project, and click **Run**.
   This creates the `tickets` table, sets up permissions, and turns on realtime sync.
4. Go to **Project Settings -> API**. You'll need two values from this page in a
   moment:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

## 2. Run it locally (optional, but a good sanity check)

You'll need [Node.js](https://nodejs.org) 18 or newer installed.

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in the three values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
APP_PASSWORD=pick-a-team-passcode
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter the passcode you picked,
and you should see the (empty) tracker. Add a test query to confirm it's writing to
Supabase — you can check it landed by looking at **Table Editor -> tickets** in your
Supabase dashboard.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: GR10K service desk"
```

Create a new empty repository on [github.com/new](https://github.com/new) (don't
initialize it with a README — you already have one), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/gr10k-service-desk.git
git branch -M main
git push -u origin main
```

(`.env.local` is already excluded via `.gitignore`, so your keys won't be committed.)

## 4. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you
   just pushed.
2. Vercel will detect it's a Next.js app automatically — no build settings to change.
3. Before deploying, open **Environment Variables** and add the same three values
   from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `APP_PASSWORD`
4. Click **Deploy**. After a minute or two you'll get a live URL
   (`https://gr10k-service-desk.vercel.app` or similar) — share that plus the
   passcode with your team.

Whenever you push more commits to `main`, Vercel redeploys automatically.

## How the pieces fit together

- **Supabase** holds the data (one `tickets` table) and pushes live updates to every
  open browser tab via its realtime feature — that's what makes it "shared": if a
  colleague closes a query, you see it update without refreshing.
- **Vercel** hosts the Next.js app itself and rebuilds it on every push to `main`.
- The passcode gate (`middleware.ts` + `/login`) is a simple shared-password check,
  not full user accounts — good enough to keep the tool off search engines and casual
  stumbling, but anyone with the passcode has full access. If you outgrow that later,
  swap in [Supabase Auth](https://supabase.com/docs/guides/auth) for real per-person
  logins — the `supabase/schema.sql` policies are written so that's a small change
  (see the comment above the policies).

## Customizing

- **Reason categories, sales channels, priority levels**: edit `lib/constants.ts`.
  If you add or rename a reason, update the `check` constraint in
  `supabase/schema.sql` too (run the updated `create table`/`alter table` in the SQL
  editor, or just relax the constraint if you'd rather not enforce a fixed list).
- **"Overdue" threshold** (currently 5 days open): `OVERDUE_DAYS` in
  `lib/constants.ts`.
- **Colors and fonts**: CSS variables in `app/globals.css` (see the `:root` and
  `prefers-color-scheme: dark` blocks) and the font choices in `app/layout.tsx`.

## Project structure

```
app/
  page.tsx            main tracker (stats, filters, table, modal)
  login/page.tsx       passcode screen
  api/login/route.ts   verifies the passcode, sets a session cookie
  api/logout/route.ts  clears the session cookie
  layout.tsx           fonts + global shell
  globals.css          color tokens (light + dark)
components/
  StatsRow.tsx          KPI tiles (open / closed / total / overdue)
  ReasonBreakdown.tsx   horizontal bar chart by reason
  Toolbar.tsx           search + status/reason/handler filters
  TicketTable.tsx       the query list (table on desktop, cards on mobile)
  TicketFormModal.tsx   add/edit form, including the open<->closed workflow
  ConfirmDialog.tsx     generic confirm dialog
lib/
  supabaseClient.ts     Supabase client setup
  types.ts              Ticket type
  constants.ts          reason/channel/priority lists + colors
  dates.ts              age/overdue calculations, formatting
supabase/
  schema.sql            run this once in the Supabase SQL editor
middleware.ts            passcode gate
```
