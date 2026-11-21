export interface CreatedHabit {
  id: string;
  name: string;
  emoji: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentStreak: number;
}

export interface HabitReminder {
  enabled: boolean;
  time: string | null;
  timeZone: string | null;
}
