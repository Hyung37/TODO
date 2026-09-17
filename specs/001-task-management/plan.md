# Implementation Plan: Task Management

**Branch**: `001-task-management` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-task-management/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

사용자가 할 일을 생성하고 조회하며 완료 상태를 전환하고 삭제할 수 있는
기능을 제공한다. Next.js App Router Route Handler를 REST API 경계로 사용하고,
Prisma ORM과 로컬 SQLite 파일에 `Task` 데이터를 저장한다. 화면은 이 API를
호출해 목록과 상태 변경 결과를 표시한다.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5, Node.js runtime supported by the existing Next.js 16.3.5 project

**Primary Dependencies**: Next.js 16.3.5 App Router, Prisma v7, `@prisma/client`, `@prisma/adapter-better-sqlite3`, `better-sqlite3`

**Storage**: SQLite file at `file:./dev.db`, accessed through the Prisma better-sqlite3 adapter and managed through Prisma migrations

**Testing**: Contract checks with HTTP requests, `npm run lint`, and `npm run build`

**Target Platform**: Local Next.js development server using the Node.js runtime

**Project Type**: Next.js web application with browser UI and REST API routes

**Performance Goals**: User-visible create and completion updates within 3 seconds; list operations sized for normal personal task usage

**Constraints**: No external service or separately managed database server; all API responses are JSON; application code must not use `any`

**Scale/Scope**: Single local user, one task entity, four task operations, and one primary task-management screen

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. App Router and TypeScript**: PASS. Route Handlers and UI code remain in the existing App Router TypeScript structure.
- **II. JSON API Contract**: PASS. Every success and error response is defined as JSON in the contracts.
- **III. Explicit Types**: PASS. The `Task` model, request payloads, and response envelopes are explicitly typed; no `any` is planned.
- **IV. Specification Before Implementation**: PASS. This plan follows the clarified feature spec and records the technical decisions here.
- **V. Verifiable Changes**: PASS. Quickstart scenarios, `npm run lint`, and `npm run build` provide focused validation.
- **Technical Constraints**: PASS. Prisma uses a local SQLite file and requires no external service or separate server.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-management/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── tasks/
│       ├── route.ts
│       └── [id]/
│           └── route.ts
├── page.tsx
└── globals.css
lib/
└── prisma.ts
prisma/
├── schema.prisma
└── migrations/
```

**Structure Decision**: Use the existing single Next.js application. Collection
operations live in `app/api/tasks/route.ts`; item operations live in
`app/api/tasks/[id]/route.ts`; Prisma access is centralized in `lib/prisma.ts`;
the schema and migrations live under `prisma/`. No separate backend or service
package is needed for the local single-user scope.

## Complexity Tracking

No constitution violations require justification. The design keeps the API,
database access, and UI in the existing single-project boundaries.

## Post-Design Constitution Check

- **I. App Router and TypeScript**: PASS. The selected source tree uses typed
  Route Handlers under `app/api` and keeps database access in `lib/prisma.ts`.
- **II. JSON API Contract**: PASS. [tasks-api.md](./contracts/tasks-api.md)
  defines JSON envelopes and status codes for every success and failure path.
- **III. Explicit Types**: PASS. [data-model.md](./data-model.md) and the
  contract define the Task and request/response shapes without `any`.
- **IV. Specification Before Implementation**: PASS. The data model and API
  contract implement only behavior present in the clarified spec.
- **V. Verifiable Changes**: PASS. [quickstart.md](./quickstart.md) provides
  CRUD, invalid-input, missing-ID, persistence, lint, and build checks.
- **Technical Constraints**: PASS. The plan uses a local `dev.db`, Prisma
  migrations, and no external service or separately managed database server.
