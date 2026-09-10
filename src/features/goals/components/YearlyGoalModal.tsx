import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  GoalDifficulty,
  goalDifficultyLabels,
  goalDifficultyOptions,
  YearlyGoal,
} from '../types';

const pixelFontFamily = 'Galmuri11';

type YearlyGoalModalProps = {
  errorMessage: string;
  difficulty: GoalDifficulty;
  isGenerating: boolean;
  onChangeDraft: (value: string) => void;
  onChangeDifficulty: (value: GoalDifficulty) => void;
  onClose: () => void;
  onSave: () => void;
  value: string;
  visible: boolean;
  width: number;
  yearlyGoals: YearlyGoal[];
};

export function YearlyGoalModal({
  errorMessage,
  difficulty,
  isGenerating,
  onChangeDifficulty,
  onChangeDraft,
  onClose,
  onSave,
  value,
  visible,
  width,
  yearlyGoals,
}: YearlyGoalModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalLayer}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.simpleModalFrame, { width }]}>
          <View style={styles.simpleModalPanel}>
            <Text style={styles.simpleModalTitle}>올해 목표</Text>
            <Text style={styles.simpleModalDescription}>
              목표를 여러 개 추가할 수 있어요. 오늘 할 일은 목표 1개당 기본 3개씩 생성됩니다.
            </Text>
            {yearlyGoals.length > 0 ? (
              <ScrollView
                contentContainerStyle={styles.goalListContent}
                nestedScrollEnabled
                style={styles.goalListPanel}
              >
                {yearlyGoals.map((goal) => (
                  <Text key={goal.id} style={styles.goalListText}>
                    - [{goalDifficultyLabels[goal.difficulty]}] {goal.title}
                  </Text>
                ))}
              </ScrollView>
            ) : null}
            <Text style={styles.fieldLabel}>난이도</Text>
            <View style={styles.difficultySegment}>
              {goalDifficultyOptions.map((option) => {
                const isSelected = difficulty === option;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    disabled={isGenerating}
                    key={option}
                    onPress={() => onChangeDifficulty(option)}
                    style={[
                      styles.difficultyButton,
                      isSelected ? styles.difficultyButtonSelected : null,
                      isGenerating ? styles.disabledModalButton : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        isSelected ? styles.difficultyButtonTextSelected : null,
                      ]}
                    >
                      {goalDifficultyLabels[option]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              multiline
              onChangeText={onChangeDraft}
              placeholder="예: HSK 2급 따기"
              placeholderTextColor="#9b8064"
              style={styles.goalInput}
              textAlignVertical="top"
              value={value}
            />
            {errorMessage ? (
              <Text style={styles.goalErrorText}>{errorMessage}</Text>
            ) : null}
            <View style={styles.modalActionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={styles.secondaryModalButton}
              >
                <Text style={styles.secondaryModalButtonText}>닫기</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!value.trim() || isGenerating}
                onPress={onSave}
                style={[
                  styles.primaryModalButton,
                  (!value.trim() || isGenerating) ? styles.disabledModalButton : null,
                ]}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff8ea" />
                ) : (
                  <Text style={styles.primaryModalButtonText}>목표 추가</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  simpleModalFrame: {
    maxHeight: '78%',
  },
  simpleModalPanel: {
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    padding: 14,
  },
  simpleModalTitle: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  simpleModalDescription: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 8,
  },
  goalListPanel: {
    backgroundColor: '#fff0cc',
    borderColor: '#d7a36d',
    borderWidth: 2,
    marginTop: 12,
    maxHeight: 130,
  },
  goalListContent: {
    padding: 9,
  },
  goalListText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 17,
    marginTop: 3,
  },
  fieldLabel: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 14,
  },
  difficultySegment: {
    backgroundColor: '#fff0cc',
    borderColor: '#6b432f',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
    marginTop: 7,
    padding: 5,
  },
  difficultyButton: {
    alignItems: 'center',
    backgroundColor: '#ead4ad',
    borderColor: '#d7a36d',
    borderWidth: 2,
    flex: 1,
    height: 36,
    justifyContent: 'center',
  },
  difficultyButtonSelected: {
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
  },
  difficultyButtonText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  difficultyButtonTextSelected: {
    color: '#fff8ea',
  },
  goalInput: {
    backgroundColor: '#fff0cc',
    borderColor: '#6b432f',
    borderWidth: 3,
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 19,
    marginTop: 12,
    minHeight: 104,
    padding: 10,
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
});
