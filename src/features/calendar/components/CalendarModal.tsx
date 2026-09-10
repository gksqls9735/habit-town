import { useEffect, useMemo, useState } from 'react';
import { AppState, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyPlan } from '../../goals/types';
import { canEditPlan, getLocalDateKey, getNextMidnightTimestamp } from '../../goals/utils';
import { CalendarRecord, getCalendarHistory } from '../calendarHistory';

LocaleConfig.locales.ko = {
  monthNames: Array.from({ length: 12 }, (_, index) => `${index + 1}월`),
  monthNamesShort: Array.from({ length: 12 }, (_, index) => `${index + 1}월`),
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const fontFamily = 'Galmuri11';
const theme = {
  calendarBackground: '#fff8ea',
  textSectionTitleColor: '#786453',
  textDayHeaderFontFamily: fontFamily,
  textMonthFontFamily: fontFamily,
  textMonthFontSize: 18,
  monthTextColor: '#35281f',
  arrowColor: '#6b432f',
  'stylesheet.calendar.header': {
    dayTextAtIndex0: { color: '#b64d48' },
    dayTextAtIndex6: { color: '#456da2' },
  },
};

/** Shares task history and completion actions with the home task planner. */
export function CalendarModal({ onClose, plans, onToggleTask, isLoading, isBusy, errorMessage }: {
  onClose: () => void;
  plans: DailyPlan[];
  onToggleTask: (planId: string, taskId: string) => void;
  isLoading: boolean;
  isBusy: boolean;
  errorMessage: string;
}) {
  const [now, setNow] = useState(Date.now);
  const today = getLocalDateKey(now);
  const [selected, setSelected] = useState(today);
  const [calendarKey, setCalendarKey] = useState(0);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [year, month, day] = selected.split('-').map(Number);
  const history = useMemo(() => getCalendarHistory(plans), [plans]);
  const record = history[selected];

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
        <Pressable accessibilityLabel="캘린더 닫기" onPress={onClose} style={styles.backdrop} />
        <View style={styles.frame} accessibilityViewIsModal>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>하루하루 쌓이는 작은 노력</Text>
              <Text style={styles.title}>나의 캘린더</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="캘린더 닫기" onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.toolbar}>
              <Text style={styles.subtitle}>나의 발자국을 모아보세요</Text>
              <Pressable accessibilityRole="button" onPress={showToday}
                style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}>
                <Text style={styles.todayButtonText}>오늘로</Text>
              </Pressable>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="달력 접기 또는 펼치기"
              accessibilityState={{ expanded: calendarExpanded }}
              onPress={() => setCalendarExpanded((value) => !value)}
              style={({ pressed }) => [styles.sectionToggle, pressed && styles.pressed]}>
              <View style={styles.sectionHeading}>
                <Text style={styles.dateTitle}>달력</Text>
                <Text style={styles.dateStatus}>선택 {month}월 {day}일</Text>
              </View>
              <Text style={styles.toggleLabel}>{calendarExpanded ? '접기 −' : '펼치기 +'}</Text>
            </Pressable>
            <View style={!calendarExpanded && styles.collapsed}>
            <Calendar
              key={calendarKey}
              initialDate={today}
              monthFormat="yyyy년 M월"
              theme={theme}
              disableAllTouchEventsForDisabledDays
              accessibilityLabel="월별 할 일 캘린더"
              dayComponent={({ date, state }) => (
                <CalendarDay date={date} hidden={state === 'disabled'} selected={selected}
                  today={today} onSelect={setSelected} record={isLoading ? undefined : history[date?.dateString ?? '']} />
              )}
              renderHeader={(date) => <Text style={styles.monthTitle}>{date?.toString('yyyy년 M월')}</Text>}
              renderArrow={(direction) => <Text style={styles.arrow}>{direction === 'left' ? '‹' : '›'}</Text>}
            />
            <View style={styles.legend}>
              <View style={styles.legendItem}><View style={styles.todaySwatch} /><Text style={styles.legendText}>오늘</Text></View>
              <View style={styles.legendItem}><View style={styles.selectedSwatch} /><Text style={styles.legendText}>선택한 날</Text></View>
              <View style={styles.legendItem}><Text style={styles.completeMark}>✓</Text><Text style={styles.legendText}>모두 완료</Text></View>
            </View>
            </View>
            <View style={styles.detail}>
              <Pressable accessibilityRole="button" accessibilityLabel="할 일 목록 접기 또는 펼치기"
                accessibilityState={{ expanded: tasksExpanded }}
                onPress={() => setTasksExpanded((value) => !value)}
                style={({ pressed }) => [styles.sectionToggle, pressed && styles.pressed]}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.dateTitle}>{month}월 {day}일 할 일</Text>
                  <Text style={styles.dateStatus}>{selected === today ? '오늘' : selected < today ? '지난 기록' : '다가오는 날'}</Text>
                </View>
                <Text style={styles.toggleLabel}>{tasksExpanded ? '접기 −' : '펼치기 +'}</Text>
              </Pressable>
              {errorMessage ? <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text> : null}
              {isLoading ? <Text style={styles.emptyTitle}>할 일 기록을 불러오는 중이에요.</Text>
                : record?.total ? <>
                  <Text accessibilityLiveRegion="polite" style={styles.summary}>완료 {record.completed} / {record.total}{record.completed === record.total ? ' · 모두 해냈어요!' : ''}</Text>
                  {tasksExpanded ? <>
                  {selected < today ? <Text style={styles.readOnly}>지난 날짜의 기록은 수정할 수 없어요.</Text> : null}
                  {record.tasks.map(({ plan, task }) => {
                    const editable = canEditPlan(plan, now) && !isBusy;
                    return <Pressable key={`${plan.id}-${task.id}`}
                      accessibilityRole="checkbox" accessibilityState={{ checked: task.done, disabled: !editable }}
                      accessibilityLabel={`${task.goalTitle}, ${task.title}, ${task.done ? '완료' : '미완료'}`}
                      disabled={!editable} onPress={() => onToggleTask(plan.id, task.id)}
                      style={({ pressed }) => [styles.taskRow, pressed && styles.pressed]}>
                      <View style={[styles.checkbox, task.done && styles.checked]}><Text style={styles.checkText}>{task.done ? '✓' : ''}</Text></View>
                      <View style={styles.taskBody}>
                        <Text style={styles.taskGoal}>{task.goalTitle}</Text>
                        <Text style={[styles.taskTitle, task.done && styles.doneTitle]}>{task.title}</Text>
                        <Text style={styles.taskDescription}>{task.description}</Text>
                      </View>
                    </Pressable>;
                  })}
                  </> : null}
                </> : <>
                  <Text style={styles.emptyTitle}>{errorMessage ? '기록을 표시할 수 없어요' : '배정된 할 일이 없어요'}</Text>
                  {tasksExpanded ? <Text style={styles.emptyDescription}>{selected === today ? '오늘 할 일에서 목표와 할 일을 만들어보세요.' : '할 일이 배정된 날짜에 기록이 남아요.'}</Text> : null}
                </>}
            </View>
            <Text style={styles.footnote}>{year}년의 하루하루, 나만의 속도로</Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/** Customizes the library's day cell while keeping date calculation in the library. */
function CalendarDay({ date, hidden, selected, today, onSelect, record }: {
  date?: DateData; hidden: boolean; selected: string; today: string; onSelect: (date: string) => void;
  record?: CalendarRecord;
}) {
  if (!date || hidden) return <View style={styles.day} />;
  const weekday = new Date(date.year, date.month - 1, date.day).getDay();
  const isSelected = selected === date.dateString;
  const isToday = today === date.dateString;
  const complete = !!record?.total && record.completed === record.total;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${date.year}년 ${date.month}월 ${date.day}일${isToday ? ', 오늘' : ''}${record?.total ? `, ${record.total}개 중 ${record.completed}개 완료` : ''}${complete ? ', 모두 완료' : ''}`}
      onPress={() => onSelect(date.dateString)}
      style={({ pressed }) => [styles.day, complete && styles.completedDay, isToday && styles.todayDay, isSelected && styles.selectedDay, pressed && styles.pressed]}>
      <Text style={[styles.dayText, weekday === 0 && styles.sunday, weekday === 6 && styles.saturday]}>{date.day}</Text>
      {record?.total ? <Text numberOfLines={1} adjustsFontSizeToFit style={styles.dayCount}>{record.completed}/{record.total}</Text> : null}
      {complete ? <Text style={styles.dayCheck}>✓</Text> : null}
      {isToday ? <View style={styles.todayDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(49,42,35,0.58)' },
  frame: { width: '100%', maxWidth: 390, maxHeight: '94%', backgroundColor: '#fff8ea', borderWidth: 2, borderColor: '#3d2d28', boxShadow: '4px 5px 0 rgba(49,42,35,0.22)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#f2dfb6', borderBottomWidth: 2, borderBottomColor: '#c8a47d', gap: 8 },
  eyebrow: { fontFamily, fontSize: 10, color: '#725642', marginBottom: 7 },
  title: { fontFamily, fontSize: 20, color: '#35281f' },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#987052', backgroundColor: '#fff8ea' },
  closeText: { fontFamily, fontSize: 26, color: '#6b432f' },
  content: { padding: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, paddingHorizontal: 4 },
  subtitle: { fontFamily, fontSize: 10, color: '#786453', flexShrink: 1 },
  todayButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  todayButtonText: { fontFamily, fontSize: 11, color: '#6b432f', textDecorationLine: 'underline' },
  monthTitle: { fontFamily, fontSize: 18, color: '#35281f' },
  arrow: { fontFamily, fontSize: 27, color: '#6b432f' },
  day: { width: 34, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  dayText: { fontFamily, fontSize: 13, color: '#493b30' },
  sunday: { color: '#b64d48' },
  saturday: { color: '#456da2' },
  todayDay: { borderColor: '#9b7145' },
  selectedDay: { backgroundColor: '#dce9ca', borderColor: '#708351' },
  todayDot: { position: 'absolute', top: 2, left: 2, width: 4, height: 4, backgroundColor: '#8e643e' },
  completedDay: { backgroundColor: '#f6e8b6' },
  dayCount: { fontFamily, fontSize: 8, color: '#58683c', marginTop: 2 },
  dayCheck: { position: 'absolute', right: -2, top: -5, color: '#536a36', fontSize: 11 },
  completeMark: { color: '#536a36', fontSize: 12 },
  summary: { fontFamily, fontSize: 12, color: '#536a36', marginTop: 12, lineHeight: 19 },
  readOnly: { fontFamily, fontSize: 10, color: '#786453', marginTop: 8, lineHeight: 17 },
  errorText: { fontFamily, fontSize: 11, color: '#b64d48', marginTop: 10, lineHeight: 18 },
  taskRow: { flexDirection: 'row', gap: 10, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#e4cda7', alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#9b7145', alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  checked: { backgroundColor: '#dce9ca', borderColor: '#708351' },
  checkText: { color: '#536a36', fontSize: 16 },
  taskBody: { flex: 1, minWidth: 0 },
  taskGoal: { fontFamily, fontSize: 9, color: '#786453', lineHeight: 16 },
  taskTitle: { fontFamily, fontSize: 12, color: '#35281f', lineHeight: 20, marginTop: 3 },
  doneTitle: { textDecorationLine: 'line-through', color: '#786453' },
  taskDescription: { fontFamily, fontSize: 10, color: '#786453', lineHeight: 17, marginTop: 4 },
  pressed: { opacity: 0.65 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  todaySwatch: { width: 10, height: 10, borderWidth: 1, borderColor: '#9b7145' },
  selectedSwatch: { width: 10, height: 10, backgroundColor: '#dce9ca', borderWidth: 1, borderColor: '#708351' },
  legendText: { fontFamily, fontSize: 10, color: '#786453' },
  detail: { borderTopWidth: 2, borderTopColor: '#e4cda7', paddingHorizontal: 8, paddingTop: 16, paddingBottom: 8 },
  collapsed: { display: 'none' },
  sectionToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, gap: 8, paddingVertical: 8 },
  sectionHeading: { flex: 1, gap: 6 },
  toggleLabel: { fontFamily, fontSize: 10, color: '#6b432f' },
  dateTitle: { fontFamily, fontSize: 14, color: '#35281f' },
  dateStatus: { fontFamily, fontSize: 10, color: '#786453' },
  emptyTitle: { fontFamily, fontSize: 12, color: '#6f5947', marginTop: 22, textAlign: 'center' },
  emptyDescription: { fontFamily, fontSize: 10, color: '#786453', textAlign: 'center', lineHeight: 17, marginTop: 8 },
  footnote: { fontFamily, fontSize: 9, color: '#786453', textAlign: 'center', marginTop: 18, marginBottom: 8 },
});
