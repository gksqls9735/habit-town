import { DailyPlan } from './types';

export function getRemainingTaskCount(plans: DailyPlan[]) {
  return plans.reduce(
    (total, plan) =>
      total +
      (isPlanExpired(plan) ? 0 : plan.tasks.filter((task) => !task.done).length),
    0,
  );
}

export function getRemainingTaskBadge(plans: DailyPlan[]) {
  return String(getRemainingTaskCount(plans));
}

export function getCompletedNonRepeatableTaskTitles(
  plans: DailyPlan[],
  goalId?: string,
) {
  const titles = plans.flatMap((plan) =>
    plan.tasks
      .filter((task) => task.done && !task.repeatable)
      .filter((task) => !goalId || task.goalId === goalId)
      .map((task) => task.title),
  );

  return Array.from(new Set(titles));
}

export function getNextRoundForGoal(plans: DailyPlan[], goalId: string) {
  const rounds = plans
    .filter((plan) => plan.goalId === goalId)
    .map((plan) => plan.round);

  return rounds.length > 0 ? Math.max(...rounds) + 1 : 1;
}

export function getNextMidnightTimestamp(fromTimestamp: number) {
  const date = new Date(fromTimestamp);
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

export function isPlanExpired(plan: DailyPlan) {
  return Date.now() >= plan.expiresAt;
}
