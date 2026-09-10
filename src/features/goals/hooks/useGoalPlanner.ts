import { useEffect, useState } from 'react';
import {
  applyCurrencyReward,
  applyCurrencySpend,
  applyExperienceReward,
  applyTaskReward,
  calculateTaskReward,
  initialRewardProgress,
  RewardProgress,
} from '../../rewards/rewardSystem';
import { generateDailyTasksForGoal } from '../goalAiService';
import { loadGoalPlannerData, saveGoalPlannerData } from '../goalRepository';
import { DailyPlan, GoalDifficulty, YearlyGoal } from '../types';
import {
  canEditPlan,
  getExcludedTaskTitles,
  getNextMidnightTimestamp,
  getNextRoundForGoal,
  isPlanExpired,
} from '../utils';

type GenerationType = 'basic' | 'ad';

const basicDailyPlanTitle = '오늘 할 일';
const adDailyPlanTitle = '광고 보상 추가 할 일';

async function createDailyPlansForGoals(
  targetGoals: YearlyGoal[],
  existingPlans: DailyPlan[],
  generationType: GenerationType,
): Promise<DailyPlan[]> {
  const nextTasks = await Promise.all(
    targetGoals.map((goal) =>
      generateDailyTasksForGoal(
        goal,
        getExcludedTaskTitles(existingPlans, goal.id),
        generationType === 'basic' ? 3 : 1,
      ),
    ),
  );

  return targetGoals.map((goal, index) => {
    const generatedAt = Date.now() + index;

    return {
      expiresAt: getNextMidnightTimestamp(generatedAt),
      generatedAt,
      goalId: goal.id,
      goalTitle: goal.title,
      id: `${generatedAt}-${goal.id}`,
      round: getNextRoundForGoal(existingPlans, goal.id),
      tasks: nextTasks[index],
      title: generationType === 'basic' ? basicDailyPlanTitle : adDailyPlanTitle,
    };
  });
}

function hasEditableBasicDailyPlan(
  plans: DailyPlan[],
  goalId: string,
  now = Date.now(),
) {
  return plans.some(
    (plan) =>
      plan.goalId === goalId &&
      plan.title === basicDailyPlanTitle &&
      canEditPlan(plan, now),
  );
}

export function useGoalPlanner() {
  const [isTodayTasksOpen, setIsTodayTasksOpen] = useState(false);
  const [isYearlyGoalOpen, setIsYearlyGoalOpen] = useState(false);
  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[]>([]);
  const [yearlyGoalDraft, setYearlyGoalDraft] = useState('');
  const [yearlyGoalDifficulty, setYearlyGoalDifficulty] = useState<GoalDifficulty>('medium');
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [goalError, setGoalError] = useState('');
  const [hasUsedTaskRefresh, setHasUsedTaskRefresh] = useState(false);
  const [isLoadingGoalData, setIsLoadingGoalData] = useState(true);
  const [rewardProgress, setRewardProgress] = useState<RewardProgress>(initialRewardProgress);
  const [selectedTaskGoalId, setSelectedTaskGoalId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadGoalPlanner = async () => {
      try {
        const savedData = await loadGoalPlannerData();
        if (!isMounted) {
          return;
        }

        setYearlyGoals(savedData.yearlyGoals);
        setDailyPlans(savedData.dailyPlans);
        setHasUsedTaskRefresh(savedData.hasUsedTaskRefresh);
        setRewardProgress(savedData.rewardProgress);

        const goalsMissingTodayPlan = savedData.yearlyGoals.filter(
          (goal) => !hasEditableBasicDailyPlan(savedData.dailyPlans, goal.id),
        );

        if (goalsMissingTodayPlan.length === 0) {
          return;
        }

        setIsGeneratingPlan(true);
        setGoalError('');

        const nextPlans = await createDailyPlansForGoals(
          goalsMissingTodayPlan,
          savedData.dailyPlans,
          'basic',
        );

        if (!isMounted) {
          return;
        }

        const savedPlans = [...nextPlans, ...savedData.dailyPlans];

        setDailyPlans(savedPlans);
        await saveGoalPlannerData({
          dailyPlans: savedPlans,
          hasUsedTaskRefresh: savedData.hasUsedTaskRefresh,
          rewardProgress: savedData.rewardProgress,
          yearlyGoals: savedData.yearlyGoals,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '저장된 목표 데이터를 불러오지 못했습니다.';

        if (isMounted) {
          setGoalError(message);
        }
      } finally {
        if (isMounted) {
          setIsGeneratingPlan(false);
          setIsLoadingGoalData(false);
        }
      }
    };

    loadGoalPlanner();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistGoalPlannerData = (
    nextYearlyGoals = yearlyGoals,
    nextDailyPlans = dailyPlans,
    nextHasUsedTaskRefresh = hasUsedTaskRefresh,
    nextRewardProgress = rewardProgress,
  ) => {
    saveGoalPlannerData({
      dailyPlans: nextDailyPlans,
      hasUsedTaskRefresh: nextHasUsedTaskRefresh,
      rewardProgress: nextRewardProgress,
      yearlyGoals: nextYearlyGoals,
    }).catch((error) => {
      const message =
        error instanceof Error ? error.message : '목표 데이터를 저장하지 못했습니다.';

      setGoalError(message);
    });
  };

  const openTodayTasks = () => {
    setSelectedTaskGoalId(null);
    setIsTodayTasksOpen(true);
  };

  const closeTodayTasks = () => {
    setIsTodayTasksOpen(false);
  };

  const openYearlyGoal = () => {
    setYearlyGoalDraft('');
    setYearlyGoalDifficulty('medium');
    setIsYearlyGoalOpen(true);
  };

  const closeYearlyGoal = () => {
    setIsYearlyGoalOpen(false);
  };

  const openYearlyGoalFromTodayTasks = () => {
    setYearlyGoalDraft('');
    setYearlyGoalDifficulty('medium');
    setIsTodayTasksOpen(false);
    setIsYearlyGoalOpen(true);
  };

  const generateDailyPlan = async (
    goalsOverride?: YearlyGoal[],
    generationType: GenerationType = 'ad',
    yearlyGoalsOverride = yearlyGoals,
  ) => {
    const targetGoals = goalsOverride ?? yearlyGoals;
    if (targetGoals.length === 0 || isGeneratingPlan) {
      if (targetGoals.length === 0) {
        setGoalError('먼저 올해 목표를 입력해 주세요.');
        setIsYearlyGoalOpen(true);
      }
      return;
    }

    setIsGeneratingPlan(true);
    setGoalError('');

    try {
      const nextPlans = await createDailyPlansForGoals(
        targetGoals,
        dailyPlans,
        generationType,
      );

      const savedPlans = [...nextPlans, ...dailyPlans];

      setDailyPlans(savedPlans);
      persistGoalPlannerData(yearlyGoalsOverride, savedPlans);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '오늘 할 일을 생성하지 못했습니다.';

      setGoalError(message);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const addYearlyGoal = async () => {
    const cleanGoal = yearlyGoalDraft.trim();
    if (!cleanGoal || isGeneratingPlan) {
      return;
    }

    const nextGoal: YearlyGoal = {
      difficulty: yearlyGoalDifficulty,
      id: `${Date.now()}`,
      title: cleanGoal,
    };

    const nextYearlyGoals = [...yearlyGoals, nextGoal];

    setYearlyGoals(nextYearlyGoals);
    setGoalError('');
    setYearlyGoalDraft('');
    setYearlyGoalDifficulty('medium');
    setIsYearlyGoalOpen(false);
    setSelectedTaskGoalId(nextGoal.id);
    await generateDailyPlan([nextGoal], 'basic', nextYearlyGoals);
    setIsTodayTasksOpen(true);
  };

  const generateAdditionalTaskForSelectedGoal = async () => {
    const selectedGoal = yearlyGoals.find((goal) => goal.id === selectedTaskGoalId);
    if (!selectedGoal) {
      return;
    }

    await generateDailyPlan([selectedGoal], 'ad');
  };

  const refreshOneIncompleteTaskForSelectedGoal = async () => {
    const selectedGoal = yearlyGoals.find((goal) => goal.id === selectedTaskGoalId);
    if (!selectedGoal || isGeneratingPlan) {
      return;
    }

    if (hasUsedTaskRefresh) {
      setGoalError('새로고침은 한 번만 사용할 수 있어요.');
      return;
    }

    const refreshCandidates = dailyPlans.flatMap((plan) => {
      if (plan.goalId !== selectedGoal.id || isPlanExpired(plan)) {
        return [];
      }

      return plan.tasks
        .filter((task) => !task.done)
        .map((task) => ({ planId: plan.id, taskId: task.id }));
    });

    if (refreshCandidates.length === 0) {
      setGoalError('새로고침할 미완료 할 일이 없어요.');
      return;
    }

    const target =
      refreshCandidates[Math.floor(Math.random() * refreshCandidates.length)];
    const excludedTaskTitles = getExcludedTaskTitles(dailyPlans, selectedGoal.id);

    setIsGeneratingPlan(true);
    setGoalError('');

    try {
      const [replacementTask] = await generateDailyTasksForGoal(
        selectedGoal,
        excludedTaskTitles,
        1,
      );

      const nextPlans = dailyPlans.map((plan) =>
          plan.id === target.planId
            ? {
                ...plan,
                tasks: plan.tasks.map((task) =>
                  task.id === target.taskId ? replacementTask : task,
                ),
              }
            : plan,
      );

      setDailyPlans(nextPlans);
      setHasUsedTaskRefresh(true);
      persistGoalPlannerData(yearlyGoals, nextPlans, true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '할 일을 새로고침하지 못했습니다.';

      setGoalError(message);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const toggleTask = (planId: string, taskId: string) => {
    const targetPlan = dailyPlans.find((plan) => plan.id === planId);
    if (!targetPlan || !canEditPlan(targetPlan) || isLoadingGoalData || isGeneratingPlan) {
      return;
    }
    const targetTask = targetPlan.tasks.find((task) => task.id === taskId);
    const targetGoal = yearlyGoals.find((goal) => goal.id === targetPlan.goalId);
    if (!targetTask || !targetGoal) {
      return;
    }
    const shouldGrantReward = !targetTask.done && targetTask.rewardGrantedAt === null;
    const rewardGrantedAt = shouldGrantReward ? Date.now() : targetTask.rewardGrantedAt;

    const nextPlans = dailyPlans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              tasks: plan.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, done: !task.done, rewardGrantedAt }
                  : task,
              ),
            }
          : plan,
    );
    const nextRewardProgress = shouldGrantReward
      ? applyTaskReward(
          rewardProgress,
          calculateTaskReward(targetTask, targetGoal.difficulty),
        )
      : rewardProgress;

    setDailyPlans(nextPlans);
    if (shouldGrantReward) {
      setRewardProgress(nextRewardProgress);
    }
    persistGoalPlannerData(yearlyGoals, nextPlans, hasUsedTaskRefresh, nextRewardProgress);
  };

  const grantCurrencyReward = (coins: number) => {
    const nextRewardProgress = applyCurrencyReward(rewardProgress, coins);

    setRewardProgress(nextRewardProgress);
    persistGoalPlannerData(yearlyGoals, dailyPlans, hasUsedTaskRefresh, nextRewardProgress);
  };

  const grantExperienceReward = (experience: number) => {
    const nextRewardProgress = applyExperienceReward(rewardProgress, experience);

    setRewardProgress(nextRewardProgress);
    persistGoalPlannerData(yearlyGoals, dailyPlans, hasUsedTaskRefresh, nextRewardProgress);
  };

  const resetPetGrowth = () => {
    const nextRewardProgress: RewardProgress = {
      ...rewardProgress,
      experience: initialRewardProgress.experience,
      level: initialRewardProgress.level,
      stage: initialRewardProgress.stage,
      totalExperience: initialRewardProgress.totalExperience,
    };

    setRewardProgress(nextRewardProgress);
    persistGoalPlannerData(yearlyGoals, dailyPlans, hasUsedTaskRefresh, nextRewardProgress);
  };

  const spendCurrencyReward = (coins: number) => {
    const nextRewardProgress = applyCurrencySpend(rewardProgress, coins);

    if (!nextRewardProgress) {
      return false;
    }

    setRewardProgress(nextRewardProgress);
    persistGoalPlannerData(yearlyGoals, dailyPlans, hasUsedTaskRefresh, nextRewardProgress);
    return true;
  };

  return {
    addYearlyGoal,
    closeTodayTasks,
    closeYearlyGoal,
    dailyPlans,
    grantCurrencyReward,
    grantExperienceReward,
    generateAdditionalTaskForSelectedGoal,
    goalError,
    hasUsedTaskRefresh,
    isGeneratingPlan,
    isLoadingGoalData,
    isTodayTasksOpen,
    isYearlyGoalOpen,
    openTodayTasks,
    openYearlyGoal,
    openYearlyGoalFromTodayTasks,
    refreshOneIncompleteTaskForSelectedGoal,
    resetPetGrowth,
    rewardProgress,
    selectedTaskGoalId,
    setSelectedTaskGoalId,
    setYearlyGoalDifficulty,
    setYearlyGoalDraft,
    spendCurrencyReward,
    toggleTask,
    yearlyGoalDraft,
    yearlyGoalDifficulty,
    yearlyGoals,
  };
}
