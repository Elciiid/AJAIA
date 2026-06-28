# Architecture & Decisions

A short note on what I prioritized, why, and the tradeoffs I made under the
timebox.

## Guiding principle

The prompt rewards **depth in a few areas over shallow coverage everywhere**. I
treated the document editing experience and the sharing/access-control model as
the two areas worth real depth, and deliberately kept everything else minimal.

## Stack rationale

- **Next.js (App Router) full-stack** — one codebase, one deploy. Route handlers
  give a clean REST surface next to the React UI, which is the fastest path to a
  testable, deployable product in the timebox.
- **Tiptap (ProseMirror)** for editing — a mature, schema-based rich-text engine.
  Storing the document as ProseMirror **JSON** (not HTML) keeps structure
  unambiguous, makes server-side validation trivial (`root.type === "doc"`), and
  lets the same extension set drive both the editor and file-import conversion.
- **Postgres + Prisma** — relational data (users, documents, shares with a
  unique `(documentId, userId)` constraint) maps naturally to SQL. Prisma gives
  type-safe queries and migrations.
- **iron-session** for auth — encrypted stateless cookie, no session table, no
  third-party auth service to configure. Right-sized for "lightweight auth."
- **shadcn/ui + framer-motion** — accessible Radix primitives I can own and
  restyle, plus restrained motion for a polished, non-templated feel.

## Data model

```
User (id, email unique, name)
Document (id, title, content: Json, ownerId -> User, timestamps)
Share (id, documentId -> Document, userId -> User, role: VIEWER|EDITOR,
       unique(documentId, userId))
```

`onDelete: Cascade` on `Document.owner` and on both `Share` relations means
deleting a user or document cleans up dependent rows automatically.

## Access control — the part I gave the most care

Authorization lives in [`src/lib/access.ts`](../src/lib/access.ts) as **pure
functions** (`getAccessLevel`, `canView`, `canEdit`, `canManage`) that take a
document's `ownerId` + `shares` and a userId. Keeping them dependency-free means:

- the rules are unit-tested exhaustively (owner / editor / viewer / stranger /
  anonymous) without a database, and
- every route loads the rows and delegates the decision to the same functions,
  so the policy can't drift between endpoints.

The rules:

| Action                      | Owner | Editor | Viewer | Other |
| --------------------------- | :---: | :----: | :----: | :---: |
| View document               |  ✅   |   ✅   |   ✅   |  ❌   |
| Edit title / content        |  ✅   |   ✅   |   ❌   |  ❌   |
| Manage sharing, delete, rename collaborators list |  ✅   |   ❌   |   ❌   |  ❌   |

Non-owners never receive the collaborator list in the API response, and edit
attempts return `403` even if the UI is bypassed. (Verified manually by driving
the API as each role — viewer/stranger edits return 403, anonymous returns 401.)

## Autosave

The editor debounces changes (~700 ms) and `PATCH`es title + content together.
A save-status indicator shows Editing / Saving / Saved / failed. Loading a
document uses `emitUpdate: false` so opening a doc never triggers a spurious
save. Concurrency is **last-write-wins** — acceptable for this scope and called
out below.

## File import

Upload → parse → create a normal document. `.txt` → paragraphs; `.md` (via
`marked`) and `.docx` (via `mammoth`) → HTML → Tiptap JSON using the **same**
extension set as the editor, so imported content always renders correctly. Files
are validated by extension and size (≤ 5 MB) and then discarded — no blob
storage needed, which keeps the app serverless-friendly on Vercel.

## Local vs. production database

- **Local:** Postgres via Docker Compose (recommended), or a no-Docker
  `npm run db:local` fallback using a self-contained portable Postgres. Both
  expose the same connection string as `.env.example`.
- **Production:** Supabase Postgres. Prisma uses the **pooled** URL at runtime
  (`DATABASE_URL`, pgBouncer) and the **direct** URL for migrations
  (`DIRECT_URL`) — the standard serverless pattern that avoids exhausting
  connections from Vercel's function instances.

## Notable tradeoffs / things I deliberately did NOT build

- **Real-time multiplayer** (CRDT/OT). Out of scope for the timebox; autosave +
  last-write-wins is the pragmatic substitute. This is the first thing I'd add
  next (Tiptap has a Yjs collaboration extension).
- **Passwords / OAuth.** The prompt explicitly allows mocked/lightweight auth.
  Email-only sign-in keeps the demo frictionless and makes "share by email"
  natural. The session cookie is encrypted and httpOnly.
- **Blob storage for attachments.** I chose the "import file → document" behavior
  instead, so no storage bucket is required.
- **Comments, version history, granular roles beyond Viewer/Editor.** Listed as
  stretch in the prompt; skipped to protect core depth.

## Notable upgrades I had to navigate (honest engineering notes)

- **Prisma 7** had just changed to require driver adapters + `prisma.config.ts`.
  I pinned **Prisma 6** to keep the well-understood schema-based connection model
  and stay within the timebox.
- shadcn's current default preset generates **Base UI** components (a `render`
  prop API). I re-initialized with the **Radix** base so the component APIs
  (`asChild`, `onValueChange`) matched conventional usage and stayed maintainable.

## What I'd do with another 2–4 hours

1. Real-time presence + collaborative cursors (Tiptap + Yjs).
2. An integration test layer hitting the API routes against a throwaway Postgres
   (the access matrix is already unit-tested; this would cover wiring).
3. Export to Markdown/PDF and a document search box on the dashboard.
4. Optimistic dashboard updates and a trash/restore instead of hard delete.
