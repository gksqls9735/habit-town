import { DailyTask, goalDifficultyLabels, YearlyGoal } from './types';
import { parseDailyTasks, readGeneratedText } from './goalAiValidation';

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

/** Returns a complete validated task set; failures never produce partial plans. */
export async function generateDailyTasksForGoal(
  goal: YearlyGoal,
  excludedTaskTitles: string[],
  count: number,
): Promise<DailyTask[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-3.6-flash';
  if (!Number.isInteger(count) || count < 1 || count > 3 || !goal.title.trim()) {
    throw new Error('목표와 생성할 할 일 개수를 확인해 주세요.');
  }
  const taskCount = count;

  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY를 .env에 설정해 주세요.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    // Bound network and response-body reading so the loading state can recover.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        signal: controller.signal,
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
                    goal.difficulty,
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

    if (!response.ok) {
      const message = response.status === 429
        ? 'AI 요청이 많아 잠시 사용할 수 없어요. 잠시 후 다시 시도해 주세요.'
        : response.status === 401 || response.status === 403
          ? 'AI 서비스 인증 설정을 확인해 주세요.'
          : '할 일을 만들지 못했어요. 잠시 후 다시 시도해 주세요.';
      throw new Error(message);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      if (controller.signal.aborted) throw new Error('timeout');
      throw new Error('AI 응답을 읽지 못했어요. 다시 시도해 주세요.');
    }
    return parseDailyTasks(goal, readGeneratedText(data), taskCount, excludedTaskTitles);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('AI 응답 시간이 초과됐어요. 다시 시도해 주세요.');
    }
    if (error instanceof TypeError) {
      throw new Error('AI 서비스에 연결하지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function buildPrompt(
  yearlyGoal: string,
  difficulty: YearlyGoal['difficulty'],
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
    `사용자가 고른 목표 난이도는 ${goalDifficultyLabels[difficulty]}야.`,
    getDifficultyInstruction(difficulty),
    '서로 다른 행동으로 구성하고, 같은 의미의 할 일을 중복 생성하지 마.',
    '문제집 1단원 풀기, 교재 2과 끝내기처럼 특정 진도를 완료하는 할 일은 repeatable=false로 표시해.',
    '단어 50개 외우기, 듣기 10분, 복습 15분처럼 매일 반복해도 자연스러운 훈련은 repeatable=true로 표시해.',
    excludedBlock,
    '한국어로 답하고, 반드시 JSON으로만 답해.',
    `올해 목표: ${yearlyGoal}`,
  ].join('\n');
}

function getDifficultyInstruction(difficulty: YearlyGoal['difficulty']) {
  if (difficulty === 'high') {
    return '난이도 상: 20~30분 정도의 도전적인 할 일을 우선 만들고, 분명한 산출물이 남게 해.';
  }

  if (difficulty === 'low') {
    return '난이도 하: 5~10분 정도의 부담 낮은 첫걸음을 우선 만들고, 시작 장벽을 낮춰.';
  }

  return '난이도 중: 10~20분 정도의 적당한 몰입이 필요한 할 일을 우선 만들어.';
}
