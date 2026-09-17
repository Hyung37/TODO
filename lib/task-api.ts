export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskResponse = {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  createdAt: string;
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export function errorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return Response.json({ error: { code, message } } satisfies ErrorResponse, {
    status,
  });
}

export function toTaskResponse(task: {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  createdAt: Date;
}): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    priority: task.priority as TaskPriority,
    createdAt: task.createdAt.toISOString(),
  };
}

export function parseTaskTitle(payload: unknown): string | null {
  if (!isRecord(payload) || typeof payload.title !== "string") {
    return null;
  }

  const title = payload.title.trim();
  return title.length > 0 ? title : null;
}

export function parseCompleted(payload: unknown): boolean | null {
  if (!isRecord(payload) || typeof payload.completed !== "boolean") {
    return null;
  }

  return payload.completed;
}

export function parseTaskPriority(payload: unknown): TaskPriority | null {
  if (!isRecord(payload) || payload.priority === undefined) {
    return "MEDIUM";
  }

  if (typeof payload.priority !== "string") {
    return null;
  }

  const normalized = payload.priority.toUpperCase();
  return (TASK_PRIORITIES as readonly string[]).includes(normalized)
    ? (normalized as TaskPriority)
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function comparePriority(a: { priority: TaskPriority }, b: { priority: TaskPriority }): number {
  return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
}
