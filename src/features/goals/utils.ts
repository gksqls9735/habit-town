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

/** Allows yesterday's repeatable routines while excluding all of today's tasks. */
export function getExcludedTaskTitles(
  plans: DailyPlan[],
  goalId: string,
  now = Date.now(),
) {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = getNextMidnightTimestamp(now);
  return Array.from(new Set([
    ...getCompletedNonRepeatableTaskTitles(plans, goalId),
    ...plans
      .filter((plan) => plan.goalId === goalId
        && plan.generatedAt >= dayStart.getTime() && plan.generatedAt < dayEnd)
      .flatMap((plan) => plan.tasks.map((task) => task.title)),
  ]));
}

export function getNextMidnightTimestamp(fromTimestamp: number) {
  const date = new Date(fromTimestamp);
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

export function isPlanExpired(plan: DailyPlan) {
  return Date.now() >= plan.expiresAt;
}

/** Uses local dates consistently for assignment history and completion permissions. */
export function getLocalDateKey(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Only today's assigned, unexpired plans may be changed, including from the calendar. */
export function canEditPlan(plan: DailyPlan, now = Date.now()) {
  return getLocalDateKey(plan.generatedAt) === getLocalDateKey(now) && now < plan.expiresAt;
}
