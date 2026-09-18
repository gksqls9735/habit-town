import { useEffect, useMemo, useState } from 'react';
import { AppState, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PopupCloseButton } from '../../../components/common/PopupCloseButton';
import { DailyPlan, YearlyGoal } from '../../goals/types';
import { canEditPlan, getLocalDateKey, getNextMidnightTimestamp } from '../../goals/utils';
import { calendarLocales, useI18n } from '../../i18n';
import type { AppLanguage, Translate } from '../../i18n';
import { CalendarRecord, getCalendarHistory } from '../calendarHistory';

LocaleConfig.locales.en = calendarLocales.en;
LocaleConfig.locales.ko = calendarLocales.ko;
LocaleConfig.defaultLocale = 'ko';

const fontFamily = 'Galmuri11';
const theme = {
  calendarBackground: '#fff8ea',
  textSectionTitleColor: '#786453',
  textDayHeaderFontFamily: fontFamily,
  textDayHeaderFontSize: 12,
  textMonthFontFamily: fontFamily,
  textMonthFontSize: 18,
  monthTextColor: '#35281f',
  arrowColor: '#6b432f',
  textDisabledColor: 'transparent',
  'stylesheet.calendar.header': {
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: 8,
      paddingRight: 8,
      marginTop: 2,
      marginBottom: 18,
    },
    week: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 0,
      marginBottom: 14,
      paddingHorizontal: 2,
    },
    dayHeader: {
      color: '#786453',
      fontFamily,
      fontSize: 12,
      textAlign: 'center',
      width: 38,
    },
    dayTextAtIndex0: { color: '#d96d64' },
    dayTextAtIndex6: { color: '#5d88be' },
  },
  'stylesheet.calendar.main': {
    container: {
      paddingLeft: 0,
      paddingRight: 0,
      backgroundColor: '#fff8ea',
    },
    week: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 3,
    },
    monthView: {
      backgroundColor: '#fff8ea',
    },
  },
};

function formatLocalizedDate(timestamp: number, language: AppLanguage) {
  return new Date(timestamp).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Shares task history and completion actions with the home task planner. */
export function CalendarModal({ onClose, plans, yearlyGoals, onToggleTask, isLoading, isBusy, errorMessage }: {
  onClose: () => void;
  plans: DailyPlan[];
  yearlyGoals: YearlyGoal[];
  onToggleTask: (planId: string, taskId: string) => void;
  isLoading: boolean;
  isBusy: boolean;
  errorMessage: string;
}) {
  const { language, t } = useI18n();
  LocaleConfig.defaultLocale = language;
  const [now, setNow] = useState(Date.now);
  const today = getLocalDateKey(now);
  const [selected, setSelected] = useState(today);
  const [calendarKey, setCalendarKey] = useState(0);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [goalHistoryOpen, setGoalHistoryOpen] = useState(false);
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [year, month, day] = selected.split('-').map(Number);
  const history = useMemo(() => getCalendarHistory(plans, yearlyGoals), [plans, yearlyGoals]);
  const record = history[selected];
  const goalsById = useMemo(
    () => new Map(yearlyGoals.map((goal) => [goal.id, goal])),
    [yearlyGoals],
  );
  const hasTasks = !!record?.total;
  const completedGoals = record?.completedGoals ?? [];
  const hasCompletedGoals = completedGoals.length > 0;
  const completedGoalCount = yearlyGoals.filter((goal) => goal.completedAt != null).length;
  const abandonedGoalCount = yearlyGoals.filter((goal) => goal.abandonedAt != null).length;
  const activeGoalCount = yearlyGoals.length - completedGoalCount - abandonedGoalCount;
  const selectedStatus = selected === today
    ? t('calendar.today')
    : selected < today
      ? t('calendar.statusPast')
      : t('calendar.statusFuture');
  const sortedGoals = useMemo(
    () => [...yearlyGoals].sort((left, right) => {
      const leftDate = left.completedAt ?? left.abandonedAt ?? left.createdAt;
      const rightDate = right.completedAt ?? right.abandonedAt ?? right.createdAt;
      return rightDate - leftDate;
    }),
    [yearlyGoals],
  );

  // Refresh editability at midnight and when returning from the background.
  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), Math.max(1, getNextMidnightTimestamp(now) - Date.now()));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, [now]);

  /** Returns both the visible month and selection to the current local day. */
  const showToday = () => {
    const current = Date.now();
    setNow(current);
    setSelected(getLocalDateKey(current));
    setCalendarKey((value) => value + 1);
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <Pressable accessibilityLabel={t('calendar.close')} onPress={onClose} style={styles.backdrop} />
        <View style={styles.frame} accessibilityViewIsModal>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{t('calendar.eyebrow')}</Text>
              <Text style={styles.title}>{t('calendar.title')}</Text>
            </View>
            <PopupCloseButton accessibilityLabel={t('calendar.close')} onPress={onClose} />
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.toolbar}>
              <View style={styles.toolbarCopy}>
                <Text style={styles.subtitle}>{t('calendar.selectedDate', { month, day })}</Text>
                <Text style={styles.subtitleMuted}>{t('calendar.subtitle')}</Text>
              </View>
              <View style={styles.toolbarActions}>
                <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.goalHistoryOpen')}
                  onPress={() => setGoalHistoryOpen(true)}
                  style={({ pressed }) => [styles.goalHistoryButton, pressed && styles.pressed]}>
                  <Text style={styles.goalHistoryButtonText}>{t('calendar.journey')}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={showToday}
                  style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}>
                  <Text style={styles.todayButtonText}>{t('calendar.todayButton')}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.toggle')}
                  accessibilityState={{ expanded: calendarExpanded }}
                  onPress={() => setCalendarExpanded((value) => !value)}
                  style={({ pressed }) => [styles.calendarToggleButton, pressed && styles.pressed]}>
                  <Text style={styles.calendarToggleText}>
                    {calendarExpanded ? t('calendar.toggleCollapse') : t('calendar.toggleExpand')}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.calendarPanel, !calendarExpanded && styles.collapsed]}>
            <Calendar
              key={calendarKey}
              initialDate={today}
              monthFormat={t('calendar.monthFormat')}
              theme={theme}
              style={styles.calendar}
              hideExtraDays
              disableAllTouchEventsForDisabledDays
              accessibilityLabel={t('calendar.calendar')}
              dayComponent={({ date, state }) => (
                <CalendarDay date={date} hidden={state === 'disabled'} selected={selected}
                  today={today} onSelect={setSelected} record={isLoading ? undefined : history[date?.dateString ?? '']}
                  t={t} />
              )}
              renderHeader={(date) => {
                const monthDate = date?.toString('yyyy-M').split('-').map(Number);
                return (
                  <Text style={styles.monthTitle}>
                    {monthDate ? t('calendar.monthTitle', { year: monthDate[0], month: monthDate[1] }) : ''}
                  </Text>
                );
              }}
              renderArrow={(direction) => <Text style={styles.arrow}>{direction === 'left' ? '‹' : '›'}</Text>}
            />
            <View style={styles.legend}>
              <View style={styles.legendItem}><View style={styles.todaySwatch} /><Text style={styles.legendText}>{t('calendar.legendToday')}</Text></View>
              <View style={styles.legendItem}><View style={styles.selectedSwatch} /><Text style={styles.legendText}>{t('calendar.legendSelected')}</Text></View>
              <View style={styles.legendItem}><Text style={styles.completeMark}>✓</Text><Text style={styles.legendText}>{t('calendar.legendCompleted')}</Text></View>
              <View style={styles.legendItem}><Text style={styles.goalLegendMark}>★</Text><Text style={styles.legendText}>{t('calendar.legendGoal')}</Text></View>
            </View>
            </View>
            <View style={styles.detail}>
              <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.taskListToggle')}
                accessibilityState={{ expanded: tasksExpanded }}
                onPress={() => setTasksExpanded((value) => !value)}
                style={({ pressed }) => [styles.sectionToggle, pressed && styles.pressed]}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.dateTitle}>{t('calendar.dateTasksTitle', { month, day })}</Text>
                  <Text style={styles.dateStatus}>{selectedStatus}</Text>
                </View>
                <Text style={styles.toggleLabel}>{tasksExpanded ? t('calendar.toggleCollapse') : t('calendar.toggleExpand')}</Text>
              </Pressable>
              {errorMessage ? <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text> : null}
              {isLoading ? <Text style={styles.emptyTitle}>{t('calendar.loading')}</Text>
                : record?.total ? <>
                  <Text accessibilityLiveRegion="polite" style={styles.summary}>
                    {t('calendar.totalSummary', {
                      completed: record.completed,
                      total: record.total,
                      suffix: record.completed === record.total ? t('calendar.allDone') : '',
                    })}
                  </Text>
                  {tasksExpanded ? <>
                  {hasCompletedGoals ? <CompletedGoalList goals={completedGoals} hasTasks={hasTasks} t={t} /> : null}
                  {selected < today ? <Text style={styles.readOnly}>{t('calendar.readOnlyPast')}</Text> : null}
                  {record.tasks.map(({ plan, task }) => {
                    const goal = goalsById.get(plan.goalId);
                    const goalClosed = goal?.completedAt != null || goal?.abandonedAt != null;
                    const editable = canEditPlan(plan, now) && !isBusy && !goalClosed;
                    const missed = !task.done && !editable;
                    return <Pressable key={`${plan.id}-${task.id}`}
                      accessibilityRole="checkbox" accessibilityState={{ checked: task.done, disabled: !editable }}
                      accessibilityLabel={`${task.goalTitle}, ${task.title}, ${task.done ? t('calendar.taskDone') : t('calendar.unfinished')}`}
                      disabled={!editable} onPress={() => onToggleTask(plan.id, task.id)}
                      style={({ pressed }) => [styles.taskRow, pressed && styles.pressed]}>
                      <View style={[styles.checkbox, task.done && styles.checked, missed && styles.missed]}>
                        {task.done ? <Text style={styles.checkText}>✓</Text> : null}
                        {missed ? <View style={styles.missedSlash} /> : null}
                      </View>
                      <View style={styles.taskBody}>
                        <Text style={styles.taskGoal}>{task.goalTitle}</Text>
                        <Text style={[styles.taskTitle, task.done && styles.doneTitle]}>{task.title}</Text>
                        <Text style={styles.taskDescription}>{task.description}</Text>
                      </View>
                    </Pressable>;
                  })}
                  </> : null}
                </> : <>
                  {tasksExpanded && hasCompletedGoals ? <CompletedGoalList goals={completedGoals} hasTasks={hasTasks} t={t} /> : null}
                  <Text style={styles.emptyTitle}>{errorMessage ? t('calendar.emptyTitleError') : t('calendar.assignedEmpty')}</Text>
                  {tasksExpanded ? <Text style={styles.emptyDescription}>
                    {selected === today
                      ? t('calendar.emptyDescriptionToday')
                      : hasCompletedGoals
                        ? t('calendar.emptyCompletedOnly')
                        : t('calendar.emptyDescriptionFuture')}
                  </Text> : null}
                </>}
            </View>
            <Text style={styles.footnote}>{t('calendar.footnote', { year })}</Text>
          </ScrollView>
          {goalHistoryOpen ? (
            <View style={styles.goalHistoryLayer}>
              <Pressable accessibilityLabel={t('calendar.historyClose')} onPress={() => setGoalHistoryOpen(false)}
                style={styles.goalHistoryBackdrop} />
              <View style={styles.goalHistoryPanel}>
                <View style={styles.goalHistoryHeader}>
                  <View>
                    <Text style={styles.goalHistoryEyebrow}>{t('calendar.achievementEyebrow')}</Text>
                    <Text style={styles.goalHistoryTitle}>{t('calendar.goalHistory')}</Text>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.historyClose')}
                    onPress={() => setGoalHistoryOpen(false)}
                    style={({ pressed }) => [styles.goalHistoryCloseButton, pressed && styles.pressed]}>
                    <Text style={styles.closeText}>x</Text>
                  </Pressable>
                </View>
                <View style={styles.goalStatsRow}>
                  <View style={styles.goalStatBox}>
                    <Text style={styles.goalStatValue}>{completedGoalCount}</Text>
                    <Text style={styles.goalStatLabel}>{t('calendar.goalStatsCompleted')}</Text>
                  </View>
                  <View style={styles.goalStatBox}>
                    <Text style={styles.goalStatValue}>{activeGoalCount}</Text>
                    <Text style={styles.goalStatLabel}>{t('calendar.goalStatsActive')}</Text>
                  </View>
                  <View style={styles.goalStatBox}>
                    <Text style={styles.goalStatValue}>{abandonedGoalCount}</Text>
                    <Text style={styles.goalStatLabel}>{t('calendar.goalStatsAbandoned')}</Text>
                  </View>
                </View>
                <ScrollView style={styles.goalHistoryList} contentContainerStyle={styles.goalHistoryListContent}
                  nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {sortedGoals.length === 0 ? (
                    <Text style={styles.emptyDescription}>{t('calendar.emptyGoals')}</Text>
                  ) : sortedGoals.map((goal) => {
                    const isAbandoned = goal.abandonedAt != null;
                    const isCompleted = goal.completedAt != null;
                    return (
                      <View key={goal.id} style={styles.goalHistoryItem}>
                        <View style={styles.goalHistoryItemHeader}>
                          <Text style={styles.goalHistoryItemTitle}>{goal.title}</Text>
                          <Text style={[
                            styles.goalStatusBadge,
                            isCompleted && styles.goalStatusBadgeCompleted,
                            isAbandoned && styles.goalStatusBadgeAbandoned,
                          ]}>
                            {isCompleted ? t('calendar.completed') : isAbandoned ? t('calendar.abandoned') : t('calendar.active')}
                          </Text>
                        </View>
                        <Text style={styles.goalHistoryMeta}>
                          {t('calendar.goalStartedMeta', {
                            date: formatLocalizedDate(goal.createdAt, language),
                            difficulty: t(`difficulty.${goal.difficulty}`),
                          })}
                        </Text>
                        <Text style={styles.goalHistoryMeta}>
                          {isCompleted
                            ? t('calendar.goalCompletedMeta', { date: formatLocalizedDate(goal.completedAt ?? goal.createdAt, language) })
                            : isAbandoned
                              ? t('calendar.goalAbandonedMeta', { date: formatLocalizedDate(goal.abandonedAt ?? goal.createdAt, language) })
                              : t('calendar.goalStillActive')}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function CompletedGoalList({ goals, hasTasks, t }: {
  goals: YearlyGoal[];
  hasTasks: boolean;
  t: Translate;
}) {
  return (
    <View style={[styles.completedGoalSection, hasTasks && styles.completedGoalSectionWithTasks]}>
      <Text style={styles.completedGoalHeading}>{t('calendar.completedGoals')}</Text>
      {goals.map((goal) => (
        <View key={goal.id} style={styles.completedGoalRow}>
          <Text style={styles.completedGoalMark}>★</Text>
          <View style={styles.completedGoalBody}>
            <Text style={styles.completedGoalTitle}>{goal.title}</Text>
            <Text style={styles.completedGoalMeta}>
              {t(`difficulty.${goal.difficulty}`)} · {t('calendar.completedGoal')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Customizes the library's day cell while keeping date calculation in the library. */
function CalendarDay({ date, hidden, selected, today, onSelect, record, t }: {
  date?: DateData; hidden: boolean; selected: string; today: string; onSelect: (date: string) => void;
  record?: CalendarRecord;
  t: Translate;
}) {
  if (!date || hidden) return <View style={styles.emptyDay} />;
  const weekday = new Date(date.year, date.month - 1, date.day).getDay();
  const isSelected = selected === date.dateString;
  const isToday = today === date.dateString;
  const complete = !!record?.total && record.completed === record.total;
  const hasCompletedGoal = !!record?.completedGoals.length;
  const accessibilityLabel = t('calendar.dayA11y', {
    year: date.year,
    month: date.month,
    day: date.day,
    today: isToday ? `, ${t('calendar.today')}` : '',
    tasks: record?.total ? t('calendar.dayTaskCount', { completed: record.completed, total: record.total }) : '',
    complete: complete ? `, ${t('calendar.legendCompleted')}` : '',
    goals: hasCompletedGoal ? t('calendar.dayGoalCount', { count: record.completedGoals.length }) : '',
  });
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: isSelected }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onSelect(date.dateString)}
      style={({ pressed }) => [styles.day, complete && styles.completedDay, isToday && styles.todayDay, isSelected && styles.selectedDay, pressed && styles.pressed]}>
      <Text style={[styles.dayText, weekday === 0 && styles.sunday, weekday === 6 && styles.saturday]}>{date.day}</Text>
      {record?.total ? <Text numberOfLines={1} adjustsFontSizeToFit style={styles.dayCount}>{record.completed}/{record.total}</Text> : null}
      {complete ? <Text style={styles.dayCheck}>✓</Text> : null}
      {hasCompletedGoal ? <Text style={styles.goalDayMark}>★</Text> : null}
      {isToday ? <View style={styles.todayDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(49,42,35,0.58)' },
  frame: {
    width: '100%',
    maxWidth: 390,
    maxHeight: '94%',
    backgroundColor: '#fff8ea',
    borderWidth: 2,
    borderColor: '#3d2d28',
    shadowColor: '#3d2d28',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#fff4df',
    borderBottomWidth: 1,
    borderBottomColor: '#efd6aa',
    gap: 8,
  },
  headerCopy: { flex: 1, minWidth: 0, alignItems: 'center', paddingLeft: 36 },
  eyebrow: { fontFamily, fontSize: 9, color: '#8a7765', marginBottom: 5 },
  title: { fontFamily, fontSize: 18, color: '#35281f', lineHeight: 25 },
  closeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#6b432f', backgroundColor: '#ffd99e' },
  closeText: { fontFamily, fontSize: 20, color: '#5c3529' },
  content: { paddingHorizontal: 8, paddingTop: 9, paddingBottom: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 5, paddingBottom: 8 },
  toolbarCopy: { flex: 1, minWidth: 0 },
  subtitle: { fontFamily, fontSize: 11, color: '#5f4d3e', flexShrink: 1, lineHeight: 17 },
  subtitleMuted: { fontFamily, fontSize: 9, color: '#9a8877', flexShrink: 1, lineHeight: 14, marginTop: 1 },
  toolbarActions: { flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 2 },
  goalHistoryButton: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 6 },
  goalHistoryButtonText: { fontFamily, fontSize: 10, color: '#7a5b43', textDecorationLine: 'underline' },
  todayButton: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 7 },
  todayButtonText: { fontFamily, fontSize: 10, color: '#7a5b43', textDecorationLine: 'underline' },
  calendarToggleButton: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 6 },
  calendarToggleText: { fontFamily, fontSize: 10, color: '#7a5b43', textDecorationLine: 'underline' },
  calendarPanel: {
    backgroundColor: '#fff8ea',
    borderBottomWidth: 2,
    borderBottomColor: '#e9c98f',
    paddingTop: 6,
    paddingHorizontal: 12,
  },
  calendar: { backgroundColor: '#fff8ea', paddingLeft: 0, paddingRight: 0 },
  monthTitle: { fontFamily, fontSize: 17, color: '#35281f', lineHeight: 24, textAlign: 'center' },
  arrow: { fontFamily, fontSize: 22, color: '#6b432f', lineHeight: 26, paddingHorizontal: 8 },
  day: { width: 38, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  emptyDay: { width: 38, height: 42 },
  dayText: { fontFamily, fontSize: 14, color: '#6f6256', lineHeight: 19 },
  sunday: { color: '#e77b70' },
  saturday: { color: '#6f99ce' },
  todayDay: { borderColor: '#cfaa78' },
  selectedDay: { backgroundColor: '#dce9ca', borderColor: '#708351' },
  todayDot: { position: 'absolute', top: 4, left: 5, width: 4, height: 4, backgroundColor: '#9b7145' },
  completedDay: {},
  dayCount: { fontFamily, fontSize: 8, color: '#8b796a', lineHeight: 10, marginTop: -1 },
  dayCheck: { position: 'absolute', right: 2, top: 1, color: '#6f8a45', fontSize: 10, lineHeight: 12 },
  goalDayMark: { position: 'absolute', right: 2, bottom: 1, color: '#c36b3f', fontSize: 9, lineHeight: 11 },
  completeMark: { color: '#6f8a45', fontSize: 12, lineHeight: 14 },
  goalLegendMark: { color: '#c36b3f', fontSize: 11, lineHeight: 14 },
  summary: { fontFamily, fontSize: 12, color: '#536a36', marginTop: 12, lineHeight: 19 },
  readOnly: { fontFamily, fontSize: 10, color: '#786453', marginTop: 8, lineHeight: 17 },
  errorText: { fontFamily, fontSize: 11, color: '#b64d48', marginTop: 10, lineHeight: 18 },
  taskRow: { flexDirection: 'row', gap: 10, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#e4cda7', alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#9b7145', alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  checked: { backgroundColor: '#dce9ca', borderColor: '#708351' },
  missed: { backgroundColor: '#efe7d7', borderColor: '#a99a88' },
  checkText: { color: '#536a36', fontSize: 16 },
  missedSlash: { backgroundColor: '#8f8376', height: 2, position: 'absolute', transform: [{ rotate: '-45deg' }], width: 25 },
  taskBody: { flex: 1, minWidth: 0 },
  taskGoal: { fontFamily, fontSize: 9, color: '#786453', lineHeight: 16 },
  taskTitle: { fontFamily, fontSize: 12, color: '#35281f', lineHeight: 20, marginTop: 3 },
  doneTitle: { textDecorationLine: 'line-through', color: '#786453' },
  taskDescription: { fontFamily, fontSize: 10, color: '#786453', lineHeight: 17, marginTop: 4 },
  completedGoalSection: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e4cda7' },
  completedGoalSectionWithTasks: { marginTop: 8 },
  completedGoalHeading: { fontFamily, fontSize: 12, color: '#8f5e33', lineHeight: 19 },
  completedGoalRow: { flexDirection: 'row', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e4cda7' },
  completedGoalMark: { color: '#b96335', fontSize: 12, lineHeight: 18 },
  completedGoalBody: { flex: 1, minWidth: 0 },
  completedGoalTitle: { fontFamily, fontSize: 12, color: '#35281f', lineHeight: 19 },
  completedGoalMeta: { fontFamily, fontSize: 9, color: '#786453', lineHeight: 15, marginTop: 3 },
  pressed: { opacity: 0.65 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 8,
    rowGap: 6,
    paddingTop: 12,
    paddingBottom: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  todaySwatch: { width: 10, height: 10, borderWidth: 1, borderColor: '#cfaa78' },
  selectedSwatch: { width: 10, height: 10, backgroundColor: '#dce9ca', borderWidth: 1, borderColor: '#708351' },
  legendText: { fontFamily, fontSize: 9, color: '#786453', lineHeight: 14 },
  detail: { paddingHorizontal: 8, paddingTop: 14, paddingBottom: 8 },
  collapsed: { display: 'none' },
  goalHistoryLayer: { alignItems: 'center', bottom: 0, justifyContent: 'center', left: 0, padding: 12, position: 'absolute', right: 0, top: 0 },
  goalHistoryBackdrop: { backgroundColor: 'rgba(49,42,35,0.32)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  goalHistoryPanel: { backgroundColor: '#fff8ea', borderColor: '#3d2d28', borderWidth: 2, maxHeight: '84%', padding: 12, width: '100%' },
  goalHistoryHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  goalHistoryEyebrow: { color: '#725642', fontFamily, fontSize: 9, lineHeight: 14 },
  goalHistoryTitle: { color: '#35281f', fontFamily, fontSize: 18, lineHeight: 26 },
  goalHistoryCloseButton: { alignItems: 'center', backgroundColor: '#ffd99e', borderColor: '#6b432f', borderWidth: 2, height: 34, justifyContent: 'center', width: 34 },
  goalStatsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  goalStatBox: { alignItems: 'center', backgroundColor: '#fff0cc', borderColor: '#d7a36d', borderWidth: 2, flex: 1, paddingVertical: 9 },
  goalStatValue: { color: '#8f5e33', fontFamily, fontSize: 17, lineHeight: 22 },
  goalStatLabel: { color: '#786453', fontFamily, fontSize: 9, lineHeight: 14, marginTop: 2 },
  goalHistoryList: { marginTop: 10, maxHeight: 320 },
  goalHistoryListContent: { paddingBottom: 2 },
  goalHistoryItem: { borderBottomColor: '#e4cda7', borderBottomWidth: 1, paddingVertical: 10 },
  goalHistoryItemHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  goalHistoryItemTitle: { color: '#35281f', flex: 1, fontFamily, fontSize: 12, lineHeight: 19 },
  goalStatusBadge: { backgroundColor: '#ead4ad', borderColor: '#d7a36d', borderWidth: 1, color: '#7a5947', fontFamily, fontSize: 9, lineHeight: 15, minWidth: 42, textAlign: 'center' },
  goalStatusBadgeCompleted: { backgroundColor: '#dce9ca', borderColor: '#708351', color: '#536a36' },
  goalStatusBadgeAbandoned: { backgroundColor: '#f1d0bf', borderColor: '#b96335', color: '#8f4d31' },
  goalHistoryMeta: { color: '#786453', fontFamily, fontSize: 9, lineHeight: 15, marginTop: 5 },
  sectionToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, gap: 8, paddingVertical: 8 },
  sectionHeading: { flex: 1, gap: 6 },
  toggleLabel: { fontFamily, fontSize: 10, color: '#6b432f' },
  dateTitle: { fontFamily, fontSize: 14, color: '#35281f' },
  dateStatus: { fontFamily, fontSize: 10, color: '#786453' },
  emptyTitle: { fontFamily, fontSize: 12, color: '#6f5947', marginTop: 22, textAlign: 'center' },
  emptyDescription: { fontFamily, fontSize: 10, color: '#786453', textAlign: 'center', lineHeight: 17, marginTop: 8 },
  footnote: { fontFamily, fontSize: 9, color: '#786453', textAlign: 'center', marginTop: 18, marginBottom: 8 },
});
