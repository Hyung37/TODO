# Research: Task Management

## Prisma Client and runtime

- **Decision**: Use Prisma v7 with a singleton client in `lib/prisma.ts`, backed by the `better-sqlite3` adapter. Route Handlers run on the Node.js runtime.
- **Rationale**: The local SQLite driver is a Node.js concern, and a shared client avoids creating a new database client for every request or during development hot reloads.
- **Alternatives considered**: Request-scoped clients risk resource churn; an Edge runtime is not appropriate for the local native SQLite adapter.

## SQLite storage and migrations

- **Decision**: Use `DATABASE_URL="file:./dev.db"` and commit Prisma migration files. Apply migrations explicitly during setup rather than on application startup.
- **Rationale**: A file database meets the local, single-user constraint while migrations make schema changes reproducible and reviewable.
- **Alternatives considered**: `prisma db push` is useful for experiments but does not preserve migration history; a hosted SQLite service would violate the no-external-service constraint.

## Task model and ordering

- **Decision**: Model `Task` with a string CUID, required `title`, `completed` defaulting to `false`, and `createdAt` defaulting to the current time. List tasks by `createdAt DESC, id DESC`.
- **Rationale**: The timestamp directly expresses newest-first ordering, while the ID tie-breaker keeps equal-timestamp results deterministic. A string ID is suitable for route parameters without exposing a sequential counter.
- **Alternatives considered**: An autoincrement integer is simpler but exposes sequential identifiers; sorting only by timestamp is nondeterministic for ties.

## API response and error contract

- **Decision**: Return JSON for every response. Use resource envelopes for success and an `{ "error": { "code": "...", "message": "..." } }` envelope for errors. Use `200` for JSON DELETE success, `201` for creation, `400` for invalid input, `404` for missing tasks, and `500` for unexpected failures.
- **Rationale**: Stable envelopes let the browser distinguish outcomes without parsing presentation text and satisfy the project constitution.
- **Alternatives considered**: Plain text errors violate the JSON-only rule; `204 No Content` would make DELETE the only endpoint without a JSON body.

## Runtime input validation

- **Decision**: Treat parsed request JSON as `unknown`, validate fields explicitly, trim titles before checking for emptiness, and reject invalid input before database calls. Restrict PATCH to a boolean `completed` field.
- **Rationale**: TypeScript annotations do not validate runtime JSON. Explicit guards satisfy the `any` prohibition and keep user input errors distinct from persistence failures.
- **Alternatives considered**: Type assertions are unsafe; Zod could provide reusable schemas but adds a dependency that is not necessary for this small contract.

## Missing task behavior

- **Decision**: Return `404 TASK_NOT_FOUND` without changing data when a PATCH or DELETE targets a missing ID. Handle Prisma record-not-found errors as well as precondition checks.
- **Rationale**: This directly satisfies the feature's negative scenarios and covers a task being removed between a lookup and a mutation.
- **Alternatives considered**: Treating DELETE of a missing task as success is possible for idempotent APIs but conflicts with the specified failure notification.
