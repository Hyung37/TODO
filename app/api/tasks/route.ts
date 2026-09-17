import { prisma } from "@/lib/prisma";
import {
  comparePriority,
  errorResponse,
  parseTaskPriority,
  parseTaskTitle,
  toTaskResponse,
} from "@/lib/task-api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const responses = tasks.map(toTaskResponse).sort(comparePriority);
    return Response.json({ tasks: responses });
  } catch {
    return errorResponse(500, "TASK_LIST_FAILED", "Unable to load tasks.");
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "INVALID_TASK_TITLE", "A valid title is required.");
  }

  const title = parseTaskTitle(payload);
  if (title === null) {
    return errorResponse(400, "INVALID_TASK_TITLE", "A valid title is required.");
  }

  const priority = parseTaskPriority(payload);
  if (priority === null) {
    return errorResponse(400, "INVALID_TASK_PRIORITY", "Priority must be LOW, MEDIUM, or HIGH.");
  }

  try {
    const task = await prisma.task.create({ data: { title, priority } });
    return Response.json({ task: toTaskResponse(task) }, { status: 201 });
  } catch {
    return errorResponse(500, "TASK_CREATE_FAILED", "Unable to create the task.");
  }
}
