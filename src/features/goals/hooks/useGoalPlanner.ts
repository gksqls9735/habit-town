import { useState } from 'react';
import { generateDailyTasksForGoal } from '../goalAiService';
import { DailyPlan, YearlyGoal } from '../types';
import {
  getCompletedNonRepeatableTaskTitles,
  getNextMidnightTimestamp,
  getNextRoundForGoal,
  isPlanExpired,
} from '../utils';

type GenerationType = 'basic' | 'ad';

export function useGoalPlanner() {
  const [isTodayTasksOpen, setIsTodayTasksOpen] = useState(false);
  const [isYearlyGoalOpen, setIsYearlyGoalOpen] = useState(false);
  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[]>([]);
  const [yearlyGoalDraft, setYearlyGoalDraft] = useState('');
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [expandedPlanIds, setExpandedPlanIds] = useState<string[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [goalError, setGoalError] = useState('');
  const [hasUsedTaskRefresh, setHasUsedTaskRefresh] = useState(false);
  const [selectedTaskGoalId, setSelectedTaskGoalId] = useState<string | null>(null);

  const openTodayTasks = () => {
    setSelectedTaskGoalId(null);
    setIsTodayTasksOpen(true);
  };

  const closeTodayTasks = () => {
    setIsTodayTasksOpen(false);
  };

  const openYearlyGoal = () => {
    setYearlyGoalDraft('');
    setIsYearlyGoalOpen(true);
  };

  const closeYearlyGoal = () => {
    setIsYearlyGoalOpen(false);
  };

  const openYearlyGoalFromTodayTasks = () => {
    setYearlyGoalDraft('');
    setIsTodayTasksOpen(false);
    setIsYearlyGoalOpen(true);
  };

  const generateDailyPlan = async (
    goalsOverride?: YearlyGoal[],
    generationType: GenerationType = 'ad',
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
      const nextTasks = await Promise.all(
        targetGoals.map((goal) =>
          generateDailyTasksForGoal(
            goal,
            getCompletedNonRepeatableTaskTitles(dailyPlans, goal.id),
            generationType === 'basic' ? 3 : 1,
          ),
        ),
      );
      const nextPlans = targetGoals.map((goal, index) => {
        const generatedAt = Date.now() + index;
        return {
          expiresAt: getNextMidnightTimestamp(generatedAt),
          generatedAt,
          goalId: goal.id,
          goalTitle: goal.title,
          id: `${generatedAt}-${goal.id}`,
          round: getNextRoundForGoal(dailyPlans, goal.id),
          tasks: nextTasks[index],
          title: generationType === 'basic' ? '오늘 할 일' : '광고 보상 추가 할 일',
        };
      });

      setDailyPlans((currentPlans) => [...nextPlans, ...currentPlans]);
      setExpandedPlanIds((currentIds) => [
        ...nextPlans.map((plan) => plan.id),
        ...currentIds,
      ]);
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
      id: `${Date.now()}`,
      title: cleanGoal,
    };

    setYearlyGoals((currentGoals) => [...currentGoals, nextGoal]);
    setGoalError('');
    setYearlyGoalDraft('');
    setIsYearlyGoalOpen(false);
    setSelectedTaskGoalId(nextGoal.id);
    await generateDailyPlan([nextGoal], 'basic');
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
    const existingTaskTitles = dailyPlans
      .filter((plan) => plan.goalId === selectedGoal.id)
      .flatMap((plan) => plan.tasks.map((task) => task.title));
    const excludedTaskTitles = Array.from(
      new Set([
        ...getCompletedNonRepeatableTaskTitles(dailyPlans, selectedGoal.id),
        ...existingTaskTitles,
      ]),
    );

    setIsGeneratingPlan(true);
    setGoalError('');

    try {
      const [replacementTask] = await generateDailyTasksForGoal(
        selectedGoal,
        excludedTaskTitles,
        1,
      );

      setDailyPlans((currentPlans) =>
        currentPlans.map((plan) =>
          plan.id === target.planId
            ? {
                ...plan,
                tasks: plan.tasks.map((task) =>
                  task.id === target.taskId ? replacementTask : task,
                ),
              }
            : plan,
        ),
      );
      setHasUsedTaskRefresh(true);
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
    if (!targetPlan || isPlanExpired(targetPlan)) {
      return;
    }

    setDailyPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              tasks: plan.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task,
              ),
            }
          : plan,
      ),
    );
  };

  const togglePlanExpanded = (planId: string) => {
    setExpandedPlanIds((currentIds) =>
      currentIds.includes(planId)
        ? currentIds.filter((id) => id !== planId)
        : [...currentIds, planId],
    );
  };

  return {
    addYearlyGoal,
    closeTodayTasks,
    closeYearlyGoal,
    dailyPlans,
    expandedPlanIds,
    generateAdditionalTaskForSelectedGoal,
    goalError,
    hasUsedTaskRefresh,
    isGeneratingPlan,
    isTodayTasksOpen,
    isYearlyGoalOpen,
    openTodayTasks,
    openYearlyGoal,
    openYearlyGoalFromTodayTasks,
    refreshOneIncompleteTaskForSelectedGoal,
    selectedTaskGoalId,
    setSelectedTaskGoalId,
    setYearlyGoalDraft,
    togglePlanExpanded,
    toggleTask,
    yearlyGoalDraft,
    yearlyGoals,
  };
}
