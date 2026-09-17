# Quickstart: Task Management

This guide validates the feature locally without requiring an external service.

## Prerequisites

- Node.js compatible with the existing Next.js project
- npm
- A clean local environment with the project dependencies installed

## Install and initialize storage

From the repository root:

```powershell
npm install
npm install @prisma/client@7 @prisma/adapter-better-sqlite3 better-sqlite3
npm install --save-dev prisma@7
```

Create `.env` with:

```dotenv
DATABASE_URL="file:./dev.db"
```

After the Prisma schema is implemented, create and apply the initial migration:

```powershell
npx prisma migrate dev --name init
npx prisma generate
```

## Run the application

```powershell
npm run dev
```

Use `http://localhost:3000` for the browser UI. The API can be validated from a
second terminal.

## API validation scenarios

1. Start with an empty database and run `GET /api/tasks`. Expect `200` and
   `{ "tasks": [] }`.
2. Create a task with `POST /api/tasks` and body `{ "title": "Buy milk" }`.
   Expect `201`, a returned task, and `completed: false`.
3. Create a second task, then run `GET /api/tasks`. Expect the second task first.
4. Send `POST /api/tasks` with `{ "title": "   " }`. Expect `400` and
   `error.code` equal to `INVALID_TASK_TITLE`; no task is added.
5. Send `PATCH /api/tasks/{id}` with `{ "completed": true }`, then fetch the
   list. Expect the task to be complete. Send the same endpoint with
   `{ "completed": false }` and expect it to return to incomplete.
6. Send `PATCH` and `DELETE` for an unknown ID. Expect `404` with
   `error.code` equal to `TASK_NOT_FOUND` and no data mutation.
7. Send `DELETE /api/tasks/{id}` for an existing task. Expect `200` with
   `{ "deleted": true, "id": "..." }`, then confirm it is absent from the list.
8. Refresh the browser or repeat `GET /api/tasks`. Previously retained tasks
   must still be present.

## Quality gates

Run the repository gates after the feature is implemented:

```powershell
npm run lint
npm run build
```

Both commands must pass. The API checks above must also confirm that every
success and failure response is JSON and that no invalid request changes data.
