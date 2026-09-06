import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, CalendarUtils, DateData, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

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

/** Displays a local-date calendar preview without reading or changing task history. */
export function CalendarModal({ onClose }: { onClose: () => void }) {
  const today = CalendarUtils.getCalendarDateString(new Date());
  const [selected, setSelected] = useState(today);
  const [calendarKey, setCalendarKey] = useState(0);
  const [year, month, day] = selected.split('-').map(Number);

  /** Returns both the visible month and selection to the current local day. */
  const showToday = () => {
    setSelected(today);
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
            <Calendar
              key={calendarKey}
              initialDate={today}
              monthFormat="yyyy년 M월"
              theme={theme}
              disableAllTouchEventsForDisabledDays
              accessibilityLabel="월별 할 일 캘린더"
              dayComponent={({ date, state }) => (
                <CalendarDay date={date} hidden={state === 'disabled'} selected={selected}
                  today={today} onSelect={setSelected} />
              )}
              renderHeader={(date) => <Text style={styles.monthTitle}>{date?.toString('yyyy년 M월')}</Text>}
              renderArrow={(direction) => <Text style={styles.arrow}>{direction === 'left' ? '‹' : '›'}</Text>}
            />
            <View style={styles.legend}>
              <View style={styles.legendItem}><View style={styles.todaySwatch} /><Text style={styles.legendText}>오늘</Text></View>
              <View style={styles.legendItem}><View style={styles.selectedSwatch} /><Text style={styles.legendText}>선택한 날</Text></View>
            </View>
            <View style={styles.detail}>
              <View style={styles.detailHeader}>
                <Text style={styles.dateTitle}>{month}월 {day}일</Text>
                <Text style={styles.dateStatus}>{selected === today ? '오늘' : selected < today ? '지난 기록' : '다가오는 날'}</Text>
              </View>
              <Text style={styles.emptyTitle}>아직 표시할 기록이 없어요</Text>
              <Text style={styles.emptyDescription}>작은 실천이 모이면 이곳에 발자국이 남아요.</Text>
            </View>
            <Text style={styles.footnote}>{year}년의 하루하루, 나만의 속도로</Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/** Customizes the library's day cell while keeping date calculation in the library. */
function CalendarDay({ date, hidden, selected, today, onSelect }: {
  date?: DateData; hidden: boolean; selected: string; today: string; onSelect: (date: string) => void;
}) {
  if (!date || hidden) return <View style={styles.day} />;
  const weekday = new Date(date.year, date.month - 1, date.day).getDay();
  const isSelected = selected === date.dateString;
  const isToday = today === date.dateString;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${date.year}년 ${date.month}월 ${date.day}일${isToday ? ', 오늘' : ''}`}
      onPress={() => onSelect(date.dateString)}
      style={({ pressed }) => [styles.day, isToday && styles.todayDay, isSelected && styles.selectedDay, pressed && styles.pressed]}>
      <Text style={[styles.dayText, weekday === 0 && styles.sunday, weekday === 6 && styles.saturday]}>{date.day}</Text>
      {isToday ? <View style={styles.todayDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(49,42,35,0.58)' },
  frame: { width: '100%', maxWidth: 390, maxHeight: '94%', backgroundColor: '#fff8ea', borderWidth: 4, borderColor: '#3d2d28', boxShadow: '5px 6px 0 rgba(49,42,35,0.25)' },
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
  todayDot: { position: 'absolute', bottom: 3, width: 4, height: 4, backgroundColor: '#8e643e' },
  pressed: { opacity: 0.65 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  todaySwatch: { width: 10, height: 10, borderWidth: 1, borderColor: '#9b7145' },
  selectedSwatch: { width: 10, height: 10, backgroundColor: '#dce9ca', borderWidth: 1, borderColor: '#708351' },
  legendText: { fontFamily, fontSize: 10, color: '#786453' },
  detail: { borderTopWidth: 2, borderTopColor: '#e4cda7', paddingHorizontal: 8, paddingTop: 16, paddingBottom: 8 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateTitle: { fontFamily, fontSize: 14, color: '#35281f' },
  dateStatus: { fontFamily, fontSize: 10, color: '#786453' },
  emptyTitle: { fontFamily, fontSize: 12, color: '#6f5947', marginTop: 22, textAlign: 'center' },
  emptyDescription: { fontFamily, fontSize: 10, color: '#786453', textAlign: 'center', lineHeight: 17, marginTop: 8 },
  footnote: { fontFamily, fontSize: 9, color: '#786453', textAlign: 'center', marginTop: 18, marginBottom: 8 },
});
