import { DailyPlan, DailyTask } from '../goals/types';
import { getLocalDateKey } from '../goals/utils';

export type CalendarRecord = {
  completed: number;
  total: number;
  tasks: { plan: DailyPlan; task: DailyTask }[];
};

/** Includes expired history and additional rounds, counting only current replacement tasks. */
export function getCalendarHistory(plans: DailyPlan[]) {
  const history: Record<string, CalendarRecord> = {};
  for (const plan of plans) {
    const date = getLocalDateKey(plan.generatedAt);
    const record = history[date] ??= { completed: 0, total: 0, tasks: [] };
    for (const task of plan.tasks) {
      record.tasks.push({ plan, task });
      record.total += 1;
      if (task.done) record.completed += 1;
    }
  }
  return history;
}
