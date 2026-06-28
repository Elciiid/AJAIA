# Walkthrough Video — Voiceover Script (~4 min)

A screen-recording script for the demo. `[ON SCREEN]` = what to show while you talk.
No camera needed — just screen + mic. Aim for a calm, steady pace.

---

### 0:00 — Intro (~20s)
`[ON SCREEN: the deployed app, login screen]`

> "Hi — this is a quick walkthrough of **Ajaia Docs**, a lightweight collaborative
> document editor I built for the assessment. It's a Google-Docs-inspired
> rich-text editor, and I deliberately went deep on two things: the editing
> experience and a real, server-enforced sharing model. It's a Next.js
> full-stack app, with Tiptap for editing, Prisma on Postgres, deployed on
> Vercel and Supabase."

### 0:20 — Sign in (~20s)
`[ON SCREEN: click the "Alice Owner" demo account]`

> "Auth is intentionally lightweight — you sign in with just an email, no
> password. The brief allows mocked auth, and this keeps the demo frictionless
> while making 'share by email' feel natural. I've seeded three demo accounts so
> the sharing flow is testable immediately."

### 0:40 — Dashboard (~25s)
`[ON SCREEN: the dashboard, point to both sections]`

> "Here's the dashboard. It cleanly separates documents you **own** from
> documents **shared with you** — each shared doc shows a Viewer or Editor badge,
> and owned docs show how many people they're shared with. I can create a new
> document, or import one."

### 1:05 — Editing (~45s)
`[ON SCREEN: open "Q3 Product Roadmap", use the toolbar]`

> "Opening a document gives you the editor. It's built on Tiptap, and supports
> the formatting you'd expect — bold, italic, underline, headings, bullet and
> numbered lists, quotes, undo and redo."
>
> `[type a bit, toggle some formatting]`
>
> "Everything **autosaves** as I type — you can see the status indicator go from
> 'Saving' to 'Saved'. The content is stored as structured JSON, not HTML, which
> keeps the document model clean. If I refresh, it's all still here."

### 1:50 — File import (~30s)
`[ON SCREEN: back to dashboard, click "Import file", pick a .md file]`

> "I can also import a file. I'll bring in a Markdown file — and it becomes a new,
> fully editable document with the headings, lists, and bold/italic preserved. It
> supports .txt, .md, and .docx up to 5 megabytes, and rejects anything else with
> a clear message."

### 2:20 — Sharing & access control (~60s)
`[ON SCREEN: open the roadmap, click Share]`

> "Now the part I gave the most care: sharing. As the owner I can share by email
> and pick a role — Viewer for read-only, or Editor. I can change or revoke
> access anytime."
>
> `[sign out, sign in as carol@ajaia.test, open the same doc]`
>
> "Let me sign in as Carol, who's a **Viewer**. The document opens read-only — the
> toolbar is disabled and there's a 'View only' badge. And this isn't just a UI
> trick: the access check is enforced on **every API request**. A viewer trying to
> edit gets a 403, a stranger gets a 403, and an anonymous request gets a 401.
> That authorization logic lives in pure, unit-tested functions, so the same
> policy applies on every endpoint."

### 3:20 — What I deprioritized (~25s)
`[ON SCREEN: the dashboard, or the architecture/cuts slide]`

> "A few deliberate cuts: no real-time multiplayer — I use autosave with
> last-write-wins. No passwords — lightweight email sessions instead. And no blob
> storage — imported files just become documents. With more time, the first thing
> I'd add is real-time presence with Yjs, plus API-level integration tests and
> export to PDF."

### 3:45 — How AI supported the work (~25s)
`[ON SCREEN: the AI workflow slide, or your editor]`

> "This was an AI-native build. AI sped me up most on scaffolding and on a good
> structural decision — pulling authorization into a pure, tested layer — and it
> drove a real browser to verify each role's behavior. But the judgment calls
> were mine: I pinned Prisma 6 over 7 to fit the timebox, and switched the
> component base when the default generated an incompatible API. And it caught a
> real bug — opening a doc fired a spurious autosave, which I fixed."

### 4:10 — Close (~10s)
`[ON SCREEN: the app, or the closing slide]`

> "That's Ajaia Docs — a focused, working slice that's built, tested, deployed,
> and honest about its edges. Thanks for watching."

---

**Recording tips**
- Have the three demo accounts and a sample `.md` file ready before you start.
- One take is fine; small stumbles are normal.
- If you'd rather present the slide deck instead of the live app, the same beats
  map 1:1 to the slides in `AjaiaDocs-Walkthrough.pptx` (the speaker notes on each
  slide are a condensed version of this script).
