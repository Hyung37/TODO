---

description: "Executable task list for the Task Management feature"
---

# Tasks: Task Management

**Input**: Design documents from `/specs/001-task-management/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/tasks-api.md](./contracts/tasks-api.md), [quickstart.md](./quickstart.md)

**Tests**: No separate test framework tasks are included because TDD was not
requested in the feature specification. The final quickstart, lint, and build
checks remain required validation.

**Organization**: Tasks are grouped by user story so each story can be
implemented and validated as an incremental slice.

## Format

Every implementation task uses `- [ ] [TaskID] [P?] [Story?] Description`.
`[P]` appears only when the task can run independently in a different file.
User-story tasks include `[US1]` through `[US4]`; setup, foundational, and polish
tasks intentionally have no story label.

## Phase 1: Setup (Project Initialization)

**Purpose**: Add the selected Prisma dependencies and local configuration without
changing application behavior.

- [X] T001 Add Prisma v7, `@prisma/client`, `@prisma/adapter-better-sqlite3`, and `better-sqlite3` dependencies plus Prisma scripts in `package.json`.
- [X] T002 [P] Add the local database configuration example with `DATABASE_URL="file:./dev.db"` in `.env.example`.

**Checkpoint**: Dependencies and documented local database configuration are
available before schema work begins.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the persistence model, client boundary, and shared runtime
validation used by every user story.

**Critical**: Complete this phase before starting user-story implementation.

- [X] T003 Define the `Task` model with `id` as generated CUID, required `title`, `completed` defaulting to `false`, and immutable `createdAt` in `prisma/schema.prisma`.
- [X] T004 [P] Implement the Prisma v7 `better-sqlite3` adapter singleton with Node.js runtime compatibility in `lib/prisma.ts`.
- [X] T005 Generate and apply the initial SQLite migration from `prisma/schema.prisma` into `prisma/migrations/` using `npx prisma migrate dev --name init`.
- [X] T006 [P] Add explicit TypeScript task types, JSON error envelopes, title trimming/empty validation, boolean completion validation, and shared status-code helpers in `lib/task-api.ts` without using `any`.

**Checkpoint**: The database schema, migration, typed Prisma access, and shared
request/error rules are ready for all stories.

---

## Phase 3: User Story 1 - Add a Task (Priority: P1) 🎯 MVP

**Goal**: Let a user submit a required title and receive a persisted incomplete
task.

**Independent Test**: Send a valid `POST /api/tasks` request and confirm a `201`
JSON response contains the trimmed title, `completed: false`, an ID, and a
creation timestamp; send a blank title and confirm `400 INVALID_TASK_TITLE` with
no new record.

- [X] T007 [US1] Implement `POST /api/tasks` in `app/api/tasks/route.ts` using the shared validator and Prisma create operation; return the contract's `201` task envelope or JSON error envelope.
- [X] T008 [US1] Add the task creation form and submit/error states in `app/page.tsx`, sending the title to `POST /api/tasks` and displaying the returned task without accepting an empty trimmed title.

**Checkpoint**: A user can add a valid task, see it represented as incomplete,
and receive a clear error for an invalid title.

---

## Phase 4: User Story 2 - View the Task List (Priority: P1)

**Goal**: Let a user inspect all persisted tasks, with the newest task first,
and understand the empty-list state.

**Independent Test**: Seed multiple tasks with different creation times, call
`GET /api/tasks`, and confirm `200 { "tasks": [...] }` ordered by
`createdAt DESC, id DESC`; confirm an empty database returns `"tasks": []`.

- [X] T009 [US2] Implement `GET /api/tasks` in `app/api/tasks/route.ts` with `createdAt DESC, id DESC` ordering and the contract's JSON list/error envelopes.
- [X] T010 [US2] Load `GET /api/tasks` in `app/page.tsx`, render each task title and completion state in newest-first order, and render an explicit empty-list message when `tasks` is empty.

**Checkpoint**: The task list is persisted, newest-first, readable, and has a
clear empty state.

---

## Phase 5: User Story 3 - Toggle Completion (Priority: P2)

**Goal**: Let a user set an existing task to complete or incomplete and see the
saved state.

**Independent Test**: Send `PATCH /api/tasks/{id}` with `completed: true` and
then `completed: false`; confirm each `200` response and subsequent list read
reflect the requested boolean. Confirm a non-boolean payload returns `400`.

- [X] T011 [US3] Implement `PATCH /api/tasks/[id]` in `app/api/tasks/[id]/route.ts`, validating boolean `completed`, updating only that field, and returning `200`, `400 INVALID_COMPLETION`, `404 TASK_NOT_FOUND`, or JSON `500` errors per the contract.
- [X] T012 [US3] Add completion controls in `app/page.tsx` that send the current task ID and requested boolean to `PATCH /api/tasks/[id]`, update the displayed state on success, and preserve the previous state on failure.

**Checkpoint**: Completion can be toggled both directions and remains correct
after the list is reloaded.

---

## Phase 6: User Story 4 - Delete a Task (Priority: P2)

**Goal**: Let a user remove an existing task and receive a clear failure for an
unknown ID.

**Independent Test**: Send `DELETE /api/tasks/{id}` for an existing task and
confirm `200 { "deleted": true, "id": "..." }`, then confirm it is absent from
`GET /api/tasks`; send an unknown ID and confirm `404 TASK_NOT_FOUND`.

- [X] T013 [US4] Implement `DELETE /api/tasks/[id]` in `app/api/tasks/[id]/route.ts`, deleting the requested task and returning the contract's JSON success or `404 TASK_NOT_FOUND`/`500` error envelope.
- [X] T014 [US4] Add delete controls in `app/page.tsx` that call `DELETE /api/tasks/[id]`, remove the task only after a successful response, and preserve the list with an error message when deletion fails.

**Checkpoint**: Existing tasks can be deleted, missing tasks fail without data
mutation, and the UI reflects the result.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature, keep setup documentation runnable, and
verify the project constitution gates.

- [X] T015 [P] Document Prisma installation, migration, local SQLite setup, and task API usage in `README.md`.
- [X] T016 [P] Review `app/page.tsx`, `app/api/tasks/route.ts`, and `app/api/tasks/[id]/route.ts` to ensure every success and error path returns JSON and no `any` type is present.
- [X] T017 Run every CRUD, invalid-input, missing-ID, ordering, empty-list, and persistence scenario in `specs/001-task-management/quickstart.md` against the local development server.
- [X] T018 Run `npm run lint` and resolve all lint errors in `app/page.tsx`, `app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`, and `lib/task-api.ts`.
- [X] T019 Run `npm run build` and resolve all TypeScript or production-build errors in `app/page.tsx`, `app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`, and `lib/prisma.ts`.

**Checkpoint**: The feature meets the clarified specification and all
constitution quality gates pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001-T002 can start immediately; no application behavior depends on them yet.
- **Foundational (Phase 2)**: T003-T006 depend on setup; this phase blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on T003-T006 and is the MVP slice.
- **User Story 2 (Phase 4)**: Depends on T003-T010 because it extends the collection route and page created for US1.
- **User Story 3 (Phase 5)**: Depends on T003-T006 and the task display from T010.
- **User Story 4 (Phase 6)**: Depends on T003-T006 and the task display from T010.
- **Polish (Phase 7)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on another user story.
- **US2 (P1)**: Uses the same collection route and page as US1, so it follows US1's initial shell while remaining independently testable through `GET /api/tasks`.
- **US3 (P2)**: Can begin after Foundational; its UI integrates with the list from US2.
- **US4 (P2)**: Can begin after Foundational; its UI integrates with the list from US2.
- **US3 and US4**: Can proceed in parallel after T010 because they modify separate route methods but share page integration work that should be coordinated.

### Parallel Opportunities

- T002 can run in parallel with T001.
- T004 and T006 can run in parallel with T003; T005 waits for T003.
- After Foundational, the API portions of US3 and US4 (T011 and T013) can run in parallel.
- T015 and T016 can run in parallel after the feature code exists.
- T018 and T019 can run in parallel after implementation changes stabilize, while T017 needs the running app.

---

## Implementation Strategy

### MVP First

1. Complete T001-T006 to establish Prisma and SQLite.
2. Complete T007-T008 for User Story 1.
3. Complete T009-T010 so the MVP can display persisted tasks in newest-first order.
4. Run the US1/US2 independent checks before adding completion or deletion.

### Incremental Delivery

1. Deliver add and list as the MVP.
2. Add completion toggling and validate both boolean directions.
3. Add deletion and missing-ID handling.
4. Run quickstart, lint, and build before considering the feature complete.

### Task Counts

- Setup: 2 tasks
- Foundational: 4 tasks
- US1: 2 tasks
- US2: 2 tasks
- US3: 2 tasks
- US4: 2 tasks
- Polish: 5 tasks
- **Total: 19 tasks**

## Notes

- Separate automated test tasks are intentionally omitted because tests were not
  explicitly requested; quickstart HTTP checks are still mandatory.
- Every task includes a concrete file path and follows the required checkbox,
  sequential ID, optional parallel marker, and user-story label format.
