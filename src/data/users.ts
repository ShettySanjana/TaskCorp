import type { User } from "@/types/task";

export const USERS: User[] = [
  { id: "u1", name: "Aarav Sharma", role: "Frontend Engineer", initials: "AS", color: "231 70% 56%" },
  { id: "u2", name: "Priya Mehta", role: "Backend Engineer", initials: "PM", color: "174 62% 47%" },
  { id: "u3", name: "Rahul Verma", role: "QA Analyst", initials: "RV", color: "32 95% 54%" },
  { id: "u4", name: "Sneha Kapoor", role: "Product Designer", initials: "SK", color: "291 64% 55%" },
  { id: "u5", name: "Karan Patel", role: "DevOps Engineer", initials: "KP", color: "152 65% 42%" },
];

export const getUser = (id: string) => USERS.find((u) => u.id === id);
