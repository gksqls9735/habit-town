import { DailyTask, GoalDifficulty } from '../goals/types';

export type GrowthStage = 'baby' | 'child' | 'teen' | 'adult';

export type TaskReward = {
  coins: number;
  experience: number;
};

export type RewardProgress = {
  coins: number;
  experience: number;
  level: number;
  stage: GrowthStage;
  totalExperience: number;
};

export const experiencePerGrowthStage = 100;

export const growthStages: GrowthStage[] = ['baby', 'child', 'teen', 'adult'];

export const growthStageLabels: Record<GrowthStage, string> = {
  adult: 'ADULT',
  baby: 'BABY',
  child: 'CHILD',
  teen: 'TEEN',
};

export const initialRewardProgress: RewardProgress = {
  coins: 0,
  experience: 0,
  level: 1,
  stage: 'baby',
  totalExperience: 0,
};

export function calculateTaskReward(
  task: DailyTask,
  goalDifficulty: GoalDifficulty,
): TaskReward {
  const effortUnits = Math.max(1, Math.ceil(task.estimatedMinutes / 5));
  const difficultyMultiplier = getDifficultyMultiplier(goalDifficulty);
  const experience = Math.round(effortUnits * 6 * difficultyMultiplier);

  return {
    coins: experience * 3,
    experience,
  };
}

export function applyTaskReward(
  progress: RewardProgress,
  reward: TaskReward,
): RewardProgress {
  let nextExperience = progress.experience + reward.experience;
  let nextLevel = progress.level;
  let nextStageIndex = Math.max(0, growthStages.indexOf(progress.stage));

  while (nextExperience >= experiencePerGrowthStage) {
    nextExperience -= experiencePerGrowthStage;
    nextLevel += 1;

    if (nextStageIndex < growthStages.length - 1) {
      nextStageIndex += 1;
    }
  }

  return {
    coins: progress.coins + reward.coins,
    experience: nextExperience,
    level: nextLevel,
    stage: growthStages[nextStageIndex],
    totalExperience: progress.totalExperience + reward.experience,
  };
}

export function normalizeRewardProgress(value: unknown): RewardProgress {
  if (!isRecord(value)) {
    return initialRewardProgress;
  }

  const stage = isGrowthStage(value.stage) ? value.stage : initialRewardProgress.stage;
  const coins = normalizeNumber(value.coins, initialRewardProgress.coins);
  const experience = Math.min(
    experiencePerGrowthStage - 1,
    normalizeNumber(value.experience, initialRewardProgress.experience),
  );
  const level = Math.max(1, normalizeNumber(value.level, initialRewardProgress.level));
  const totalExperience = normalizeNumber(
    value.totalExperience,
    initialRewardProgress.totalExperience,
  );

  return {
    coins,
    experience,
    level,
    stage,
    totalExperience,
  };
}

function getDifficultyMultiplier(difficulty: GoalDifficulty) {
  if (difficulty === 'high') {
    return 1.2;
  }

  if (difficulty === 'low') {
    return 0.85;
  }

  return 1;
}

function normalizeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGrowthStage(value: unknown): value is GrowthStage {
  return typeof value === 'string' && growthStages.includes(value as GrowthStage);
}
