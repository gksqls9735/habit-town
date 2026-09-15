import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { PopupCloseButton } from '../../../components/common/PopupCloseButton';
import { useI18n } from '../../i18n';
import { calculateTaskReward } from '../../rewards/rewardSystem';
import { DailyPlan, DailyTask, YearlyGoal } from '../types';
import { isPlanExpired } from '../utils';

const pixelFontFamily = 'Galmuri11';

function getPlanDisplayTitle(plan: DailyPlan, language: string) {
  const date = new Date(plan.generatedAt);
  if (language === 'en') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

type TodayTasksModalProps = {
  errorMessage: string;
  hasUsedTaskRefresh: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onAbandonGoal: (goalId: string) => void;
  onGenerate: () => void;
  onGenerateTodayTasks: () => void;
  onOpenGoal: () => void;
  onRefreshOneTask: () => void;
  onSelectGoal: (goalId: string | null) => void;
  onToggleGoalCompletion: (goalId: string) => void;
  onToggleTask: (planId: string, taskId: string) => void;
  plans: DailyPlan[];
  selectedGoalId: string | null;
  visible: boolean;
  width: number;
  yearlyGoals: YearlyGoal[];
};

export function TodayTasksModal({
  errorMessage,
  hasUsedTaskRefresh,
  isGenerating,
  onAbandonGoal,
  onClose,
  onGenerate,
  onGenerateTodayTasks,
  onOpenGoal,
  onRefreshOneTask,
  onSelectGoal,
  onToggleGoalCompletion,
  onToggleTask,
  plans,
  selectedGoalId,
  visible,
  width,
  yearlyGoals,
}: TodayTasksModalProps) {
  const { language, t } = useI18n();
  const selectedGoal =
    yearlyGoals.find((goal) => goal.id === selectedGoalId) ?? null;
  const selectedGoalPlans = selectedGoal
    ? plans.filter((plan) => plan.goalId === selectedGoal.id)
    : [];
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const selectedPlan = useMemo(
    () => selectedGoalPlans.find((plan) => plan.id === selectedPlanId) ?? null,
    [selectedGoalPlans, selectedPlanId],
  );
  const hasRefreshableTask = selectedGoalPlans.some(
    (plan) => !isPlanExpired(plan) && plan.tasks.some((task) => !task.done),
  );
  const hasCurrentSelectedGoalPlan = selectedGoalPlans.some((plan) => !isPlanExpired(plan));
  const showGoalList = !selectedGoal;

  useEffect(() => {
    setSelectedPlanId(null);
  }, [selectedGoalId, visible]);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.modalLayer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.tasksModalFrame, { width }]}>
          <View style={styles.tasksModalPanel}>
            <View style={styles.tasksHeader}>
              <View style={styles.tasksHeaderTextWrap}>
                <Text style={styles.simpleModalTitle}>{t('tasks.title')}</Text>
                <Text style={styles.goalSummaryText}>
                  {showGoalList
                    ? t('tasks.instructions')
                    : t('tasks.goalSummary', {
                      difficulty: t(`difficulty.${selectedGoal.difficulty}`),
                      title: selectedGoal.title,
                    })}
                </Text>
              </View>
              <PopupCloseButton
                accessibilityLabel={t('tasks.close')}
                onPress={onClose}
              />
            </View>

            <View style={styles.modalActionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={showGoalList ? onOpenGoal : () => onSelectGoal(null)}
                style={styles.secondaryModalButton}
              >
                <Text style={styles.secondaryModalButtonText}>
                  {showGoalList ? t('tasks.goalListButton') : t('actions.backToList')}
                </Text>
              </Pressable>
              {!showGoalList && selectedGoalPlans.length === 0 ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={!selectedGoal || isGenerating}
                  onPress={onGenerateTodayTasks}
                  style={[
                    styles.primaryModalButton,
                    (!selectedGoal || isGenerating)
                      ? styles.disabledModalButton
                      : null,
                  ]}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#fff8ea" />
                  ) : (
                    <Text style={styles.primaryModalButtonText}>{t('actions.generateTodayTasks')}</Text>
                  )}
                </Pressable>
              ) : null}
              {!showGoalList ? (
                <Pressable
                  accessibilityLabel={t('goal.abandonA11y', { title: selectedGoal.title })}
                  accessibilityRole="button"
                  disabled={isGenerating}
                  onPress={() => onAbandonGoal(selectedGoal.id)}
                  style={[
                    styles.goalAbandonButton,
                    isGenerating ? styles.disabledModalButton : null,
                  ]}
                >
                  <Text style={styles.goalAbandonButtonText}>{t('goal.abandon')}</Text>
                </Pressable>
              ) : null}
              {!showGoalList ? (
                <Pressable
                  accessibilityLabel={t('goal.completeA11y', { title: selectedGoal.title })}
                  accessibilityRole="button"
                  disabled={isGenerating}
                  onPress={() => onToggleGoalCompletion(selectedGoal.id)}
                  style={[
                    styles.goalCompleteButton,
                    isGenerating ? styles.disabledModalButton : null,
                  ]}
                >
                  <Text style={styles.goalCompleteButtonText}>{t('goal.complete')}</Text>
                </Pressable>
              ) : null}
            </View>

            {errorMessage ? (
              <Text style={styles.goalErrorText}>{errorMessage}</Text>
            ) : null}
            {!showGoalList && selectedGoalPlans.length > 0 && !hasCurrentSelectedGoalPlan ? (
              <Pressable
                accessibilityRole="button"
                disabled={isGenerating}
                onPress={onGenerateTodayTasks}
                style={[
                  styles.retryGenerateButton,
                  isGenerating ? styles.disabledModalButton : null,
                ]}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff8ea" />
                ) : (
                  <Text style={styles.primaryModalButtonText}>오늘 할 일 다시 생성</Text>
                )}
              </Pressable>
            ) : null}

            <ScrollView
              contentContainerStyle={styles.taskListContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.taskListScroll}
            >
              {showGoalList ? (
                yearlyGoals.length === 0 ? (
                  <Text style={styles.emptyTasksText}>
                    {t('tasks.emptyGoalList')}
                  </Text>
                ) : (
                  yearlyGoals.map((goal) => (
                    <GoalTaskSummary
                      goal={goal}
                      key={goal.id}
                      onPress={() => onSelectGoal(goal.id)}
                      plans={plans}
                      t={t}
                    />
                  ))
                )
              ) : selectedGoalPlans.length === 0 ? (
                <Text style={styles.emptyTasksText}>
                  {t('tasks.emptySelectedGoal')}
                </Text>
              ) : (
                selectedGoalPlans.map((plan) => (
                  <PlanSummary
                    key={plan.id}
                    language={language}
                    onPress={() => setSelectedPlanId(plan.id)}
                    plan={plan}
                    t={t}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </View>
        {selectedGoal && selectedPlan ? (
          <TaskDetailPopup
            errorMessage={errorMessage}
            goalDifficulty={selectedGoal.difficulty}
            hasRefreshableTask={hasRefreshableTask}
            hasUsedTaskRefresh={hasUsedTaskRefresh}
            isGenerating={isGenerating}
            onClose={() => setSelectedPlanId(null)}
            onGenerate={onGenerate}
            onRefreshOneTask={onRefreshOneTask}
            onToggleTask={onToggleTask}
            plan={selectedPlan}
            language={language}
            t={t}
            width={width}
          />
        ) : null}
      </View>
    </Modal>
  );
}

function GoalTaskSummary({
  goal,
  onPress,
  plans,
  t,
}: {
  goal: YearlyGoal;
  onPress: () => void;
  plans: DailyPlan[];
  t: (key: string, params?: Record<string, number | string>) => string;
}) {
  const goalPlans = plans.filter((plan) => plan.goalId === goal.id);
  const totalTasks = goalPlans.reduce((count, plan) => count + plan.tasks.length, 0);
  const completedTasks = goalPlans.reduce(
    (count, plan) => count + plan.tasks.filter((task) => task.done).length,
    0,
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.goalSummaryCard}
    >
      <View style={styles.goalSummaryHeader}>
        <Text numberOfLines={1} style={styles.goalSummaryTitle}>
          {goal.title}
        </Text>
        <View style={styles.goalSummaryMeta}>
          <Text style={styles.goalDifficultyBadge}>
            {t(`difficulty.${goal.difficulty}`)}
          </Text>
          <Text style={styles.goalSummaryCount}>
            {completedTasks} / {totalTasks}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function PlanSummary({
  language,
  onPress,
  plan,
  t,
}: {
  language: string;
  onPress: () => void;
  plan: DailyPlan;
  t: (key: string, params?: Record<string, number | string>) => string;
}) {
  const completedTasks = plan.tasks.filter((task) => task.done).length;
  const displayTitle = getPlanDisplayTitle(plan, language);
  const status = isPlanExpired(plan) ? t('tasks.expired') : t('tasks.today');

  return (
    <Pressable
      accessibilityLabel={t('tasks.planA11y', {
        completed: completedTasks,
        round: plan.round,
        status,
        title: displayTitle,
      })}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.planBlock}
    >
      <View style={styles.planSummaryHeader}>
        <View style={styles.planSummaryTextWrap}>
          <Text style={styles.planRoundText}>
            {t('tasks.roundStatus', { round: plan.round, status })}
          </Text>
          <Text style={styles.planTitleText}>{displayTitle}</Text>
        </View>
        <Text style={styles.planTaskCount}>
          {completedTasks}/{plan.tasks.length}
        </Text>
      </View>
    </Pressable>
  );
}

function TaskDetailPopup({
  errorMessage,
  goalDifficulty,
  hasRefreshableTask,
  hasUsedTaskRefresh,
  isGenerating,
  onClose,
  onGenerate,
  onRefreshOneTask,
  onToggleTask,
  plan,
  language,
  t,
  width,
}: {
  errorMessage: string;
  goalDifficulty: YearlyGoal['difficulty'];
  hasRefreshableTask: boolean;
  hasUsedTaskRefresh: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onRefreshOneTask: () => void;
  onToggleTask: (planId: string, taskId: string) => void;
  plan: DailyPlan;
  language: string;
  t: (key: string, params?: Record<string, number | string>) => string;
  width: number;
}) {
  const isExpired = isPlanExpired(plan);
  const displayTitle = getPlanDisplayTitle(plan, language);
  const status = isExpired ? t('tasks.expired') : t('tasks.today');

  return (
    <View style={styles.detailLayer}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.detailBackdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.tasksModalFrame, { width }]}>
        <View style={styles.tasksModalPanel}>
          <View style={styles.tasksHeader}>
            <View style={styles.tasksHeaderTextWrap}>
              <Text style={styles.simpleModalTitle}>{displayTitle}</Text>
              <Text style={styles.goalSummaryText}>
                {t('tasks.roundStatus', { round: plan.round, status })}
              </Text>
            </View>
            <PopupCloseButton
              accessibilityLabel={t('tasks.detailClose')}
              onPress={onClose}
            />
          </View>

          <View style={styles.modalActionRow}>
            <Pressable
              accessibilityRole="button"
              disabled={!hasRefreshableTask || hasUsedTaskRefresh || isGenerating}
              onPress={onRefreshOneTask}
              style={[
                styles.secondaryModalButton,
                (!hasRefreshableTask || hasUsedTaskRefresh || isGenerating)
                  ? styles.disabledModalButton
                  : null,
              ]}
            >
              <Text style={styles.secondaryModalButtonText}>{t('actions.refresh')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isGenerating}
              onPress={onGenerate}
              style={[
                styles.primaryModalButton,
                isGenerating ? styles.disabledModalButton : null,
              ]}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff8ea" />
              ) : (
                <Text style={styles.primaryModalButtonText}>{t('actions.generateAdditionalTaskWithAd')}</Text>
              )}
            </Pressable>
          </View>

          {errorMessage ? (
            <Text style={styles.goalErrorText}>{errorMessage}</Text>
          ) : null}

          <ScrollView
            contentContainerStyle={styles.taskListContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.taskListScroll}
          >
            {plan.tasks.map((task) => (
              <TaskRow
                disabled={isExpired}
                goalDifficulty={goalDifficulty}
                key={task.id}
                onPress={() => onToggleTask(plan.id, task.id)}
                task={task}
                t={t}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

function TaskRow({
  disabled,
  goalDifficulty,
  onPress,
  task,
  t,
}: {
  disabled: boolean;
  goalDifficulty: YearlyGoal['difficulty'];
  onPress: () => void;
  task: DailyTask;
  t: (key: string, params?: Record<string, number | string>) => string;
}) {
  const reward = calculateTaskReward(task, goalDifficulty);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.taskRow,
        task.done ? styles.taskRowDone : null,
        disabled ? styles.taskRowExpired : null,
      ]}
    >
      <View style={[styles.taskCheckBox, task.done ? styles.taskCheckBoxDone : null]}>
        <Text style={styles.taskCheckText}>{task.done ? '✓' : ''}</Text>
      </View>
      <View style={styles.taskTextWrap}>
        <Text style={styles.taskGoalText}>{task.goalTitle}</Text>
        <Text style={styles.taskTitleText}>{task.title}</Text>
        <Text style={styles.taskRewardText}>
          {t('tasks.adReward', { coins: reward.coins, experience: reward.experience })}
        </Text>
        <Text style={styles.taskDescriptionText}>{task.description}</Text>
        {disabled ? <Text style={styles.expiredText}>{t('tasks.expiredCannotComplete')}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 40,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(49, 42, 35, 0.58)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  detailLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 50,
  },
  detailBackdrop: {
    backgroundColor: 'rgba(49, 42, 35, 0.32)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tasksModalFrame: {
    maxHeight: '86%',
  },
  tasksModalPanel: {
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    maxHeight: '100%',
    padding: 14,
  },
  simpleModalTitle: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tasksHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tasksHeaderTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  goalSummaryText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 17,
    marginTop: 5,
  },
  smallCloseButton: {
    alignItems: 'center',
    backgroundColor: '#ffd99e',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  smallCloseText: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  secondaryModalButton: {
    alignItems: 'center',
    backgroundColor: '#ead4ad',
    borderColor: '#6b432f',
    borderWidth: 2,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  primaryModalButton: {
    alignItems: 'center',
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    borderWidth: 2,
    flex: 1.5,
    height: 42,
    justifyContent: 'center',
  },
  retryGenerateButton: {
    alignItems: 'center',
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    marginTop: 10,
  },
  goalCompleteButton: {
    alignItems: 'center',
    backgroundColor: '#6f8d48',
    borderColor: '#425a2c',
    borderWidth: 2,
    flex: 1.1,
    height: 42,
    justifyContent: 'center',
  },
  goalAbandonButton: {
    alignItems: 'center',
    backgroundColor: '#b85b49',
    borderColor: '#7f352c',
    borderWidth: 2,
    flex: 1.1,
    height: 42,
    justifyContent: 'center',
  },
  disabledModalButton: {
    opacity: 0.5,
  },
  secondaryModalButtonText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  primaryModalButtonText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  goalCompleteButtonText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  goalAbandonButtonText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  goalErrorText: {
    color: '#c34834',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 17,
    marginTop: 10,
  },
  taskListScroll: {
    marginTop: 12,
    maxHeight: 430,
  },
  taskListContent: {
    paddingBottom: 4,
  },
  emptyTasksText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
    paddingVertical: 20,
    textAlign: 'center',
  },
  goalSummaryCard: {
    backgroundColor: '#fff0cc',
    borderColor: '#6b432f',
    borderWidth: 2,
    marginBottom: 10,
    padding: 10,
  },
  goalSummaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  goalSummaryTitle: {
    color: '#35281f',
    flex: 1,
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
  },
  goalSummaryCount: {
    color: '#8f5e33',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 17,
  },
  goalSummaryMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  goalDifficultyBadge: {
    backgroundColor: '#ead4ad',
    borderColor: '#d7a36d',
    borderWidth: 1,
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 15,
    minWidth: 22,
    textAlign: 'center',
  },
  planBlock: {
    backgroundColor: '#fff0cc',
    borderColor: '#6b432f',
    borderWidth: 2,
    marginBottom: 12,
    padding: 10,
  },
  planSummaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  planSummaryTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  planRoundText: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  planTitleText: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 4,
  },
  planTaskCount: {
    color: '#8f5e33',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 17,
  },
  taskRow: {
    alignItems: 'flex-start',
    borderTopColor: '#d7a36d',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 9,
  },
  taskRowDone: {
    opacity: 0.58,
  },
  taskRowExpired: {
    opacity: 0.45,
  },
  taskCheckBox: {
    alignItems: 'center',
    backgroundColor: '#fff8ea',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginTop: 1,
    width: 24,
  },
  taskCheckBoxDone: {
    backgroundColor: '#8bbf6a',
  },
  taskCheckText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  taskTextWrap: {
    flex: 1,
  },
  taskGoalText: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 3,
  },
  taskTitleText: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 17,
  },
  taskRewardText: {
    color: '#9a6b36',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 14,
    marginTop: 4,
  },
  taskDescriptionText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 15,
    marginTop: 3,
  },
  expiredText: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 4,
  },
});
