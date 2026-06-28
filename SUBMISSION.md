# Submission — Ajaia Docs

## Live product
- **Deployed URL:** _add your Vercel URL here_
- **Walkthrough video:** see [`VIDEO.md`](VIDEO.md)

## Test accounts (no password — sign in with the email)
| Email              | Role in demo data                                        |
| ------------------ | -------------------------------------------------------- |
| `alice@ajaia.test` | Owner of "Q3 Product Roadmap" (shared) & a private draft |
| `ben@ajaia.test`   | **Editor** on Alice's roadmap; owns "Weekly Sync Notes"  |
| `carol@ajaia.test` | **Viewer** on Alice's roadmap                            |

Sign in with any other email to create a fresh account.

## What's included
| Item | Location |
| ---- | -------- |
| Source code | this repository |
| Setup & run instructions | [`README.md`](README.md) |
| Architecture note | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| AI workflow note | [`docs/AI_WORKFLOW.md`](docs/AI_WORKFLOW.md) |
| Automated tests | `src/lib/access.test.ts`, `src/lib/content.test.ts` (18 cases) |
| Database schema + seed | `prisma/schema.prisma`, `prisma/seed.ts` |
| Screenshots | `docs/screenshots/` |
| This inventory | `SUBMISSION.md` |
| Walkthrough video link | [`VIDEO.md`](VIDEO.md) |

## What is working (verified end-to-end)
- ✅ Create, rename, edit, delete documents
- ✅ Rich-text editing: bold, italic, underline, H1/H2, bullet & numbered lists,
  quote, undo/redo
- ✅ Debounced autosave with save-status indicator; content/structure persists
  across refresh
- ✅ File import: `.txt`, `.md`, `.docx` → new editable document (headings,
  lists, bold/italic preserved); unsupported types & oversize files rejected
- ✅ Sharing by email with **Viewer** / **Editor** roles; change/remove access
- ✅ Owned vs. Shared separation on the dashboard, with role badges
- ✅ Access control enforced server-side: viewer/stranger edits → `403`,
  anonymous → `401`, non-owners can't see the collaborator list
- ✅ Lightweight email session auth (encrypted httpOnly cookie)
- ✅ Input validation (Zod) + consistent error responses
- ✅ `npm test` green (18 tests); `next build` and `tsc --noEmit` pass

## What is incomplete / deliberately deprioritized
- ⛔ **Real-time collaboration** (live cursors / simultaneous editing). Autosave
  uses last-write-wins.
- ⛔ **Passwords / OAuth** — intentionally lightweight email auth.
- ⛔ **Comments, version history, export, granular permissions** — stretch items.
- ⚠️ Tests cover authorization + import/validation logic as **unit** tests; there
  is no API-level integration test harness yet.

## What I'd build next with another 2–4 hours
1. Real-time presence and collaborative editing (Tiptap + Yjs).
2. API integration tests against a throwaway Postgres.
3. Export to Markdown/PDF and dashboard search.
4. Optimistic UI updates and soft-delete (trash/restore).

## Notes for reviewers
- The fastest way to see the sharing model is the **"Demo: how to see the
  sharing flow"** section in the README.
- Local dev works with **either** Docker (`docker compose up -d`) **or** a
  no-Docker portable Postgres (`npm run db:local`).
