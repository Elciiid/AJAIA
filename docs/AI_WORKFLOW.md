# AI-Native Workflow Note

This project was built in an AI-native workflow using **Claude Code** (agentic
coding in the terminal) as the primary tool. The goal below is to show *how* AI
was used with judgment — not volume for its own sake.

## Tools used

- **Claude Code (Anthropic)** — primary driver: scaffolding, writing components
  and API routes, running the dev server, and driving a real browser to verify
  flows end-to-end.
- **shadcn/ui generator** — AI-assisted component generation for the design
  system (buttons, dialogs, selects, etc.).
- **Prisma** schema/migration tooling.

## Where AI materially sped things up

1. **Boilerplate and wiring.** The repetitive but error-prone scaffolding — REST
   route handlers with consistent Zod validation and error envelopes, the Prisma
   schema, the client `fetch` wrapper, shadcn component setup — was generated
   quickly and consistently, freeing time for the parts that needed judgment.
2. **A clean separation I might have skipped under time pressure.** Pulling
   authorization into pure, dependency-free functions (`lib/access.ts`) and
   unit-testing the full role matrix was an AI suggestion I adopted because it
   made the security-critical logic testable without a database.
3. **End-to-end verification.** Rather than eyeballing, AI drove a headless
   browser: logging in as each seeded user and asserting that a viewer's `PATCH`
   returns `403`, a stranger gets `403`, and an anonymous request gets `401`. It
   also exercised the `.md` import and confirmed the resulting document contained
   a heading, paragraph, bullet list, ordered list, and bold/italic marks.

## What AI output I changed or rejected

- **Prisma version.** Tooling defaulted to **Prisma 7**, which now requires
  driver adapters and a `prisma.config.ts`. I rejected that path for the timebox
  and pinned **Prisma 6**, which keeps the schema-based connection model and
  needed zero code changes.
- **shadcn preset.** The default generated **Base UI** components (a `render`-prop
  API). I rejected that and re-initialized with the **Radix** base so the
  component APIs were conventional (`asChild`, `onValueChange`) and easier to
  maintain — then re-applied my custom theme.
- **A real bug AI verification caught.** Loading a document fired Tiptap's
  `onUpdate`, which scheduled a spurious autosave and showed a misleading
  "Editing…" status on open. Fix: `setContent(content, { emitUpdate: false })`.
  This was found by reading the accessibility snapshot after load, not by
  guessing.
- **Infrastructure reality.** Docker Desktop wouldn't start (the machine had no
  WSL2 distro). Instead of burning the timebox, I added a no-Docker portable
  Postgres fallback (`npm run db:local`) so the app stays fully runnable for any
  reviewer, and kept Docker as the documented primary path.

## How I verified correctness, UX, and reliability

- **Correctness:** `npm test` (18 Vitest cases) covers the access-control matrix
  and the import/validation logic. `tsc --noEmit` and a production `next build`
  both pass.
- **Access logic:** manually driven through the API as owner / editor / viewer /
  stranger / anonymous, asserting the exact status codes.
- **UX quality:** drove the real UI (login → dashboard → editor → share dialog),
  checked the owned/shared split, role badges, autosave-status transitions, and
  read-only mode for viewers. Captured screenshots of the login, editor, and
  share dialog.
- **Reliability:** validated inputs with Zod, returned consistent error JSON,
  enforced the 5 MB / file-type limits on upload, and confirmed persistence by
  reloading after edits.

## Honest assessment

AI made me materially faster on breadth (scaffolding, docs, verification
scripting) and helped enforce a good structural decision (pure, tested auth).
The judgment calls — what to cut, which library versions to pin, how to model
sharing, and how to verify security — were mine, informed by reading what the
tools produced rather than trusting it blindly.
