export type GoalDifficulty = 'low' | 'medium' | 'high';

export const goalDifficultyLabels: Record<GoalDifficulty, string> = {
  high: '상',
  low: '하',
  medium: '중',
};

export const goalDifficultyOptions: GoalDifficulty[] = ['high', 'medium', 'low'];

export type YearlyGoal = {
  difficulty: GoalDifficulty;
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
