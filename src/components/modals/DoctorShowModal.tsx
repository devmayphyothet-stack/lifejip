import {
  AlertTriangle,
  Clock,
  Stethoscope,
  Volume2,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { speakKorean, stopSpeech } from '@/services/speech';
import type {
  ClinicDepartment,
  EmergencyProfile,
  MedicalSymptom,
} from '@/types';

interface DoctorShowModalProps {
  visible: boolean;
  symptoms: MedicalSymptom[];
  recommendedDepartments: ClinicDepartment[];
  durationOption: { labelKo: string; labelMm: string };
  severityOption: { labelKo: string; labelMm: string };
  specialNotes: { labelKo: string; labelMm: string }[];
  emergencyProfile: EmergencyProfile;
  onClose: () => void;
}

export function DoctorShowModal({
  visible,
  symptoms,
  recommendedDepartments,
  durationOption,
  severityOption,
  specialNotes,
  emergencyProfile,
  onClose,
}: DoctorShowModalProps) {
  const [speaking, setSpeaking] = useState(false);

  const primaryDept = recommendedDepartments[0];

  const buildCombinedSpeechKo = () => {
    const symptomLines = symptoms.map((s) => s.doctorSentenceKo).join(' 그리고 ');
    const notesLine =
      specialNotes.length > 0
        ? specialNotes.map((n) => n.labelKo).join('. ')
        : '';
    const allergyLine = emergencyProfile.allergiesKo
      ? `참고로 알레르기 정보는 ${emergencyProfile.allergiesKo} 입니다.`
      : '';

    return [
      '선생님, 안녕하세요. 한국어가 서툴러서 증상 카드를 보여드립니다.',
      symptomLines,
      `증상 시작 시기: ${durationOption.labelKo}.`,
      `통증 정도: ${severityOption.labelKo}.`,
      notesLine,
      allergyLine,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const handlePlayAll = (rate = 0.88) => {
    setSpeaking(true);
    speakKorean(buildCombinedSpeechKo(), {
      rate,
      onDone: () => setSpeaking(false),
    });
  };

  const handleClose = () => {
    stopSpeech();
    setSpeaking(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.badge}>
              <Stethoscope size={16} color="#FFFFFF" />
              <AppText variant="badge" color="#FFFFFF">
                의사 / 약사에게 보여주기 (Show to Doctor)
              </AppText>
            </View>
            <AppText variant="caption" color={Palette.textSecondary}>
              ဆရာဝန် သို့မဟုတ် ဆေးဆိုင်ဝန်ထမ်းအား ဤမျက်နှာပြင်ကို ပြသပြီး အသံဖွင့်ပြနိုင်ပါသည်
            </AppText>
          </View>
          <Pressable
            onPress={handleClose}
            style={styles.closeBtn}
            accessibilityLabel="Close Show to Doctor modal"
          >
            <X size={24} color={Palette.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting & TTS Trigger Bar */}
          <View style={styles.greetingCard}>
            <AppText variant="h3" color={Palette.primaryDark} script="korean">
              선생님, 안녕하세요. 아래 증상과 알레르기 정보를 확인해 주세요.
            </AppText>
            <View style={styles.ttsButtonRow}>
              <Pressable
                onPress={() => handlePlayAll(0.9)}
                style={({ pressed }) => [
                  styles.ttsMainBtn,
                  pressed && { backgroundColor: Palette.primaryDark },
                ]}
              >
                <Volume2 size={22} color="#FFFFFF" />
                <AppText variant="bodyBold" color="#FFFFFF">
                  {speaking ? '음성 재생 중...' : '전체 증상 음성으로 읽기 (TTS)'}
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => handlePlayAll(0.72)}
                style={styles.ttsSlowBtn}
              >
                <AppText variant="badge" color={Palette.primaryDark}>
                  천천히 (အနှေးဖတ်)
                </AppText>
              </Pressable>
            </View>
          </View>

          {/* Recommended Clinic Department Banner */}
          {primaryDept ? (
            <View style={styles.deptBanner}>
              <View style={styles.deptHeader}>
                <AppText variant="caption" color={Palette.primaryDark}>
                  권장 진료과 (သွားရောက်ပြသသင့်သော ဆေးခန်းဌာန)
                </AppText>
              </View>
              <AppText variant="h1" color={Palette.primaryDark} script="korean">
                {recommendedDepartments.map((d) => d.nameKo).join(' · ')}
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                {primaryDept.nameMm} ({primaryDept.pronunciationMm})
              </AppText>
            </View>
          ) : null}

          {/* Huge High-Contrast Korean Symptom Cards */}
          <View style={styles.sectionHeader}>
            <AppText variant="subtitle" color={Palette.textPrimary}>
              주요 증상 ({symptoms.length}개 선택됨) • ရွေးချယ်ထားသော ရောဂါလက္ခဏာများ
            </AppText>
          </View>

          {symptoms.map((sym, index) => (
            <Pressable
              key={sym.id}
              onPress={() => speakKorean(sym.doctorSentenceKo)}
              style={({ pressed }) => [
                styles.symptomShowCard,
                sym.isUrgent && styles.symptomShowCardUrgent,
                pressed && { opacity: 0.92 },
              ]}
            >
              <View style={styles.symptomCardTop}>
                <View style={styles.numberPill}>
                  <AppText variant="badge" color="#FFFFFF">
                    증상 {index + 1}
                  </AppText>
                </View>
                <View style={styles.tapSpeakHint}>
                  <Volume2 size={16} color={Palette.primary} />
                  <AppText variant="caption" color={Palette.primary}>
                    눌러서 듣기
                  </AppText>
                </View>
              </View>

              <AppText
                variant="koreanShowCard"
                fontSize={26}
                color={Palette.textPrimary}
                script="korean"
              >
                {sym.doctorSentenceKo}
              </AppText>

              <View style={styles.divider} />

              <AppText variant="burmese" color={Palette.textSecondary}>
                မြန်မာလို: {sym.symptomMm}
              </AppText>
              <AppText variant="caption" color={Palette.primaryDark}>
                အသံထွက်: {sym.pronunciationMm}
              </AppText>
            </Pressable>
          ))}

          {/* Duration, Severity & Special Notes */}
          <View style={styles.contextBox}>
            <View style={styles.contextHeader}>
              <Clock size={18} color={Palette.secondary} />
              <AppText variant="h3" color={Palette.secondary} script="korean">
                증상 기간 · 통증 정도 · 참고사항
              </AppText>
            </View>

            <View style={styles.contextItem}>
              <AppText variant="caption" color={Palette.textSecondary}>
                언제부터 아픈가요? (ဘယ်အချိန်က စဖြစ်တာလဲ)
              </AppText>
              <AppText variant="h2" color={Palette.textPrimary} script="korean">
                • {durationOption.labelKo}
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                ({durationOption.labelMm})
              </AppText>
            </View>

            <View style={styles.contextItem}>
              <AppText variant="caption" color={Palette.textSecondary}>
                통증 정도 (နာကျင်မှု အတိုင်းအတာ)
              </AppText>
              <AppText variant="h2" color={Palette.textPrimary} script="korean">
                • {severityOption.labelKo}
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                ({severityOption.labelMm})
              </AppText>
            </View>

            {specialNotes.length > 0 ? (
              <View style={styles.contextItem}>
                <AppText variant="caption" color={Palette.danger}>
                  필수 참고사항 (အထူးအသိပေးချက်)
                </AppText>
                {specialNotes.map((note) => (
                  <View key={note.labelKo} style={styles.noteRow}>
                    <AppText variant="h3" color={Palette.danger} script="korean">
                      ⚠️ {note.labelKo}
                    </AppText>
                    <AppText variant="burmese" color={Palette.textSecondary}>
                      ({note.labelMm})
                    </AppText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Patient Allergy & Medical Alert Box */}
          <View style={styles.allergyAlertCard}>
            <View style={styles.contextHeader}>
              <AlertTriangle size={20} color={Palette.danger} />
              <AppText variant="h3" color={Palette.danger} script="korean">
                환자 알레르기 및 기저질환 정보 (ဓာတ်မတည့်မှု နှင့် သွေးအမျိုးအစား)
              </AppText>
            </View>
            <AppText variant="h3" color={Palette.textPrimary} script="korean">
              • 혈액형: {emergencyProfile.bloodType}
            </AppText>
            <AppText variant="h3" color={Palette.danger} script="korean">
              • 알레르기: {emergencyProfile.allergiesKo}
            </AppText>
            <AppText variant="bodyBold" color={Palette.textPrimary} script="korean">
              • 기저질환/복용약: {emergencyProfile.chronicConditionsKo} / {emergencyProfile.medicationsKo}
            </AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  headerTitleWrap: {
    flex: 1,
    gap: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  greetingCard: {
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Palette.primary,
    gap: Spacing.sm,
  },
  ttsButtonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  ttsMainBtn: {
    flex: 1,
    backgroundColor: Palette.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  ttsSlowBtn: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  deptBanner: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  deptHeader: {
    marginBottom: 2,
  },
  sectionHeader: {
    marginTop: Spacing.xs,
  },
  symptomShowCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Palette.primary,
    gap: Spacing.xs,
  },
  symptomShowCardUrgent: {
    borderColor: Palette.danger,
    backgroundColor: '#FFF1F2',
  },
  symptomCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  numberPill: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tapSpeakHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: Spacing.xs,
  },
  contextBox: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: Spacing.md,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextItem: {
    gap: 2,
  },
  noteRow: {
    marginTop: 4,
  },
  allergyAlertCard: {
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Palette.danger,
    gap: 4,
  },
});

