import { useCallback, useEffect, useState } from "react";
import type { Task } from "@/types/task";

const STORAGE_KEY = "taskcorp.tasks.v1";

const seed = (): Task[] => {
  const today = new Date();
  const iso = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: crypto.randomUUID(),
      name: "Redesign onboarding flow",
      description: "Rework the multi-step onboarding to reduce drop-off and align with new brand.",
      priority: "High",
      status: "In Progress",
      assignedTo: "u4",
      dueDate: iso(3),
      category: "Enhancement",
      createdAt: new Date().toISOString(),
      progress: 55,
    },
    {
      id: crypto.randomUUID(),
      name: "Fix payment webhook retry",
      description: "Webhooks intermittently fail retries when Stripe responds with 5xx.",
      priority: "Critical",
      status: "Pending",
      assignedTo: "u2",
      dueDate: iso(-1),
      category: "Bug",
      createdAt: new Date().toISOString(),
      progress: 10,
    },
    {
      id: crypto.randomUUID(),
      name: "Set up staging CI pipeline",
      description: "Add GitHub Actions for lint, test, build, deploy to staging.",
      priority: "Medium",
      status: "Completed",
      assignedTo: "u5",
      dueDate: iso(-3),
      category: "Feature",
      createdAt: new Date().toISOString(),
      progress: 100,
    },
    {
      id: crypto.randomUUID(),
      name: "Cross-browser regression suite",
      description: "Cover Safari and Firefox edge cases in the checkout flow.",
      priority: "Medium",
      status: "Pending",
      assignedTo: "u3",
      dueDate: iso(5),
      category: "Bug",
      createdAt: new Date().toISOString(),
      progress: 0,
    },
    {
      id: crypto.randomUUID(),
      name: "Implement dark mode tokens",
      description: "Audit components and apply semantic dark tokens across the app.",
      priority: "Low",
      status: "Blocked",
      assignedTo: "u1",
      dueDate: iso(7),
      category: "Enhancement",
      createdAt: new Date().toISOString(),
      progress: 20,
    },
  ];
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Task[];
    } catch {}
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    setTasks((prev) => [
      { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, addTask, updateTask, deleteTask };
}
