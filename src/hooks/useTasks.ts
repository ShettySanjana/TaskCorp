import { useCallback, useEffect, useState } from "react";
import type { Task, TaskComment, TaskHistoryEntry } from "@/types/task";

const STORAGE_KEY = "taskcorp.tasks.v2";

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

const seed = (): Task[] => {
  const today = new Date();
  const iso = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const base = (overrides: Partial<Task>): Task => ({
    id: uid(),
    name: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    assignedTo: "u1",
    dueDate: iso(2),
    category: "Feature",
    createdAt: new Date().toISOString(),
    progress: 0,
    comments: [],
    history: [
      {
        id: uid(),
        authorId: "admin",
        field: "created",
        createdAt: new Date().toISOString(),
        note: "Task created",
      },
    ],
    ...overrides,
  });

  return [
    base({
      name: "Redesign onboarding flow",
      description: "Rework the multi-step onboarding to reduce drop-off and align with new brand.",
      priority: "High",
      status: "In Progress",
      assignedTo: "u4",
      dueDate: iso(3),
      category: "Enhancement",
      progress: 55,
      comments: [
        {
          id: uid(),
          authorId: "u4",
          message: "Wireframes ready — passing to engineering for implementation.",
          createdAt: new Date().toISOString(),
        },
      ],
    }),
    base({
      name: "Fix payment webhook retry",
      description: "Webhooks intermittently fail retries when Stripe responds with 5xx.",
      priority: "Critical",
      status: "Pending",
      assignedTo: "u2",
      dueDate: iso(-1),
      category: "Bug",
      progress: 10,
    }),
    base({
      name: "Set up staging CI pipeline",
      description: "Add GitHub Actions for lint, test, build, deploy to staging.",
      priority: "Medium",
      status: "Completed",
      assignedTo: "u5",
      dueDate: iso(-3),
      category: "Feature",
      progress: 100,
    }),
    base({
      name: "Cross-browser regression suite",
      description: "Cover Safari and Firefox edge cases in the checkout flow.",
      priority: "Medium",
      status: "Pending",
      assignedTo: "u3",
      dueDate: iso(5),
      category: "Bug",
    }),
    base({
      name: "Implement dark mode tokens",
      description: "Audit components and apply semantic dark tokens across the app.",
      priority: "Low",
      status: "Blocked",
      assignedTo: "u1",
      dueDate: iso(7),
      category: "Enhancement",
      progress: 20,
    }),
    base({
      name: "Quarterly performance review report",
      description: "Compile team metrics, OKR progress, and roadmap into board deck.",
      priority: "High",
      status: "In Progress",
      assignedTo: "u2",
      dueDate: iso(10),
      category: "Feature",
      progress: 35,
    }),
  ];
};

const TRACKED_FIELDS: (keyof Task)[] = ["status", "priority", "assignedTo", "dueDate", "progress", "name"];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Task[];
    } catch {
      /* noop */
    }
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">, authorId = "admin") => {
      const id = uid();
      const newTask: Task = {
        ...task,
        id,
        createdAt: new Date().toISOString(),
        comments: task.comments ?? [],
        history: [
          {
            id: uid(),
            authorId,
            field: "created",
            createdAt: new Date().toISOString(),
            note: `Created task and assigned to ${task.assignedTo}`,
          },
        ],
      };
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>, authorId = "admin") => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const newHistory: TaskHistoryEntry[] = [...(t.history ?? [])];
          for (const field of TRACKED_FIELDS) {
            if (patch[field] !== undefined && patch[field] !== t[field]) {
              newHistory.push({
                id: uid(),
                authorId,
                field: String(field),
                from: String(t[field] ?? ""),
                to: String(patch[field] ?? ""),
                createdAt: new Date().toISOString(),
              });
            }
          }
          return { ...t, ...patch, history: newHistory };
        }),
      );
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addComment = useCallback(
    (taskId: string, message: string, authorId: string) => {
      const comment: TaskComment = {
        id: uid(),
        authorId,
        message,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: [...(t.comments ?? []), comment],
                history: [
                  ...(t.history ?? []),
                  {
                    id: uid(),
                    authorId,
                    field: "comment",
                    createdAt: new Date().toISOString(),
                    note: "Added a comment",
                  },
                ],
              }
            : t,
        ),
      );
    },
    [],
  );

  return { tasks, addTask, updateTask, deleteTask, addComment };
}
