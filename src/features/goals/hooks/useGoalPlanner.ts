import { useEffect, useState } from 'react';
import {
  applyCareMeterIncrease,
  applyCurrencyReward,
  applyCurrencySpend,
  applyExperienceReward,
  applyTaskReward,
  calculateTaskReward,
  initialCareMeters,
  initialRewardProgress,
} from '../../rewards/rewardSystem';
import type { CareMeterKey, CareMeterValues, RewardProgress } from '../../rewards/rewardSystem';
import { generateDailyTasksForGoal } from '../goalAiService';
import { loadGoalPlannerData, saveGoalPlannerData } from '../goalRepository';
import type { DailyPlan, GoalDifficulty, YearlyGoal } from '../types';
import { useI18n } from '../../i18n';
import {
  canEditPlan,
  duplicateClosedGoalCooldownDays,
  findDuplicateYearlyGoal,
  getExcludedTaskTitles,
  getGoalClosedAt,
  getNextMidnightTimestamp,
  getNextRoundForGoal,
  isPlanExpired,
} from '../utils';

type GenerationType = 'basic' | 'ad';

const basicDailyPlanTitle = '오늘 할 일';
const adDailyPlanTitle = '광고 보상 추가 할 일';
const maxActiveYearlyGoalCount = 3;

function isActiveYearlyGoal(goal: YearlyGoal) {
  return goal.completedAt == null && goal.abandonedAt == null;
}

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
  const { t } = useI18n();
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
  const [careMeters, setCareMeters] = useState<CareMeterValues>(initialCareMeters);
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
        setCareMeters(savedData.careMeters);
        setRewardProgress(savedData.rewardProgress);

        const goalsMissingTodayPlan = savedData.yearlyGoals.filter(
          (goal) =>
            goal.completedAt == null &&
            goal.abandonedAt == null &&
            !hasEditableBasicDailyPlan(savedData.dailyPlans, goal.id),
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
          careMeters: savedData.careMeters,
          dailyPlans: savedPlans,
          hasUsedTaskRefresh: savedData.hasUsedTaskRefresh,
          rewardProgress: savedData.rewardProgress,
          yearlyGoals: savedData.yearlyGoals,
        });
      } catch {
        if (isMounted) {
          setGoalError(t('goals.error.load'));
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
  }, [t]);

  const persistGoalPlannerData = (
    nextYearlyGoals = yearlyGoals,
    nextDailyPlans = dailyPlans,
    nextHasUsedTaskRefresh = hasUsedTaskRefresh,
    nextRewardProgress = rewardProgress,
    nextCareMeters = careMeters,
  ) => {
    saveGoalPlannerData({
      careMeters: nextCareMeters,
      dailyPlans: nextDailyPlans,
      hasUsedTaskRefresh: nextHasUsedTaskRefresh,
      rewardProgress: nextRewardProgress,
      yearlyGoals: nextYearlyGoals,
    }).catch(() => {
      setGoalError(t('goals.error.save'));
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
    const targetGoals = (goalsOverride ?? yearlyGoals).filter(
      (goal) => goal.completedAt == null && goal.abandonedAt == null,
    );
    if (targetGoals.length === 0 || isGeneratingPlan) {
      if (targetGoals.length === 0) {
        setGoalError(t('goals.error.needGoal'));
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
    } catch {
      setGoalError(t('goals.error.generate'));
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const addYearlyGoal = async () => {
    const cleanGoal = yearlyGoalDraft.trim();
    if (!cleanGoal || isGeneratingPlan) {
      return;
    }

    if (yearlyGoals.filter(isActiveYearlyGoal).length >= maxActiveYearlyGoalCount) {
      setGoalError(t('goals.error.maxYearlyGoals', {
        count: maxActiveYearlyGoalCount,
      }));
      return;
    }

    const duplicateGoal = findDuplicateYearlyGoal(yearlyGoals, cleanGoal);
    if (duplicateGoal) {
      const closedAt = getGoalClosedAt(duplicateGoal);
      setGoalError(closedAt == null
        ? t('goals.error.duplicateActive', { title: duplicateGoal.title })
        : t('goals.error.duplicateClosed', {
          days: duplicateClosedGoalCooldownDays,
          title: duplicateGoal.title,
        }));
      return;
    }

    const createdAt = Date.now();
    const nextGoal: YearlyGoal = {
      createdAt,
      difficulty: yearlyGoalDifficulty,
      id: `${createdAt}`,
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
    if (!selectedGoal || selectedGoal.completedAt != null || selectedGoal.abandonedAt != null) {
      return;
    }

    await generateDailyPlan([selectedGoal], 'ad');
  };

  const generateBasicTasksForSelectedGoal = async () => {
    const selectedGoal = yearlyGoals.find((goal) => goal.id === selectedTaskGoalId);
    if (!selectedGoal || selectedGoal.completedAt != null || selectedGoal.abandonedAt != null) {
      return;
    }

    await generateDailyPlan([selectedGoal], 'basic');
  };

  const refreshOneIncompleteTaskForSelectedGoal = async () => {
    const selectedGoal = yearlyGoals.find((goal) => goal.id === selectedTaskGoalId);
    if (!selectedGoal || selectedGoal.completedAt != null || selectedGoal.abandonedAt != null || isGeneratingPlan) {
      return;
    }

    if (hasUsedTaskRefresh) {
      setGoalError(t('goals.error.refreshUsed'));
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
      setGoalError(t('goals.error.noRefreshableTask'));
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
    } catch {
      setGoalError(t('goals.error.refreshFailed'));
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
    if (!targetTask || !targetGoal || targetGoal.completedAt != null || targetGoal.abandonedAt != null) {
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

  const toggleYearlyGoalCompletion = (goalId: string) => {
    if (isLoadingGoalData || isGeneratingPlan) return;
    const nextGoals = yearlyGoals.map((goal) => goal.id === goalId
      ? { ...goal, abandonedAt: null, completedAt: goal.completedAt == null ? Date.now() : null }
      : goal);
    setYearlyGoals(nextGoals);
    setGoalError('');
    setSelectedTaskGoalId(null);
    persistGoalPlannerData(nextGoals);
  };

  const abandonYearlyGoal = (goalId: string) => {
    if (isLoadingGoalData || isGeneratingPlan) return;
    const nextGoals = yearlyGoals.map((goal) => goal.id === goalId
      ? { ...goal, abandonedAt: Date.now(), completedAt: null }
      : goal);
    setYearlyGoals(nextGoals);
    setGoalError('');
    setSelectedTaskGoalId(null);
    persistGoalPlannerData(nextGoals);
  };

  const activeYearlyGoals = yearlyGoals.filter(isActiveYearlyGoal);
  const activeDailyPlans = dailyPlans.filter((plan) =>
    activeYearlyGoals.some((goal) => goal.id === plan.goalId));

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

  const fillCareMeter = (meter: CareMeterKey, increase?: number) => {
    const nextCareMeters = applyCareMeterIncrease(careMeters, meter, increase);

    setCareMeters(nextCareMeters);
    persistGoalPlannerData(yearlyGoals, dailyPlans, hasUsedTaskRefresh, rewardProgress, nextCareMeters);
  };

  const resetCareMeters = () => {
    setCareMeters(initialCareMeters);
    persistGoalPlannerData(yearlyGoals, dailyPlans, hasUsedTaskRefresh, rewardProgress, initialCareMeters);
  };

  const resetPetStatus = () => {
    const nextRewardProgress: RewardProgress = {
      ...rewardProgress,
      experience: initialRewardProgress.experience,
      level: initialRewardProgress.level,
      stage: initialRewardProgress.stage,
      totalExperience: initialRewardProgress.totalExperience,
    };

    setCareMeters(initialCareMeters);
    setRewardProgress(nextRewardProgress);
    persistGoalPlannerData(
      yearlyGoals,
      dailyPlans,
      hasUsedTaskRefresh,
      nextRewardProgress,
      initialCareMeters,
    );
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
    abandonYearlyGoal,
    activeYearlyGoals,
    activeDailyPlans,
    toggleYearlyGoalCompletion,
    addYearlyGoal,
    careMeters,
    closeTodayTasks,
    closeYearlyGoal,
    dailyPlans,
    fillCareMeter,
    grantCurrencyReward,
    grantExperienceReward,
    generateAdditionalTaskForSelectedGoal,
    generateBasicTasksForSelectedGoal,
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
    resetCareMeters,
    resetPetStatus,
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
