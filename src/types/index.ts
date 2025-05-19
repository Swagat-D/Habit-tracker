// src/types/index.ts
import { DefaultSession } from "next-auth";

// Extend the default session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      avatar?: string;
    } & DefaultSession["user"];
  }
  
  interface User {
    id: string;
    avatar?: string;
  }
}

// Habit related types
export type HabitHistory = {
  date: string;
  value: number;
};

export type Habit = {
  _id: string;
  name: string;
  icon: string;
  target: number;
  unit: string;
  frequency: string;
  progress: number;
  streak: number;
  lastUpdated?: string | null;
  history: HabitHistory[];
  color: string;
  userId: string;
};

export type NewHabitInput = Omit<Habit, "_id" | "history" | "streak" | "progress" | "lastUpdated" | "userId">;