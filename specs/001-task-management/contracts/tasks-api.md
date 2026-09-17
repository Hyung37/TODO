# Tasks API Contract

All endpoints return `Content-Type: application/json`, including errors.
The examples use illustrative IDs and timestamps.

## Shared Types

```ts
type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
```

## List Tasks

`GET /api/tasks`

### Success

- Status: `200 OK`
- Body:

```json
{
  "tasks": [
    {
      "id": "cm123new",
      "title": "Review notes",
      "completed": false,
      "createdAt": "2026-09-16T10:05:00.000Z"
    }
  ]
}
```

Tasks are ordered by newest `createdAt` first, then descending `id` for ties.
An empty collection returns `200` with `"tasks": []`.

### Failure

- Status: `500 Internal Server Error`
- Code: `TASK_LIST_FAILED`

## Create Task

`POST /api/tasks`

### Request

```json
{
  "title": "  Review notes  "
}
```

The server trims the title before validating and storing it.

### Success

- Status: `201 Created`
- Body:

```json
{
  "task": {
    "id": "cm123new",
    "title": "Review notes",
    "completed": false,
    "createdAt": "2026-09-16T10:05:00.000Z"
  }
}
```

### Failures

- Status: `400 Bad Request`, code `INVALID_TASK_TITLE` when `title` is missing,
  not a string, or empty after trimming.
- Status: `500 Internal Server Error`, code `TASK_CREATE_FAILED` for an
  unexpected persistence failure.

## Update Completion

`PATCH /api/tasks/{id}`

### Request

```json
{
  "completed": true
}
```

Only the completion state is mutable in v1.

### Success

- Status: `200 OK`
- Body:

```json
{
  "task": {
    "id": "cm123new",
    "title": "Review notes",
    "completed": true,
    "createdAt": "2026-09-16T10:05:00.000Z"
  }
}
```

### Failures

- Status: `400 Bad Request`, code `INVALID_COMPLETION` when `completed` is not
  a boolean.
- Status: `404 Not Found`, code `TASK_NOT_FOUND` when the ID does not exist.
- Status: `500 Internal Server Error`, code `TASK_UPDATE_FAILED` for an
  unexpected persistence failure.

## Delete Task

`DELETE /api/tasks/{id}`

### Success

- Status: `200 OK`
- Body:

```json
{
  "deleted": true,
  "id": "cm123new"
}
```

### Failures

- Status: `404 Not Found`, code `TASK_NOT_FOUND` when the ID does not exist.
- Status: `500 Internal Server Error`, code `TASK_DELETE_FAILED` for an
  unexpected persistence failure.
