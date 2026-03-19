# Paper Checker

Paper Checker is a role-based school application for evaluating handwritten exam papers with Gemini. Teachers upload a question paper PDF, an optional answer key PDF, and handwritten student answer sheets. The system stores detailed, question-wise reports in the database so teachers, school admins, and students can review the outcome later.

## Core roles

- `SUPER_ADMIN`: creates schools and platform-level users.
- `SCHOOL_ADMIN`: manages teachers and students within one school.
- `TEACHER`: creates checking sets, uploads question papers, and triggers evaluation.
- `STUDENT`: views their saved reports.

## Tech stack

- Next.js 15 App Router
- TypeScript
- Prisma + SQLite
- Cookie-based JWT auth
- Gemini API integration through `generateContent`

## Environment

Copy `.env.example` to `.env` and set:

```bash
DATABASE_URL="file:/app/data/paper-checker.db"
JWT_SECRET="replace-with-a-long-random-secret"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.0-flash"
```

## Setup

```bash
npm install
npm run prisma:generate
npm run db:init
npm run db:seed
npm run dev
```

If `prisma db push` works in your environment, you can use that instead of `npm run db:init`. In this workspace, Prisma client generation works, but the schema engine used by `db push` is unreliable, so a checked-in SQLite bootstrap script is provided at [`scripts/init-db.sql`](/Users/salescode/Documents/Paper%20Checker/scripts/init-db.sql).

## Docker

Build and run:

```bash
docker build -t paper-checker .
docker run -d \
  --name paper-checker \
  -p 8081:8081 \
  -e PORT="8081" \
  -e HOSTNAME="0.0.0.0" \
  -e JWT_SECRET="replace-with-a-long-random-secret" \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  -e GEMINI_MODEL="gemini-2.0-flash" \
  -e DATABASE_URL="file:/app/data/paper-checker.db" \
  -e SEED_DEMO_DATA="true" \
  -v paper_checker_data:/app/data \
  -v paper_checker_uploads:/app/uploads \
  paper-checker
```

Or with Compose:

```bash
docker compose up -d --build
```

Container behavior:

- Binds to `0.0.0.0` and serves on port `8081`
- Stores the SQLite database in `/app/data/paper-checker.db`
- Stores uploaded PDFs in `/app/uploads`
- Initializes the schema automatically on first boot
- Seeds demo users only if `SEED_DEMO_DATA=true`

For production, set a strong `JWT_SECRET`, use a real `GEMINI_API_KEY`, and usually keep `SEED_DEMO_DATA=false` after the first run.

## Seeded demo logins

All seeded users use password `password123`.

- `superadmin@paperchecker.local`
- `schooladmin@greenfield.local`
- `teacher@greenfield.local`
- `student@greenfield.local`

## Workflow

1. Super admin creates schools.
2. School admin creates teacher and student accounts.
3. Teacher creates a checking set with:
   - title, subject, class grade, section
   - total marks
   - question paper PDF
   - optional answer key PDF
   - custom evaluation instructions
4. Teacher opens the checking set and uploads the handwritten answer sheet PDF with student name and roll number.
5. Gemini receives:
   - default evaluation prompt
   - teacher custom instructions
   - question paper PDF
   - optional answer key PDF
   - handwritten answer sheet PDF
6. The app stores:
   - answer sheet path
   - submission status
   - detailed question-wise breakdown
   - marks awarded
   - strengths and improvement notes
   - raw Gemini response for audit/debugging

## Notes

- Uploaded files are written to `uploads/`.
- The default grading prompt is in [`lib/default-prompt.ts`](/Users/salescode/Documents/Paper%20Checker/lib/default-prompt.ts).
- Gemini calls happen in [`lib/gemini.ts`](/Users/salescode/Documents/Paper%20Checker/lib/gemini.ts).
- SQLite is used for local development so the project starts quickly. Swap Prisma datasource settings for Postgres/MySQL when deploying.
