# Data Model: Task Management

## Task

Represents one user-managed task.

| Field | Type | Required | Default | Rules |
|-------|------|----------|---------|-------|
| `id` | String | Yes | Generated CUID | Stable identifier used by item routes; immutable |
| `title` | String | Yes | None | Trim surrounding whitespace; must not be empty after trimming |
| `completed` | Boolean | Yes | `false` | Only `true` or `false`; changed through the completion operation |
| `createdAt` | DateTime | Yes | Current time | Immutable creation timestamp used for newest-first ordering |

There are no relationships in the single-user v1 model.

## Validation Rules

- A create request must contain a string `title`.
- The title is trimmed before validation and persistence.
- A trimmed empty title is rejected without a database write.
- A completion update must contain a boolean `completed` value.
- Unknown fields are ignored or rejected consistently by the request validator; they must not change persisted fields.
- A missing task ID returns `404 TASK_NOT_FOUND` and does not mutate data.

## State Transitions

```text
                 set completed=true
      +------------------------------+
      |                              v
  incomplete --------------------> complete
      ^                              |
      +------------------------------+
                 set completed=false
```

Deletion is terminal for the task record. A deleted task cannot be completed,
listed, or deleted again as an existing resource.

## Query Ordering

Collection reads sort by `createdAt` descending and then `id` descending. This
places the newest task first and provides deterministic ordering when timestamps
are equal.

## Scope Exclusions

The v1 model does not include title editing, due dates, priorities, tags,
users, permissions, recurring schedules, or soft deletion metadata.
