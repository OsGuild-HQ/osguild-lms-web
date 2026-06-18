# OSGuild LMS Web Backend

Backend API for a coding challenge platform where maintainers publish prepared GitHub challenge forks, developers submit PRs against those forks, and maintainers review submissions on the platform.

The app does not run code or edit GitHub repos yet. Developers write code outside the app, create a PR against the maintainer's challenge fork, then submit that PR URL here.

## What It Does

- Maintainers create challenge tasks with a public `challengeRepoUrl`.
- Developers browse tasks and submit GitHub PR links.
- Submitted PRs must target the task's challenge repository.
- Maintainer screens are separate from public task views, but they are not auth-protected yet.
- Maintainer fields, like the source PR and notes, are hidden from public task views.
- AI review output can be stored for maintainers to inspect before giving final score and feedback.

## Stack

- Node.js
- Express
- TypeScript
- Prisma
- SQLite
- Zod validation

## Setup

Install dependencies:

```bash
npm install
```

Create your local env file:

```bash
cp .env.example .env
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Apply the database schema:

```bash
npx prisma db push
```

Or create a migration instead:

```bash
npm run prisma:migrate -- --name init
```

Start the dev server:

```bash
npm run dev
```

Default API URL:

```txt
http://localhost:3000
```

Health check:

```txt
GET /api/health
```

## Useful Commands

```bash
npm run dev              # Start local dev server
npm run build            # Compile TypeScript
npm run typecheck        # Type-check without emitting files
npm run seed             # Clear local task/submission data
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Create/apply Prisma migration
```

## Core Workflow

1. Maintainer prepares a challenge fork on GitHub.
2. Maintainer creates a task in this API with `challengeRepoUrl`, instructions, hints, resources, and optional private source/reference notes.
3. Developer opens the task, works in GitHub, and creates a PR against the challenge fork.
4. Developer submits the PR URL to the platform.
5. Optional AI review output is saved for the maintainer.
6. Maintainer reviews, scores, and gives feedback.

## Main API Routes

Public:

```txt
GET  /api/tasks
GET  /api/tasks/:id
POST /api/tasks
POST /api/tasks/:id/submissions
GET  /api/tasks/:id/submissions
```

Maintainer/admin routes:

```txt
GET    /api/tasks/:id/manage
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/submissions/:submissionId
PATCH  /api/tasks/:id/submissions/:submissionId/ai-review
```

These routes are not protected yet. Add authentication before exposing them in production.

## Task Shape

Important task fields:

- `challengeRepoUrl`: public GitHub repo developers work from.
- `baseBranch`: optional starter branch/ref.
- `projectUrl`: optional original upstream repo.
- `instructions`: public developer instructions.
- `acceptanceCriteria`: public grading checklist.
- `hints`: public hints.
- `resources`: public resources.
- `privateSourceUrl`: hidden source PR/reference for maintainers.
- `privateNotes`: hidden maintainer notes.

Public task responses never include `privateSourceUrl` or `privateNotes`.

## Submission Review

Developers submit:

- `submitterName`
- `prUrl`
- optional `notes`

Maintainers can set:

- `status`: `submitted`, `approved`, `changes_requested`, or `rejected`
- `score`: `0` to `100`
- `feedbackText`
- private `reviewerNotes`

AI review fields are maintainer-facing:

- `aiReviewStatus`
- `aiReviewSummary`
- `aiReviewStrengths`
- `aiReviewConcerns`
- `aiReviewRecommendation`
- `aiReviewModel`
- `aiReviewError`

## Not Implemented Yet

- Frontend UI
- User accounts or OAuth
- Authorization for maintainer/admin routes
- GitHub API integration
- Automatic fork/revert creation
- Actual AI review generation
- Test execution or scoring automation

The backend currently stores the data and supports the workflow. GitHub work and AI review generation happen outside the app for now.
