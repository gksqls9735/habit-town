export type YearlyGoal = {
  id: string;
  title: string;
};

export type DailyTask = {
  id: string;
  goalId: string;
  goalTitle: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  repeatable: boolean;
  done: boolean;
};

export type DailyPlan = {
  id: string;
  expiresAt: number;
  goalId: string;
  goalTitle: string;
  title: string;
  generatedAt: number;
  round: number;
  tasks: DailyTask[];
};
