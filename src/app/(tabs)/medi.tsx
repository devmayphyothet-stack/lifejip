import { useFocusEffect } from 'expo-router';
import {
  AlertCircle,
  CheckSquare,
  ExternalLink,
  Pill,
  Square,
  Stethoscope,
  Volume2,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DoctorShowModal } from '@/components/modals/DoctorShowModal';
import { AppText } from '@/components/ui/AppText';
import {
  MaxContentWidth,
  Palette,
  Radius,
  Spacing,
} from '@/constants/theme';
import {
  BODY_PART_FILTERS,
  CLINIC_DEPARTMENTS,
  DEFAULT_EMERGENCY_PROFILE,
  MEDICAL_SYMPTOMS,
  OTC_MEDICINES,
  SYMPTOM_DURATION_OPTIONS,
  SYMPTOM_SEVERITY_OPTIONS,
  SYMPTOM_SPECIAL_NOTES,
} from '@/data/seedData';
import { speakKorean } from '@/services/speech';
import { loadEmergencyProfile } from '@/services/storage';
import type {
  BodyPartCategory,
  ClinicDepartment,
  EmergencyProfile,
} from '@/types';

type MediTabMode = 'symptoms' | 'otc';

export default function MediHelperScreen() {
  const [mediTab, setMediTab] = useState<MediTabMode>('symptoms');
  const [selectedBodyPart, setSelectedBodyPart] =
    useState<BodyPartCategory>('all');
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([
    'sym-fever',
    'sym-sore-throat',
  ]);
  const [durationIdx, setDurationIdx] = useState(0);
  const [severityIdx, setSeverityIdx] = useState(1);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyProfile>(
    DEFAULT_EMERGENCY_PROFILE
  );

  useFocusEffect(
    useCallback(() => {
      loadEmergencyProfile().then(setEmergencyProfile);
    }, [])
  );

  const filteredSymptoms = useMemo(() => {
    if (selectedBodyPart === 'all') return MEDICAL_SYMPTOMS;
    return MEDICAL_SYMPTOMS.filter((s) => s.bodyPart === selectedBodyPart);
  }, [selectedBodyPart]);

  const selectedSymptoms = useMemo(() => {
    return MEDICAL_SYMPTOMS.filter((s) => selectedSymptomIds.includes(s.id));
  }, [selectedSymptomIds]);

  const recommendedDepartments = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    for (const sym of selectedSymptoms) {
      deptCounts[sym.departmentId] =
        (deptCounts[sym.departmentId] ?? 0) + (sym.isUrgent ? 3 : 1);
    }
    const sortedIds = Object.keys(deptCounts).sort(
      (a, b) => deptCounts[b] - deptCounts[a]
    );
    return sortedIds
      .map((id) => CLINIC_DEPARTMENTS[id])
      .filter((d): d is ClinicDepartment => Boolean(d));
  }, [selectedSymptoms]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSpecialNote = (id: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openNaverMapForDept = (query: string) => {
    Linking.openURL(
      `https://map.naver.com/p/search/${encodeURIComponent(query)}`
    );
  };

  const selectedSpecialNotes = SYMPTOM_SPECIAL_NOTES.filter((n) =>
    selectedNoteIds.includes(n.id)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <AppText variant="h1" color={Palette.textPrimary} script="korean">
              의료 · 병원 소통 도우미 (Medi Helper)
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              ရောဂါလက္ခဏာများကို ရွေးချယ်ပြီး သွားရမည့် ဆေးခန်းဌာန (내과, 이비인후과, 정형외과) နှင့် ဆရာဝန်ပြရန် ကိုရီးယားစာမျက်နှာပြင် ဖွင့်ပါ။
            </AppText>
          </View>

          {/* Mode Toggle: Symptoms vs OTC Pharmacy */}
          <View style={styles.modeToggleRow}>
            <Pressable
              onPress={() => setMediTab('symptoms')}
              style={[
                styles.modeBtn,
                mediTab === 'symptoms' && styles.modeBtnActive,
              ]}
            >
              <Stethoscope
                size={18}
                color={
                  mediTab === 'symptoms' ? '#FFFFFF' : Palette.textSecondary
                }
              />
              <AppText
                variant="bodyBold"
                color={
                  mediTab === 'symptoms' ? '#FFFFFF' : Palette.textSecondary
                }
              >
                증상 선택 · 진료과 추천 (ဆေးခန်းပြရန်)
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setMediTab('otc')}
              style={[
                styles.modeBtn,
                mediTab === 'otc' && styles.modeBtnActive,
              ]}
            >
              <Pill
                size={18}
                color={mediTab === 'otc' ? '#FFFFFF' : Palette.textSecondary}
              />
              <AppText
                variant="bodyBold"
                color={mediTab === 'otc' ? '#FFFFFF' : Palette.textSecondary}
              >
                약국 · 상비약 (ဆေးဆိုင်သုံးဆေးများ)
              </AppText>
            </Pressable>
          </View>

          {mediTab === 'symptoms' ? (
            <>
              {/* Recommended Clinic Department Card */}
              <View style={styles.recommendationCard}>
                <View style={styles.recHeaderRow}>
                  <View style={styles.recBadge}>
                    <Stethoscope size={16} color="#FFFFFF" />
                    <AppText variant="badge" color="#FFFFFF">
                      추천 진료과 (သွားရောက်ပြသသင့်သော ဆေးခန်း)
                    </AppText>
                  </View>
                  <AppText variant="caption" color={Palette.primaryDark}>
                    {selectedSymptoms.length}개 증상 선택됨
                  </AppText>
                </View>

                {recommendedDepartments.length > 0 ? (
                  <>
                    <View style={styles.deptList}>
                      {recommendedDepartments.map((dept, index) => (
                        <View
                          key={dept.id}
                          style={[
                            styles.deptItemCard,
                            index === 0 && styles.deptItemPrimary,
                          ]}
                        >
                          <View style={styles.deptTitleRow}>
                            <View style={styles.flex1}>
                              <AppText
                                variant="h2"
                                color={Palette.primaryDark}
                                script="korean"
                              >
                                {index === 0 ? '1순위: ' : '추가: '}
                                {dept.nameKo} ({dept.pronunciationMm})
                              </AppText>
                              <AppText
                                variant="bodyBold"
                                color={Palette.textPrimary}
                              >
                                {dept.nameMm}
                              </AppText>
                            </View>
                            <Pressable
                              onPress={() =>
                                openNaverMapForDept(dept.naverMapQuery)
                              }
                              style={styles.mapLinkBtn}
                            >
                              <ExternalLink
                                size={15}
                                color={Palette.primaryDark}
                              />
                              <AppText
                                variant="badge"
                                color={Palette.primaryDark}
                              >
                                주변 {dept.nameKo} 지도
                              </AppText>
                            </Pressable>
                          </View>
                          <AppText
                            variant="burmese"
                            color={Palette.textSecondary}
                          >
                            {dept.descriptionMm}
                          </AppText>
                        </View>
                      ))}
                    </View>

                    {/* Prominent Show to Doctor CTA */}
                    <Pressable
                      onPress={() => setShowDoctorModal(true)}
                      style={({ pressed }) => [
                        styles.showDoctorCta,
                        pressed && { backgroundColor: Palette.primaryDark },
                      ]}
                    >
                      <Volume2 size={24} color="#FFFFFF" />
                      <View style={styles.flex1}>
                        <AppText
                          variant="h3"
                          color="#FFFFFF"
                          script="korean"
                        >
                          의사에게 보여주기 (전체화면 + 한국어 음성)
                        </AppText>
                        <AppText variant="caption" color="#CCFBF1">
                          ဆရာဝန်ပြရန် စာလုံးကြီးမျက်နှာပြင် နှင့် အသံထွက်ကတ် ဖွင့်ရန် နှိပ်ပါ
                        </AppText>
                      </View>
                    </Pressable>
                  </>
                ) : (
                  <View style={styles.emptyRecBox}>
                    <AlertCircle size={20} color={Palette.textSecondary} />
                    <AppText variant="burmese" color={Palette.textSecondary}>
                      အောက်ပါ ရောဂါလက္ခဏာများထဲမှ အနည်းဆုံး (၁) ခုကို ရွေးချယ်ပေးပါ။
                    </AppText>
                  </View>
                )}
              </View>

              {/* Step 1: Body-Part Filter Chips */}
              <View style={styles.sectionBlock}>
                <AppText variant="h3" color={Palette.textPrimary}>
                  1. 아픈 부위 선택 (နာကျင်နေသော ခန္ဓာကိုယ်အစိတ်အပိုင်း ရွေးပါ)
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsRow}
                >
                  {BODY_PART_FILTERS.map((part) => {
                    const active = selectedBodyPart === part.id;
                    return (
                      <Pressable
                        key={part.id}
                        onPress={() => setSelectedBodyPart(part.id)}
                        style={[
                          styles.bodyChip,
                          active && styles.bodyChipActive,
                        ]}
                      >
                        <AppText
                          variant="badge"
                          color={active ? '#FFFFFF' : Palette.textPrimary}
                        >
                          {part.labelKo} · {part.labelMm}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Step 2: Multi-Select Symptoms List */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionTitleBetween}>
                  <AppText variant="h3" color={Palette.textPrimary}>
                    2. 증상 선택 (ရောဂါလက္ခဏာ အများအပြား ရွေးနိုင်သည်)
                  </AppText>
                  {selectedSymptomIds.length > 0 ? (
                    <Pressable onPress={() => setSelectedSymptomIds([])}>
                      <AppText variant="caption" color={Palette.danger}>
                        선택 초기화 (ပြန်ဖျက်ရန်)
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>

                <View style={styles.symptomGrid}>
                  {filteredSymptoms.map((sym) => {
                    const isSelected = selectedSymptomIds.includes(sym.id);
                    const dept = CLINIC_DEPARTMENTS[sym.departmentId];
                    return (
                      <Pressable
                        key={sym.id}
                        onPress={() => toggleSymptom(sym.id)}
                        style={[
                          styles.symptomCard,
                          isSelected && styles.symptomCardSelected,
                          sym.isUrgent && styles.symptomCardUrgent,
                        ]}
                      >
                        <View style={styles.symptomCardHeader}>
                          {isSelected ? (
                            <CheckSquare size={22} color={Palette.primary} />
                          ) : (
                            <Square size={22} color={Palette.textMuted} />
                          )}
                          <View style={styles.flex1}>
                            <AppText
                              variant="h3"
                              color={Palette.textPrimary}
                              script="korean"
                            >
                              {sym.symptomKo}
                            </AppText>
                            <AppText
                              variant="burmese"
                              color={Palette.primaryDark}
                            >
                              {sym.symptomMm}
                            </AppText>
                          </View>
                          <Pressable
                            onPress={() => speakKorean(sym.doctorSentenceKo)}
                            style={styles.miniSpeakerBtn}
                          >
                            <Volume2 size={18} color={Palette.primary} />
                          </Pressable>
                        </View>

                        <View style={styles.symptomCardFooter}>
                          <AppText
                            variant="caption"
                            color={Palette.textSecondary}
                          >
                            အသံထွက်: {sym.pronunciationMm}
                          </AppText>
                          {dept ? (
                            <View style={styles.deptMiniBadge}>
                              <AppText
                                variant="caption"
                                color={Palette.secondary}
                              >
                                {dept.nameKo}
                              </AppText>
                            </View>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Step 3: Symptom Context Selector (Duration, Severity, Special Notes) */}
              <View style={styles.contextContainer}>
                <AppText variant="h3" color={Palette.textPrimary}>
                  3. 의사 선생님이 꼭 묻는 질문 (ဆရာဝန်မေးမည့် အချက်အလက်များ ထပ်ဖြည့်ရန်)
                </AppText>

                {/* Duration */}
                <AppText variant="subtitle" color={Palette.textSecondary}>
                  • 언제부터 아픈가요? (ဘယ်အချိန်က စဖြစ်တာလဲ?)
                </AppText>
                <View style={styles.optionsWrap}>
                  {SYMPTOM_DURATION_OPTIONS.map((opt, idx) => {
                    const active = durationIdx === idx;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => setDurationIdx(idx)}
                        style={[
                          styles.optionPill,
                          active && styles.optionPillActive,
                        ]}
                      >
                        <AppText
                          variant="bodyBold"
                          color={active ? '#FFFFFF' : Palette.textPrimary}
                          script="korean"
                        >
                          {opt.labelKo}
                        </AppText>
                        <AppText
                          variant="caption"
                          color={active ? '#CCFBF1' : Palette.textSecondary}
                        >
                          {opt.labelMm}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Severity */}
                <AppText variant="subtitle" color={Palette.textSecondary}>
                  • 얼마나 아픈가요? (ဘယ်လောက်နာလဲ?)
                </AppText>
                <View style={styles.optionsWrap}>
                  {SYMPTOM_SEVERITY_OPTIONS.map((opt, idx) => {
                    const active = severityIdx === idx;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => setSeverityIdx(idx)}
                        style={[
                          styles.optionPill,
                          active && styles.optionPillActive,
                        ]}
                      >
                        <AppText
                          variant="bodyBold"
                          color={active ? '#FFFFFF' : Palette.textPrimary}
                          script="korean"
                        >
                          {opt.labelKo}
                        </AppText>
                        <AppText
                          variant="caption"
                          color={active ? '#CCFBF1' : Palette.textSecondary}
                        >
                          {opt.labelMm}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Special Notes */}
                <AppText variant="subtitle" color={Palette.textSecondary}>
                  • 특별히 알려야 할 사항 (အထူးအခြေအနေ ရှိပါက ရွေးပါ)
                </AppText>
                <View style={styles.optionsWrap}>
                  {SYMPTOM_SPECIAL_NOTES.map((note) => {
                    const active = selectedNoteIds.includes(note.id);
                    return (
                      <Pressable
                        key={note.id}
                        onPress={() => toggleSpecialNote(note.id)}
                        style={[
                          styles.optionPill,
                          active && styles.optionPillDangerActive,
                        ]}
                      >
                        <AppText
                          variant="bodyBold"
                          color={active ? '#FFFFFF' : Palette.textPrimary}
                          script="korean"
                        >
                          {note.labelKo}
                        </AppText>
                        <AppText
                          variant="caption"
                          color={active ? '#FFE4E6' : Palette.textSecondary}
                        >
                          {note.labelMm}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </>
          ) : (
            /* OTC PHARMACY & CONVENIENCE STORE MEDICINES */
            <View style={styles.otcList}>
              <View style={styles.otcIntroCard}>
                <AppText variant="h3" color={Palette.primaryDark} script="korean">
                  야간/주말 약국 및 편의점 상비약 가이드
                </AppText>
                <AppText variant="burmese" color={Palette.textSecondary}>
                  ဆေးခန်းပိတ်ချိန် (ညဘက်/ပိတ်ရက်) တွင် ဆေးဆိုင် (약국) သို့မဟုတ် ၂၄ နာရီ စတိုးဆိုင် (편의점 - CU, GS25, 7-Eleven) တို့၌ ဆေးစာမလိုဘဲ ဝယ်ယူနိုင်သော အခြေခံဆေးများ —
                </AppText>
              </View>

              {OTC_MEDICINES.map((med) => (
                <View key={med.id} style={styles.otcCard}>
                  <View style={styles.otcTopRow}>
                    <View style={styles.flex1}>
                      <AppText
                        variant="h2"
                        color={Palette.textPrimary}
                        script="korean"
                      >
                        {med.nameKo}
                      </AppText>
                      <AppText variant="caption" color={Palette.primaryDark}>
                        အသံထွက်: {med.pronunciationMm}
                      </AppText>
                    </View>
                    <Pressable
                      onPress={() =>
                        speakKorean(`${med.nameKo.split('(')[0]} 주세요.`)
                      }
                      style={styles.otcSpeakBtn}
                    >
                      <Volume2 size={18} color="#FFFFFF" />
                      <AppText variant="badge" color="#FFFFFF">
                        음성 듣기
                      </AppText>
                    </Pressable>
                  </View>

                  <AppText variant="bodyBold" color={Palette.secondary}>
                    {med.typeMm}
                  </AppText>
                  <AppText variant="burmese" color={Palette.textPrimary}>
                    အသုံးဝင်ပုံ: {med.usageMm}
                  </AppText>

                  <View style={styles.otcMetaBox}>
                    <AppText variant="caption" color={Palette.primaryDark}>
                      📍 ဝယ်ယူနိုင်သည့်နေရာ: {med.whereToBuyMm} ({med.whereToBuyKo})
                    </AppText>
                    <AppText variant="caption" color={Palette.danger}>
                      ⚠️ သတိပြုရန်: {med.cautionMm}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom CTA when symptoms are selected */}
      {mediTab === 'symptoms' && selectedSymptoms.length > 0 ? (
        <View style={styles.floatingBar}>
          <Pressable
            onPress={() => setShowDoctorModal(true)}
            style={({ pressed }) => [
              styles.floatingDoctorBtn,
              pressed && { backgroundColor: Palette.primaryDark },
            ]}
          >
            <Stethoscope size={22} color="#FFFFFF" />
            <AppText variant="h3" color="#FFFFFF" script="korean">
              의사에게 보여주기 ({selectedSymptoms.length}개 증상 카드 열기)
            </AppText>
          </Pressable>
        </View>
      ) : null}

      <DoctorShowModal
        visible={showDoctorModal}
        symptoms={selectedSymptoms}
        recommendedDepartments={recommendedDepartments}
        durationOption={SYMPTOM_DURATION_OPTIONS[durationIdx]}
        severityOption={SYMPTOM_SEVERITY_OPTIONS[severityIdx]}
        specialNotes={selectedSpecialNotes}
        emergencyProfile={emergencyProfile}
        onClose={() => setShowDoctorModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 110,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.lg,
  },
  header: {
    gap: 2,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: Palette.surface,
    padding: 5,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 6,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  modeBtnActive: {
    backgroundColor: Palette.primary,
  },
  recommendationCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Palette.primary,
    gap: Spacing.md,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  deptList: {
    gap: Spacing.sm,
  },
  deptItemCard: {
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 4,
  },
  deptItemPrimary: {
    backgroundColor: '#F0FDFA',
    borderColor: Palette.primary,
  },
  deptTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  mapLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  showDoctorCta: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyRecBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  sectionBlock: {
    gap: Spacing.sm,
  },
  sectionTitleBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  bodyChip: {
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  bodyChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  symptomGrid: {
    gap: Spacing.sm,
  },
  symptomCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Palette.border,
    gap: 6,
  },
  symptomCardSelected: {
    borderColor: Palette.primary,
    backgroundColor: '#F0FDFA',
  },
  symptomCardUrgent: {
    borderColor: '#FDA4AF',
  },
  symptomCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  miniSpeakerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 30,
  },
  deptMiniBadge: {
    backgroundColor: Palette.secondarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  contextContainer: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: Spacing.sm,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  optionPill: {
    flexGrow: 1,
    minWidth: 160,
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  optionPillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primaryDark,
  },
  optionPillDangerActive: {
    backgroundColor: Palette.danger,
    borderColor: '#BE123C',
  },
  otcList: {
    gap: Spacing.md,
  },
  otcIntroCard: {
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.primary,
    gap: 4,
  },
  otcCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 6,
  },
  otcTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  otcSpeakBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  otcMetaBox: {
    marginTop: 4,
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 2,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(248, 250, 252, 0.94)',
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    alignItems: 'center',
  },
  floatingDoctorBtn: {
    width: '100%',
    maxWidth: MaxContentWidth,
    backgroundColor: Palette.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});

