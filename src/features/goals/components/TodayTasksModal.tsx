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
import { calculateTaskReward } from '../../rewards/rewardSystem';
import { DailyPlan, DailyTask, goalDifficultyLabels, YearlyGoal } from '../types';
import { isPlanExpired } from '../utils';

const pixelFontFamily = 'Galmuri11';

type TodayTasksModalProps = {
  errorMessage: string;
  hasUsedTaskRefresh: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onOpenGoal: () => void;
  onRefreshOneTask: () => void;
  onSelectGoal: (goalId: string | null) => void;
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
  onClose,
  onGenerate,
  onOpenGoal,
  onRefreshOneTask,
  onSelectGoal,
  onToggleTask,
  plans,
  selectedGoalId,
  visible,
  width,
  yearlyGoals,
}: TodayTasksModalProps) {
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
                <Text style={styles.simpleModalTitle}>오늘 할 일</Text>
                <Text style={styles.goalSummaryText}>
                  {showGoalList
                    ? '올해 목표를 선택해 할 일을 확인하세요.'
                    : `[${goalDifficultyLabels[selectedGoal.difficulty]}] ${selectedGoal.title}`}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="오늘 할 일 닫기"
                accessibilityRole="button"
                onPress={onClose}
                style={styles.smallCloseButton}
              >
                <Text style={styles.smallCloseText}>x</Text>
              </Pressable>
            </View>

            <View style={styles.modalActionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={showGoalList ? onOpenGoal : () => onSelectGoal(null)}
                style={styles.secondaryModalButton}
              >
                <Text style={styles.secondaryModalButtonText}>
                  {showGoalList ? '올해 목표' : '목록으로'}
                </Text>
              </Pressable>
              {!showGoalList && selectedGoalPlans.length === 0 ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={!selectedGoal || isGenerating}
                  onPress={onGenerate}
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
                    <Text style={styles.primaryModalButtonText}>오늘 할 일 생성</Text>
                  )}
                </Pressable>
              ) : null}
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
              {showGoalList ? (
                yearlyGoals.length === 0 ? (
                  <Text style={styles.emptyTasksText}>
                    아직 목표가 없어요. 올해 목표를 먼저 추가해 보세요.
                  </Text>
                ) : (
                  yearlyGoals.map((goal) => (
                    <GoalTaskSummary
                      goal={goal}
                      key={goal.id}
                      onPress={() => onSelectGoal(goal.id)}
                      plans={plans}
                    />
                  ))
                )
              ) : selectedGoalPlans.length === 0 ? (
                <Text style={styles.emptyTasksText}>
                  아직 이 목표의 할 일이 없어요. 오늘 할 일을 생성해 보세요.
                </Text>
              ) : (
                selectedGoalPlans.map((plan) => (
                  <PlanSummary
                    key={plan.id}
                    onPress={() => setSelectedPlanId(plan.id)}
                    plan={plan}
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
}: {
  goal: YearlyGoal;
  onPress: () => void;
  plans: DailyPlan[];
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
            {goalDifficultyLabels[goal.difficulty]}
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
  onPress,
  plan,
}: {
  onPress: () => void;
  plan: DailyPlan;
}) {
  const completedTasks = plan.tasks.filter((task) => task.done).length;

  return (
    <Pressable
      accessibilityLabel={`${plan.round}회차 ${isPlanExpired(plan) ? '만료됨' : '오늘'}, ${plan.title}, ${completedTasks}개 완료`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.planBlock}
    >
      <View style={styles.planSummaryHeader}>
        <View style={styles.planSummaryTextWrap}>
          <Text style={styles.planRoundText}>
            {plan.round}회차 {isPlanExpired(plan) ? '만료됨' : '오늘'}
          </Text>
          <Text style={styles.planTitleText}>{plan.title}</Text>
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
  width: number;
}) {
  const isExpired = isPlanExpired(plan);

  return (
    <View style={styles.detailLayer}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.detailBackdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.tasksModalFrame, { width }]}>
        <View style={styles.tasksModalPanel}>
          <View style={styles.tasksHeader}>
            <View style={styles.tasksHeaderTextWrap}>
              <Text style={styles.simpleModalTitle}>{plan.title}</Text>
              <Text style={styles.goalSummaryText}>
                {plan.round}회차 {isExpired ? '만료됨' : '오늘'}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="할 일 팝업 닫기"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.smallCloseButton}
            >
              <Text style={styles.smallCloseText}>x</Text>
            </Pressable>
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
              <Text style={styles.secondaryModalButtonText}>새로고침</Text>
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
                <Text style={styles.primaryModalButtonText}>광고 보고 추가 생성</Text>
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
}: {
  disabled: boolean;
  goalDifficulty: YearlyGoal['difficulty'];
  onPress: () => void;
  task: DailyTask;
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
          +{reward.experience} EXP · +{reward.coins} 골드
        </Text>
        <Text style={styles.taskDescriptionText}>{task.description}</Text>
        {disabled ? <Text style={styles.expiredText}>기한이 지나 완료할 수 없어요.</Text> : null}
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
