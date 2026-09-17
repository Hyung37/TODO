import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  parseCompleted,
  toTaskResponse,
} from "@/lib/task-api";

export const runtime = "nodejs";

type TaskRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: TaskRouteContext) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "INVALID_COMPLETION", "A boolean completion value is required.");
  }

  const completed = parseCompleted(payload);
  if (completed === null) {
    return errorResponse(400, "INVALID_COMPLETION", "A boolean completion value is required.");
  }

  const { id } = await context.params;

  try {
    const task = await prisma.task.update({
      where: { id },
      data: { completed },
    });

    return Response.json({ task: toTaskResponse(task) });
  } catch {
    const exists = await prisma.task.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return errorResponse(404, "TASK_NOT_FOUND", "Task not found.");
    }

    return errorResponse(500, "TASK_UPDATE_FAILED", "Unable to update the task.");
  }
}

export async function DELETE(_request: Request, context: TaskRouteContext) {
  const { id } = await context.params;

  try {
    await prisma.task.delete({ where: { id } });
    return Response.json({ deleted: true, id });
  } catch {
    const exists = await prisma.task.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return errorResponse(404, "TASK_NOT_FOUND", "Task not found.");
    }

    return errorResponse(500, "TASK_DELETE_FAILED", "Unable to delete the task.");
  }
}
