# Backend Spec — "Reimplement It" Task Board

A coordination platform where maintainers post tasks to re-implement a reverted feature, developers submit a link to their PR, and maintainers leave feedback. **No authentication.** All Git work happens on GitHub; this backend only stores and coordinates tasks, submissions, and feedback.

---

## 0. Instructions for the coding agent

Read this before writing code:

1. **Inspect the existing template first.** A Node.js/Express/TypeScript server already exists. Reuse its conventions: app/router bootstrapping, error-handling middleware, env/config loading, logging, and `package.json` scripts. Do **not** scaffold a new project or replace existing setup.
2. **Match existing patterns.** If the template already structures code a certain way (controllers, routes, services), follow it. The structure in §3 is a fallback only.
3. **Use the existing persistence layer if there is one.** If the template has a DB/ORM configured, adapt the schema in §5 to it. If there is none, use the default in §5 (Prisma + SQLite).
4. **Stay in scope.** Build exactly the endpoints in §7. Do not add auth, GitHub API calls, test runners, or a frontend. See §13.
5. After implementing, run typecheck/build and the seed script, and confirm every endpoint in the acceptance checklist (§12) works.

---

## 1. Tech stack

- Node.js + Express + TypeScript (existing template)
- **Validation:** `zod` for all request bodies and query params
- **Persistence (default):** Prisma + SQLite (swap if the template already has a DB)
- **IDs:** UUID v4
- **CORS:** enabled for all origins (hackathon; a frontend will call this)

Add only dependencies not already present.

---

## 2. Core concepts

- **Task** — a challenge created by a maintainer. Holds the public challenge repository developers work from, developer-facing instructions, hints/resources, and optional private maintainer reference material. Created by anyone; no login.
- **Submission** — a developer's entry against a task: their name/handle plus a PR link to the challenge repo. Public.
- **AI review** — platform-generated review assistance for a submission. Summarizes strengths, concerns, and a suggested recommendation for the maintainer. Maintainer-facing.
- **Feedback** — maintainer's final review on a submission: status, optional score, and public feedback. Stored on the submission.

---

## 3. Suggested project structure (fallback only)

```
src/
  routes/
    tasks.routes.ts
    submissions.routes.ts
  controllers/
    tasks.controller.ts
    submissions.controller.ts
  services/
    tasks.service.ts
    submissions.service.ts
  schemas/
    task.schema.ts          # zod schemas
    submission.schema.ts
  middleware/
    errorHandler.ts
  lib/
    db.ts                   # Prisma client / data access
  app.ts                    # express app (reuse existing)
prisma/
  schema.prisma
  seed.ts
```

---

## 4. Authorization model

There is no authentication or authorization yet.

- Anyone can create tasks, list/view public task details, view submissions, and create submissions.
- Anyone can currently access maintainer/admin endpoints, including task edits, deletes, AI review output, and submission scoring.

This is intentional for the current MVP/backend exploration phase. Add authentication before exposing maintainer/admin routes in production.

---

## 5. Data models

Enums are validated at the zod layer and stored as strings (keeps SQLite/Prisma portable).

- `difficulty`: `"easy" | "medium" | "hard"`
- `task.status`: `"open" | "closed"` (default `"open"`)
- `submission.status`: `"submitted" | "approved" | "changes_requested" | "rejected"` (default `"submitted"`)

**Tags note:** SQLite/Prisma does not support native `String[]`. Store `tags` as a comma-separated string internally; the API **always accepts and returns `string[]`**. Do the (de)serialization in the service layer.

### Prisma schema (default)

```prisma
model Task {
  id                 String       @id @default(uuid())
  title              String
  description        String
  challengeRepoUrl   String
  baseBranch         String?
  projectUrl         String?
  instructions       String
  acceptanceCriteria String?
  hints              String?
  resources          String?
  privateSourceUrl   String?
  privateNotes       String?
  difficulty         String                       // "easy" | "medium" | "hard"
  tags               String       @default("")    // comma-separated; API exposes string[]
  status             String       @default("open") // "open" | "closed"
  submissions        Submission[]
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
}

model Submission {
  id                     String    @id @default(uuid())
  taskId                 String
  task                   Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  submitterName          String
  prUrl                  String
  notes                  String?
  status                 String    @default("submitted")
  score                  Int?
  feedbackText           String?
  reviewerNotes          String?
  aiReviewStatus         String    @default("not_requested")
  aiReviewSummary        String?
  aiReviewStrengths      String?
  aiReviewConcerns       String?
  aiReviewRecommendation String?
  aiReviewModel          String?
  aiReviewError          String?
  aiReviewGeneratedAt    DateTime?
  reviewedAt             DateTime?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}
```

Deleting a task cascades to its submissions.

---

## 6. API conventions

- Base path: `/api`
- JSON request/response only.
- **Success:** `200` (read/update), `201` (create), `204` (delete, no body).
- **Error shape (always):**
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Human-readable summary", "details": [ ] } }
  ```
  Codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `INTERNAL_ERROR` (500). `details` carries zod issues for 400s.
- A central error-handling middleware converts thrown errors / zod failures into this shape. Don't scatter try/catch response logic in controllers.
- `GET /api/health` → `200 { "status": "ok" }`.

---

## 7. Endpoints

### Tasks

#### `POST /api/tasks` — create a task (public)
Creates a task.

Request:
```json
{
  "title": "Re-implement rate limiting middleware",
  "description": "Restore request throttling behavior without referencing the original implementation.",
  "challengeRepoUrl": "https://github.com/osguild/challenge-project-rate-limit",
  "baseBranch": "main",
  "projectUrl": "https://github.com/org/project",
  "instructions": "Markdown instructions for the developer...",
  "acceptanceCriteria": "Expected behavior and test checklist...",
  "hints": "Optional hints...",
  "resources": "Optional resources...",
  "privateSourceUrl": "https://github.com/org/project/pull/482",
  "privateNotes": "Maintainer-only reference notes.",
  "difficulty": "medium",
  "tags": ["typescript", "express", "middleware"]
}
```
Response `201`:
```json
{
  "task": {
    "id": "uuid",
    "title": "Re-implement rate limiting middleware",
    "description": "Restore request throttling behavior without referencing the original implementation.",
    "challengeRepoUrl": "https://github.com/osguild/challenge-project-rate-limit",
    "baseBranch": "main",
    "projectUrl": "https://github.com/org/project",
    "instructions": "Markdown instructions for the developer...",
    "acceptanceCriteria": "Expected behavior and test checklist...",
    "hints": "Optional hints...",
    "resources": "Optional resources...",
    "difficulty": "medium",
    "tags": ["typescript", "express", "middleware"],
    "status": "open",
    "submissionCount": 0,
    "createdAt": "ISO",
    "updatedAt": "ISO"
  }
}
```
The response intentionally omits `privateSourceUrl` and `privateNotes`; use the manage detail endpoint to retrieve maintainer-only fields.

#### `GET /api/tasks` — list tasks (public)
Query params (all optional): `q` (search title+description), `difficulty`, `tag` (single tag match), `status`, `limit` (default 50), `offset` (default 0). Sort by `createdAt` desc.

Response `200`:
```json
{
  "tasks": [
    { "id": "uuid", "title": "...", "difficulty": "medium", "tags": ["..."],
      "status": "open", "submissionCount": 3, "createdAt": "ISO", "updatedAt": "ISO" }
  ],
  "total": 12
}
```
Never include `privateSourceUrl` or `privateNotes`. Long fields may be omitted from list items for brevity (full public task via GET by id).

#### `GET /api/tasks/:id` — task detail (public)
Returns the full task plus its submissions.
```json
{
  "task": { "id": "uuid", "...": "...", "submissionCount": 3 },
  "submissions": [
    { "id": "uuid", "submitterName": "octocat", "prUrl": "https://github.com/.../pull/9",
      "notes": null, "status": "approved", "feedbackText": "LGTM, clean impl.",
      "createdAt": "ISO", "updatedAt": "ISO" }
  ]
}
```
`404` if not found.

#### `GET /api/tasks/:id/manage` — task detail with maintainer fields
Returns the full public task plus `privateSourceUrl`, `privateNotes`, maintainer review notes, and AI review fields. Not auth-protected yet.

#### `PATCH /api/tasks/:id` — update task
Body: any subset of `title`, `description`, `challengeRepoUrl`, `baseBranch`, `projectUrl`, `instructions`, `acceptanceCriteria`, `hints`, `resources`, `privateSourceUrl`, `privateNotes`, `difficulty`, `tags`, `status`. Returns `200` with updated public task. Not auth-protected yet.

#### `DELETE /api/tasks/:id` — delete task
Cascades to submissions. Returns `204`. Not auth-protected yet.

### Submissions

#### `POST /api/tasks/:id/submissions` — submit a PR to the challenge repo (public)
Request:
```json
{ "submitterName": "octocat", "prUrl": "https://github.com/osguild/challenge-project-rate-limit/pull/9", "notes": "Used a token-bucket approach." }
```
Returns `201` with the created submission (`status: "submitted"`). The PR URL must be a GitHub pull request URL for the task's `challengeRepoUrl`. `404` if task not found.

#### `GET /api/tasks/:id/submissions` — list submissions for a task (public)
Returns `200 { "submissions": [ ... ] }`. (Same data also embedded in task detail.)

#### `PATCH /api/tasks/:id/submissions/:submissionId/ai-review` — save AI review output
Body: any subset of AI review fields. This endpoint stores platform-generated assistance; it does not decide the final submission outcome. Not auth-protected yet.
```json
{
  "aiReviewStatus": "completed",
  "aiReviewSummary": "The PR addresses the main behavior but misses one edge case.",
  "aiReviewStrengths": "Clear middleware structure and readable tests.",
  "aiReviewConcerns": "Burst refill behavior is not covered and may drift over time.",
  "aiReviewRecommendation": "manual_review",
  "aiReviewModel": "future-model-name"
}
```
Returns `200` with the manage-view submission, including AI review fields.

#### `PATCH /api/tasks/:id/submissions/:submissionId` — review/score a submission
Body:
```json
{ "status": "changes_requested", "score": 72, "feedbackText": "Please add tests for the burst case." }
```
Fields are optional but at least one required. Validate `submissionId` belongs to `:id` (else `404`). Returns `200` with updated public submission.

---

## 8. Validation rules (zod)

- `title`: string, 1–200 chars, required.
- `description`: string, 1–10000 chars, required.
- `challengeRepoUrl`: required GitHub repository URL for the prepared challenge fork/environment developers work from, e.g. `https://github.com/osguild/challenge-repo`.
- `baseBranch`: optional branch/ref name in the challenge repo, max 200 chars, no whitespace or Git ref control characters.
- `projectUrl`: optional original upstream GitHub repository URL, e.g. `https://github.com/owner/repo`.
- `instructions`: string, 1–10000 chars, required.
- `acceptanceCriteria`: optional string, max 5000 chars.
- `hints`: optional string, max 5000 chars.
- `resources`: optional string, max 5000 chars.
- `privateSourceUrl`: optional hidden GitHub pull request URL, e.g. `https://github.com/owner/repo/pull/123`; if `projectUrl` is supplied, it must belong to that same original repository.
- `privateNotes`: optional string, max 5000 chars.
- `difficulty`: enum `easy|medium|hard`, required on create.
- `tags`: array of strings, each 1–30 chars, max 10 tags; default `[]`.
- `task.status`: enum `open|closed`.
- `submitterName`: string, 1–100 chars, required.
- `prUrl`: required GitHub pull request URL. It must target the task's `challengeRepoUrl`.
- `notes`: optional string, max 2000 chars.
- `submission.status`: enum `submitted|approved|changes_requested|rejected`.
- `score`: optional integer, 0–100.
- `feedbackText`: optional string, max 5000 chars.
- `reviewerNotes`: optional maintainer-only string, max 5000 chars.
- `aiReviewStatus`: enum `not_requested|pending|completed|failed`.
- `aiReviewSummary`: optional string, max 5000 chars.
- `aiReviewStrengths`: optional string, max 5000 chars.
- `aiReviewConcerns`: optional string, max 5000 chars.
- `aiReviewRecommendation`: enum `approve|changes_requested|reject|manual_review`.
- `aiReviewModel`: optional string, max 100 chars.
- `aiReviewError`: optional string, max 2000 chars.

Task project/source fields and submission PR URLs are intentionally GitHub-specific because the workflow is built around GitHub repositories and pull requests.

---

## 9. Middleware & config

- `cors()` allowing all origins.
- `express.json()` body parsing with a sane limit (e.g. 1mb).
- Request logging (reuse template's; else `morgan` dev format).
- Central error handler (last middleware) producing the §6 error shape.
- Config via env (reuse template): `PORT`, `DATABASE_URL`. Provide `.env.example`.

---

## 10. Seed script

`prisma/seed.ts` (or equivalent) clears existing task/submission data for local resets. Real challenge tasks should be created through `POST /api/tasks` so the frontend exercises the actual maintainer flow.

---

## 11. package.json scripts

Ensure these exist (add if missing, don't clobber existing): `dev`, `build`, `start`, `seed`, and `prisma:migrate` / `prisma:generate` if Prisma is used.

---

## 12. Acceptance checklist (definition of done)

- [ ] Project builds and typechecks with no errors.
- [ ] `GET /api/health` returns ok.
- [ ] Public task responses never include `privateSourceUrl` or `privateNotes`.
- [ ] `GET /api/tasks/:id/manage` returns maintainer fields.
- [ ] Listing supports `q`, `difficulty`, `tag`, `status`, `limit`, `offset` and returns `submissionCount` + `total`.
- [ ] Task detail returns the task plus embedded submissions.
- [ ] PATCH/DELETE task and PATCH submission return `404` for missing task/submission correctly.
- [ ] Submitting a PR works and defaults to status `submitted`.
- [ ] Maintainer can set submission status + feedback, visible in public task detail.
- [ ] Maintainer can see AI review assistance in the manage task view without exposing it as public developer feedback.
- [ ] Maintainer can score a submission 0–100.
- [ ] Deleting a task removes its submissions (cascade).
- [ ] `tags` round-trips as `string[]` through the API despite string storage.
- [ ] Validation errors return the §6 error shape with zod `details`.
- [ ] Seed script runs and clears local task/submission data without creating fake challenge tasks.

---

## 13. Explicitly out of scope

Do **not** implement: user accounts / OAuth / sessions, any GitHub API integration (no fetching PR/fork state), automated test execution or scoring, file uploads, email/notifications, rate limiting, a frontend/UI, or fork/revert automation unless explicitly requested. The platform is currently a CRUD coordination layer only.
