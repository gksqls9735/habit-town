import * as SQLite from 'expo-sqlite';
import { DailyPlan, DailyTask, YearlyGoal } from './types';

const databaseName = 'habit-town.db';
const taskRefreshKey = 'hasUsedTaskRefresh';

type GoalPlannerData = {
  dailyPlans: DailyPlan[];
  hasUsedTaskRefresh: boolean;
  yearlyGoals: YearlyGoal[];
};

type GoalRow = {
  id: string;
  title: string;
};

type DailyPlanRow = {
  expires_at: number;
  generated_at: number;
  goal_id: string;
  goal_title: string;
  id: string;
  round: number;
  title: string;
};

type DailyTaskRow = {
  description: string;
  done: number;
  estimated_minutes: number;
  goal_id: string;
  goal_title: string;
  id: string;
  plan_id: string;
  position: number;
  repeatable: number;
  title: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function loadGoalPlannerData(): Promise<GoalPlannerData> {
  const db = await getGoalDatabase();
  const [goalRows, planRows, taskRows, refreshRow] = await Promise.all([
    db.getAllAsync<GoalRow>('SELECT id, title FROM goals ORDER BY created_at ASC'),
    db.getAllAsync<DailyPlanRow>(
      `SELECT id, goal_id, goal_title, title, generated_at, expires_at, round
       FROM daily_plans
       ORDER BY generated_at DESC`,
    ),
    db.getAllAsync<DailyTaskRow>(
      `SELECT id, plan_id, goal_id, goal_title, title, description,
              estimated_minutes, repeatable, done, position
       FROM daily_tasks
       ORDER BY position ASC`,
    ),
    db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_meta WHERE key = ?',
      taskRefreshKey,
    ),
  ]);

  const tasksByPlanId = taskRows.reduce<Record<string, DailyTask[]>>(
    (groups, row) => {
      const nextTask: DailyTask = {
        description: row.description,
        done: row.done === 1,
        estimatedMinutes: row.estimated_minutes,
        goalId: row.goal_id,
        goalTitle: row.goal_title,
        id: row.id,
        repeatable: row.repeatable === 1,
        title: row.title,
      };

      return {
        ...groups,
        [row.plan_id]: [...(groups[row.plan_id] ?? []), nextTask],
      };
    },
    {},
  );

  return {
    dailyPlans: planRows.map((row) => ({
      expiresAt: row.expires_at,
      generatedAt: row.generated_at,
      goalId: row.goal_id,
      goalTitle: row.goal_title,
      id: row.id,
      round: row.round,
      tasks: tasksByPlanId[row.id] ?? [],
      title: row.title,
    })),
    hasUsedTaskRefresh: refreshRow?.value === 'true',
    yearlyGoals: goalRows.map((row) => ({
      id: row.id,
      title: row.title,
    })),
  };
}

export async function saveGoalPlannerData(data: GoalPlannerData) {
  const db = await getGoalDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM daily_tasks');
    await db.runAsync('DELETE FROM daily_plans');
    await db.runAsync('DELETE FROM goals');
    await db.runAsync('DELETE FROM app_meta WHERE key = ?', taskRefreshKey);

    for (const [index, goal] of data.yearlyGoals.entries()) {
      await db.runAsync(
        'INSERT INTO goals (id, title, created_at) VALUES (?, ?, ?)',
        goal.id,
        goal.title,
        index,
      );
    }

    for (const plan of data.dailyPlans) {
      await db.runAsync(
        `INSERT INTO daily_plans
          (id, goal_id, goal_title, title, generated_at, expires_at, round)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        plan.id,
        plan.goalId,
        plan.goalTitle,
        plan.title,
        plan.generatedAt,
        plan.expiresAt,
        plan.round,
      );

      for (const [position, task] of plan.tasks.entries()) {
        await db.runAsync(
          `INSERT INTO daily_tasks
            (id, plan_id, goal_id, goal_title, title, description,
             estimated_minutes, repeatable, done, position)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          task.id,
          plan.id,
          task.goalId,
          task.goalTitle,
          task.title,
          task.description,
          task.estimatedMinutes,
          task.repeatable ? 1 : 0,
          task.done ? 1 : 0,
          position,
        );
      }
    }

    await db.runAsync(
      'INSERT INTO app_meta (key, value) VALUES (?, ?)',
      taskRefreshKey,
      data.hasUsedTaskRefresh ? 'true' : 'false',
    );
  });
}

async function getGoalDatabase() {
  databasePromise ??= openGoalDatabase();
  return databasePromise;
}

async function openGoalDatabase() {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_plans (
      id TEXT PRIMARY KEY NOT NULL,
      goal_id TEXT NOT NULL,
      goal_title TEXT NOT NULL,
      title TEXT NOT NULL,
      generated_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      round INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY NOT NULL,
      plan_id TEXT NOT NULL,
      goal_id TEXT NOT NULL,
      goal_title TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      estimated_minutes INTEGER NOT NULL,
      repeatable INTEGER NOT NULL,
      done INTEGER NOT NULL,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  return db;
}
