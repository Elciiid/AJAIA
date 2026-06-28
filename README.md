# Ajaia Docs — a lightweight collaborative document editor

A Google-Docs-inspired rich-text editor where users create, format, import, and
**share** documents. Built for the Ajaia Full Stack Product Engineer assessment.

> **Live demo:** https://ajaia-three.vercel.app
> **Demo accounts:** `alice@ajaia.test`, `ben@ajaia.test`, `carol@ajaia.test`
> (sign in with any of these — no password — to see the sharing flow immediately).

---

## What it does

- **Create / rename / edit / delete** documents in the browser.
- **Rich-text editing** (Tiptap): bold, italic, underline, H1/H2, bullet &
  numbered lists, block quotes, undo/redo. Content autosaves as you type.
- **File import**: upload a `.txt`, `.md`, or `.docx` file (≤ 5 MB) to turn it
  into a new editable document, preserving headings, lists, and bold/italic.
- **Sharing**: a document owner shares with other users by email and assigns a
  role — **Viewer** (read-only) or **Editor** (can edit). The dashboard clearly
  separates **Owned by you** from **Shared with you**, with role badges.
- **Persistence**: documents, content, and shares are stored in Postgres and
  survive refresh. Access is re-checked on every request.
- **Lightweight auth**: enter an email to sign in (a session cookie is set; the
  account is created on first use). No passwords — chosen deliberately to keep
  scope on the editor and sharing. See the architecture note for why.

## Tech stack

| Layer        | Choice                                                       |
| ------------ | ------------------------------------------------------------ |
| Framework    | Next.js 16 (App Router) + TypeScript                         |
| UI           | Tailwind CSS v4, shadcn/ui (Radix), framer-motion           |
| Editor       | Tiptap 3 (ProseMirror)                                       |
| Backend      | Next.js Route Handlers (REST)                                |
| Auth         | `iron-session` (encrypted cookie)                            |
| Database     | Postgres via Prisma 6 (local Docker / Supabase in prod)      |
| Validation   | Zod                                                          |
| Tests        | Vitest                                                       |
| Hosting      | Vercel + Supabase Postgres                                   |

---

## Run it locally

### Prerequisites
- Node.js 20+ (built on Node 24)
- A Postgres database. Two options below — **pick one**.

### 1. Clone & install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
The defaults already point at a local Postgres on `localhost:5432`. Set a real
`SESSION_SECRET` (any random string of 32+ characters).

### 3. Start a Postgres database — pick ONE

**Option A — Docker (recommended):**
```bash
docker compose up -d
```

**Option B — no Docker** (self-contained, downloads a portable Postgres; needs
no admin rights). Run it in a separate terminal and leave it running:
```bash
npm run db:local
```

> Both options expose `postgresql://postgres:postgres@localhost:5432/ajaia_docs`,
> which matches `.env.example`.

### 4. Apply schema & seed demo data
```bash
npm run db:migrate   # creates tables
npm run db:seed      # seeds 3 demo users + sample shared documents
```

### 5. Start the app
```bash
npm run dev
```
Open http://localhost:3000 and sign in with `alice@ajaia.test` (or click a demo
account button).

### Run the tests
```bash
npm test
```

---

## Demo: how to see the sharing flow

1. Sign in as **alice@ajaia.test**. You'll see two owned documents (one shared,
   one private) and one document shared with you by Ben.
2. Open **"Q3 Product Roadmap"** → click **Share**. Alice has shared it with Ben
   (Editor) and Carol (Viewer).
3. Sign out, sign in as **carol@ajaia.test** → the roadmap appears under
   **Shared with you** with a **Viewer** badge. Open it: the toolbar is disabled
   and a **View only** badge is shown — editing is blocked at the API too.
4. Sign in as **ben@ajaia.test** → same document is editable (Editor role).

---

## Supported file types (import)

`.txt`, `.md` / `.markdown`, `.docx`. Max 5 MB. Other types are rejected with a
clear message. `.txt` becomes paragraphs; `.md` and `.docx` are converted to
rich text (headings, lists, bold/italic preserved). Uploaded files are parsed
and **not** stored as blobs — the content becomes a normal editable document.

---

## Deployment (Vercel + Supabase)

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full rationale. Short
version:

1. Create a free **Supabase** project. From _Project Settings → Database_, copy:
   - **Pooled** connection string (port `6543`) → `DATABASE_URL`, and append
     `?pgbouncer=true&schema=ajaia_docs`
   - **Direct** connection string (port `5432`) → `DIRECT_URL`, and append
     `?schema=ajaia_docs`
   > The app lives in a dedicated **`ajaia_docs`** schema so it never collides
   > with anything else in the project's `public` schema. Keep the `schema=`
   > param on both URLs.
2. Import the repo into **Vercel**. Set env vars: `DATABASE_URL`, `DIRECT_URL`,
   and a strong `SESSION_SECRET` (32+ chars).
3. Apply the schema once from your machine (pointing `.env` at the project):
   `npm run db:migrate` then `npm run db:seed`. The app lives in the
   `ajaia_docs` schema. Build Command on Vercel is `npm run vercel-build`
   (`prisma generate && next build` — it does **not** touch the DB, so the build
   never depends on DB connectivity).

---

## Project layout

```
prisma/
  schema.prisma         # User, Document, Share models
  seed.ts               # demo users + sample shared docs
src/
  app/
    api/                # REST route handlers (auth, documents, shares, upload)
    doc/[id]/page.tsx   # editor route (auth-guarded)
    page.tsx            # login screen OR dashboard
  components/
    editor/             # Tiptap editor + toolbar
    *.tsx               # dashboard, document card, share dialog, top bar, login
  lib/
    access.ts           # pure authorization logic (unit-tested)
    session.ts          # iron-session helpers
    prisma.ts           # Prisma client singleton
    tiptap.ts           # file-content -> Tiptap JSON conversion
    validation.ts       # Zod schemas
    *.test.ts           # Vitest tests
```

See [`docs/AI_WORKFLOW.md`](docs/AI_WORKFLOW.md) for how AI tools were used, and
[`SUBMISSION.md`](SUBMISSION.md) for what's complete vs. deferred.
