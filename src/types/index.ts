export type Habit = {
  id: string;
  name: string;
  icon: string;
  target: number;
  unit: string;
  frequency: string;
  progress: number;
  streak: number;
  history: { date: string; value: number }[];
  color: string;
};

export type User = {
  name: string;
  avatar: string;
  joinedDate: string;
  currentStreak: number;
  longestStreak: number;
};

export type WeeklySummary = {
  day: string;
  sleep: number;
  water: number;
  exercise: number;
  meditation: number;
  reading: number;
};

export type DailyProgress = {
  habit: string;
  progress: number;
  target: number;
  unit: string;
  color: string;
};