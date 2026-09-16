import { DailyPlan, YearlyGoal } from './types';

const goalActionWords = [
  '공부하기',
  '준비하기',
  '달성하기',
  '합격하기',
  '취득하기',
  '따기',
  '공부',
  '준비',
  '달성',
  '합격',
  '취득',
];

const koreanNumberValues: Record<string, string> = {
  구: '9',
  사: '4',
  삼: '3',
  십: '10',
  오: '5',
  육: '6',
  이: '2',
  일: '1',
  칠: '7',
  팔: '8',
};

type GoalCertificate = {
  family: string;
  level: string | null;
};

export const duplicateClosedGoalCooldownDays = 7;

const duplicateClosedGoalCooldownMs = duplicateClosedGoalCooldownDays * 24 * 60 * 60 * 1000;

export function getRemainingTaskCount(plans: DailyPlan[]) {
  return plans.reduce(
    (total, plan) =>
      total +
      (isPlanExpired(plan) ? 0 : plan.tasks.filter((task) => !task.done).length),
    0,
  );
}

export function getRemainingTaskBadge(plans: DailyPlan[]) {
  const remainingTaskCount = getRemainingTaskCount(plans);
  return remainingTaskCount > 0 ? String(remainingTaskCount) : undefined;
}

export function findDuplicateYearlyGoal(
  goals: YearlyGoal[],
  title: string,
  now = Date.now(),
) {
  return goals.find((goal) =>
    isDuplicateGoalCandidate(goal, now) &&
    areSimilarGoalTitles(goal.title, title),
  ) ?? null;
}

export function getGoalClosedAt(goal: YearlyGoal) {
  return goal.completedAt ?? goal.abandonedAt ?? null;
}

function isDuplicateGoalCandidate(goal: YearlyGoal, now: number) {
  const closedAt = getGoalClosedAt(goal);

  return closedAt == null || now - closedAt < duplicateClosedGoalCooldownMs;
}

function areSimilarGoalTitles(left: string, right: string) {
  const normalizedLeft = normalizeGoalTitle(left);
  const normalizedRight = normalizeGoalTitle(right);

  if (normalizedLeft === normalizedRight) {
    return true;
  }

  const leftCertificate = getGoalCertificate(normalizedLeft);
  const rightCertificate = getGoalCertificate(normalizedRight);

  return leftCertificate != null &&
    rightCertificate != null &&
    leftCertificate.family === rightCertificate.family &&
    (
      leftCertificate.level == null ||
      rightCertificate.level == null ||
      leftCertificate.level === rightCertificate.level
    );
}

function normalizeGoalTitle(title: string) {
  let normalized = title
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\-_.,!?()[\]{}'"`~:;·ㆍ]/g, '');

  for (const word of goalActionWords) {
    normalized = normalized.replaceAll(word, '');
  }

  return normalized;
}

function getGoalCertificate(normalizedTitle: string): GoalCertificate | null {
  const family = getCertificateFamily(normalizedTitle);

  if (!family) {
    return null;
  }

  return {
    family,
    level: getCertificateLevel(normalizedTitle),
  };
}

function getCertificateFamily(normalizedTitle: string) {
  if (
    normalizedTitle.includes('hsk') ||
    normalizedTitle.includes('중국어자격증') ||
    normalizedTitle.includes('중국어능력시험')
  ) {
    return 'chinese-hsk';
  }

  if (
    normalizedTitle.includes('jlpt') ||
    normalizedTitle.includes('일본어능력시험')
  ) {
    return 'japanese-jlpt';
  }

  if (normalizedTitle.includes('jpt')) {
    return 'japanese-jpt';
  }

  return null;
}

function getCertificateLevel(normalizedTitle: string) {
  const numericLevel = normalizedTitle.match(/([0-9]+)(급|레벨|level|lv)/);
  if (numericLevel) {
    return numericLevel[1];
  }

  const koreanLevel = normalizedTitle.match(/([일이삼사오육칠팔구십]+)(급|레벨)/);
  if (!koreanLevel) {
    return null;
  }

  return koreanNumberValues[koreanLevel[1]] ?? null;
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
