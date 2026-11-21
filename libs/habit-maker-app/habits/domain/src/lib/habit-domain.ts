export interface Habit {
  id: string;
  name: string;
  emoji?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  currentStreak?: number;
}

export interface HabitCompletionStatus {
  date: string;
  completed: boolean;
  completedAt: string | null;
}

export interface HabitReminder {
  enabled: boolean;
  time: string | null;
  timeZone: string | null;
}
