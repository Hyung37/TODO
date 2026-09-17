"use client";

import { FormEvent, useEffect, useState } from "react";

type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  createdAt: string;
};

type ErrorResponse = {
  error?: { message?: string };
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks");
      const body = (await response.json()) as { tasks?: Task[] } & ErrorResponse;
      if (!response.ok || !body.tasks) {
        throw new Error(body.error?.message ?? "할 일을 불러오지 못했습니다.");
      }
      setTasks(body.tasks);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "할 일을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setMessage("할 일 제목을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, priority }),
      });
      const body = (await response.json()) as { task?: Task } & ErrorResponse;
      if (!response.ok || !body.task) {
        throw new Error(body.error?.message ?? "할 일을 추가하지 못했습니다.");
      }
      setTasks((currentTasks) =>
        [body.task as Task, ...currentTasks].sort(
          (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
        ),
      );
      setTitle("");
      setMessage("할 일을 추가했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "할 일을 추가하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleTask(task: Task) {
    setBusyTaskId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const body = (await response.json()) as { task?: Task } & ErrorResponse;
      if (!response.ok || !body.task) {
        throw new Error(body.error?.message ?? "상태를 변경하지 못했습니다.");
      }
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? (body.task as Task) : currentTask,
        ),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "상태를 변경하지 못했습니다.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function deleteTask(task: Task) {
    setBusyTaskId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      const body = (await response.json()) as { deleted?: boolean } & ErrorResponse;
      if (!response.ok || !body.deleted) {
        throw new Error(body.error?.message ?? "할 일을 삭제하지 못했습니다.");
      }
      setTasks((currentTasks) => currentTasks.filter((currentTask) => currentTask.id !== task.id));
      setMessage("할 일을 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "할 일을 삭제하지 못했습니다.");
    } finally {
      setBusyTaskId(null);
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="page-shell">
      <section className="todo-app" aria-labelledby="page-title">
        <header className="hero">
          <p className="eyebrow">DAILY / FOCUS</p>
          <h1 id="page-title">오늘의 할 일</h1>
          <p className="subtitle">작은 약속을 적고, 하나씩 끝내보세요.</p>
          <div className="progress-row" aria-label={`전체 ${tasks.length}개 중 ${completedCount}개 완료`}>
            <span>{completedCount} / {tasks.length} 완료</span>
            <span className="progress-track"><span style={{ width: tasks.length ? `${(completedCount / tasks.length) * 100}%` : "0%" }} /></span>
          </div>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="task-title">할 일 제목</label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="새로운 할 일을 적어보세요"
            maxLength={200}
          />
          <label className="sr-only" htmlFor="task-priority">중요도</label>
          <select
            id="task-priority"
            className="priority-select"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            <option value="HIGH">높음</option>
            <option value="MEDIUM">보통</option>
            <option value="LOW">낮음</option>
          </select>
          <button type="submit" disabled={submitting}>
            {submitting ? "추가 중" : "추가"}
          </button>
        </form>

        <div className="status-line" role="status" aria-live="polite">{message}</div>

        <section className="task-list" aria-label="할 일 목록">
          {loading ? (
            <p className="empty-state">목록을 불러오는 중입니다...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark">○</span>
              <p>아직 적어둔 일이 없어요.</p>
              <span>위 입력창에 첫 번째 할 일을 남겨보세요.</span>
            </div>
          ) : (
            tasks.map((task) => (
              <article className={`task-item ${task.completed ? "is-complete" : ""}`} key={task.id}>
                <button
                  className="check-button"
                  type="button"
                  onClick={() => void toggleTask(task)}
                  disabled={busyTaskId === task.id}
                  aria-label={task.completed ? `${task.title} 완료 해제` : `${task.title} 완료 처리`}
                  aria-pressed={task.completed}
                >
                  {task.completed ? "✓" : ""}
                </button>
                <span className="task-title">{task.title}</span>
                <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
                <button className="delete-button" type="button" onClick={() => void deleteTask(task)} disabled={busyTaskId === task.id} aria-label={`${task.title} 삭제`}>
                  삭제
                </button>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
