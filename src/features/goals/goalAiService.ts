import { DailyTask, YearlyGoal } from './types';

const dailyTasksSchema = {
  type: 'OBJECT',
  properties: {
    tasks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          estimatedMinutes: { type: 'NUMBER' },
          repeatable: { type: 'BOOLEAN' },
        },
        required: ['title', 'description', 'estimatedMinutes', 'repeatable'],
      },
    },
  },
  required: ['tasks'],
};

export async function generateDailyTasksForGoal(
  goal: YearlyGoal,
  excludedTaskTitles: string[],
  count: number,
): Promise<DailyTask[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-3.6-flash';
  const taskCount = Math.max(1, Math.min(count, 3));

  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY를 .env에 설정해 주세요.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildPrompt(
                  goal.title,
                  excludedTaskTitles,
                  taskCount,
                ),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: dailyTasksSchema,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Gemini 요청에 실패했습니다.');
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return normalizeDailyTasks(goal, JSON.parse(text), taskCount);
}

function buildPrompt(
  yearlyGoal: string,
  excludedTaskTitles: string[],
  count: number,
) {
  const excludedBlock =
    excludedTaskTitles.length > 0
      ? [
          '이번 생성에서 피해야 할 할 일 목록:',
          ...excludedTaskTitles.map((title) => `- ${title}`),
          '위 목록과 의미가 같거나 거의 같은 할 일은 다시 만들지 마.',
        ].join('\n')
      : '이번 생성에서 따로 피해야 할 할 일은 없어.';

  return [
    '너는 자기계발 앱의 목표 코치야.',
    `사용자의 올해 목표를 보고 오늘 바로 할 수 있는 작은 할 일 ${count}개를 만들어줘.`,
    '각 할 일은 구체적이고 사용자가 완료 여부를 스스로 판단할 수 있어야 해.',
    '할 일은 5~30분 안에 할 수 있는 크기로 만들어줘.',
    '서로 다른 행동으로 구성하고, 같은 의미의 할 일을 중복 생성하지 마.',
    '문제집 1단원 풀기, 교재 2과 끝내기처럼 특정 진도를 완료하는 할 일은 repeatable=false로 표시해.',
    '단어 50개 외우기, 듣기 10분, 복습 15분처럼 매일 반복해도 자연스러운 훈련은 repeatable=true로 표시해.',
    excludedBlock,
    '한국어로 답하고, 반드시 JSON으로만 답해.',
    `올해 목표: ${yearlyGoal}`,
  ].join('\n');
}

function normalizeDailyTasks(
  goal: YearlyGoal,
  plan: {
    tasks: Array<Omit<DailyTask, 'id' | 'goalId' | 'goalTitle' | 'done'>>;
  },
  count: number,
): DailyTask[] {
  return plan.tasks.slice(0, count).map((task, index) => ({
    id: `${Date.now()}-${goal.id}-${index}`,
    goalId: goal.id,
    goalTitle: goal.title,
    title: String(task.title),
    description: String(task.description),
    estimatedMinutes: Number(task.estimatedMinutes) || 10,
    repeatable: Boolean(task.repeatable),
    done: false,
  }));
}
