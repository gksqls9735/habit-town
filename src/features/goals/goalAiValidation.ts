import { DailyTask, YearlyGoal } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function titleKey(title: string) {
  return title.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
}

/** Rejects blocked, incomplete, or missing provider output before parsing tasks. */
export function readGeneratedText(data: unknown): string {
  if (!isRecord(data)) throw new Error('AI 응답 형식이 올바르지 않아요. 다시 시도해 주세요.');
  if (isRecord(data.promptFeedback) && data.promptFeedback.blockReason) {
    throw new Error('이 목표로 할 일을 생성할 수 없어요. 목표 내용을 바꿔 주세요.');
  }
  const candidate: unknown = Array.isArray(data.candidates) ? data.candidates[0] : undefined;
  if (!isRecord(candidate) || candidate.finishReason !== 'STOP'
    || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
    throw new Error('완전한 AI 응답을 받지 못했어요. 다시 시도해 주세요.');
  }
  const text = candidate.content.parts
    .filter((part: unknown): part is Record<string, unknown> => isRecord(part) && part.thought !== true)
    .map((part) => typeof part.text === 'string' ? part.text : '').join('');
  if (!text.trim()) throw new Error('AI 응답이 비어 있어요. 다시 시도해 주세요.');
  return text;
}

/** Validates the entire batch atomically; never coerces malformed model fields. */
export function parseDailyTasks(
  goal: YearlyGoal,
  text: string,
  count: number,
  excludedTitles: string[],
): DailyTask[] {
  const invalid = 'AI가 올바른 할 일을 만들지 못했어요. 다시 시도해 주세요.';
  let plan: unknown;
  try { plan = JSON.parse(text); } catch { throw new Error(invalid); }
  if (!isRecord(plan) || !Array.isArray(plan.tasks) || plan.tasks.length !== count) {
    throw new Error(invalid);
  }
  const seen = new Set(excludedTitles.map(titleKey));
  const generatedAt = Date.now();
  return plan.tasks.map((task: unknown, index) => {
    if (!isRecord(task) || typeof task.title !== 'string' || !task.title.trim()
      || typeof task.description !== 'string' || !task.description.trim()
      || typeof task.estimatedMinutes !== 'number' || !Number.isFinite(task.estimatedMinutes)
      || task.estimatedMinutes < 5 || task.estimatedMinutes > 30
      || typeof task.repeatable !== 'boolean') {
      throw new Error(invalid);
    }
    const key = titleKey(task.title);
    if (!key) throw new Error(invalid);
    if (seen.has(key)) throw new Error('기존 할 일과 중복된 응답이에요. 다시 시도해 주세요.');
    seen.add(key);
    return {
      id: `${generatedAt}-${goal.id}-${index}`,
      goalId: goal.id, goalTitle: goal.title,
      title: task.title.trim(), description: task.description.trim(),
      estimatedMinutes: task.estimatedMinutes, repeatable: task.repeatable, done: false,
    };
  });
}
