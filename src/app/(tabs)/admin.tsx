import { useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  FileText,
  Recycle,
  RotateCcw,
  Search,
  ShieldAlert,
  Volume2,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import {
  MaxContentWidth,
  Palette,
  Radius,
  Spacing,
} from '@/constants/theme';
import {
  ADMIN_GUIDES,
  RECYCLING_ITEMS,
  SAFETY_ALERTS,
} from '@/data/seedData';
import { speakKorean } from '@/services/speech';
import {
  loadCompletedSteps,
  saveCompletedSteps,
} from '@/services/storage';
import type { AdminCategory, WasteCategory } from '@/types';

type AdminTabMode = 'checklists' | 'recycling' | 'safety';

const ADMIN_CATEGORY_FILTERS: {
  id: 'all' | AdminCategory;
  labelKo: string;
  labelMm: string;
}[] = [
  { id: 'all', labelKo: '전체', labelMm: 'အားလုံး' },
  { id: 'arc', labelKo: 'ARC 등록증', labelMm: 'ARC ကတ်' },
  { id: 'visa', labelKo: '비자 연장', labelMm: 'ဗီဇာသက်တမ်းတိုး' },
  { id: 'banking', labelKo: '은행 · 계좌', labelMm: 'ဘဏ်အကောင့်' },
  { id: 'housing', labelKo: '방 계약 · 전입신고', labelMm: 'အိမ်ငှား · လိပ်စာပြောင်း' },
];

const WASTE_FILTERS: {
  id: 'all' | WasteCategory;
  labelKo: string;
  labelMm: string;
}[] = [
  { id: 'all', labelKo: '전체', labelMm: 'အားလုံး' },
  { id: 'general', labelKo: '일반 (종량제)', labelMm: 'ရိုးရိုးအမှိုက်' },
  { id: 'food', labelKo: '음식물', labelMm: 'အစားအသောက်' },
  { id: 'plastic', labelKo: '페트 · 플라스틱', labelMm: 'ပလတ်စတစ်' },
  { id: 'vinyl', labelKo: '비닐류', labelMm: 'ဗီနိုင်းအိတ်' },
  { id: 'can_glass', labelKo: '캔 · 유리병', labelMm: 'သံဘူး · ပုလင်း' },
  { id: 'paper', labelKo: '종이 · 박스', labelMm: 'စက္ကူ · ပါဆယ်ပုံး' },
];

export default function AdminScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab: AdminTabMode =
    params.tab === 'recycling'
      ? 'recycling'
      : params.tab === 'safety'
        ? 'safety'
        : 'checklists';
  const [activeTab, setActiveTab] = useState<AdminTabMode>(initialTab);
  const [lastParamTab, setLastParamTab] = useState<string | undefined>(
    params.tab
  );
  if (params.tab !== lastParamTab) {
    setLastParamTab(params.tab);
    if (params.tab === 'recycling' || params.tab === 'safety') {
      setActiveTab(params.tab);
    }
  }
  const [selectedAdminCat, setSelectedAdminCat] = useState<
    'all' | AdminCategory
  >('all');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(
    {}
  );

  // Recycling state
  const [wasteSearch, setWasteSearch] = useState('');
  const [selectedWasteCat, setSelectedWasteCat] = useState<
    'all' | WasteCategory
  >('all');

  useEffect(() => {
    loadCompletedSteps().then(setCompletedSteps);
  }, []);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const updated = { ...prev, [stepId]: !prev[stepId] };
      saveCompletedSteps(updated);
      return updated;
    });
  };

  const resetGuideSteps = (stepIds: string[]) => {
    setCompletedSteps((prev) => {
      const updated = { ...prev };
      for (const id of stepIds) {
        delete updated[id];
      }
      saveCompletedSteps(updated);
      return updated;
    });
  };

  const filteredGuides = useMemo(() => {
    if (selectedAdminCat === 'all') return ADMIN_GUIDES;
    return ADMIN_GUIDES.filter((g) => g.category === selectedAdminCat);
  }, [selectedAdminCat]);

  const filteredRecycling = useMemo(() => {
    const q = wasteSearch.trim().toLowerCase();
    return RECYCLING_ITEMS.filter((item) => {
      const matchesCat =
        selectedWasteCat === 'all' || item.category === selectedWasteCat;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.nameKo.toLowerCase().includes(q) ||
        item.nameMm.toLowerCase().includes(q) ||
        item.categoryKo.toLowerCase().includes(q) ||
        item.howToDisposeMm.toLowerCase().includes(q) ||
        item.warningMm.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [wasteSearch, selectedWasteCat]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Screen Header */}
          <View style={styles.header}>
            <AppText variant="h1" color={Palette.textPrimary} script="korean">
              한국 생활 & 행정 가이드
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              ARC မှတ်ပုံတင်၊ ဗီဇာ၊ ဘဏ်၊ အိမ်ငှားစာချုပ် စစ်ဆေးချက်များ နှင့် အမှိုက်ခွဲခြားပစ်နည်း (분리수거)
            </AppText>
          </View>

          {/* Segmented Toggle Bar */}
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setActiveTab('checklists')}
              style={[
                styles.segmentButton,
                activeTab === 'checklists' && styles.segmentButtonActiveBlue,
              ]}
            >
              <ClipboardCheck
                size={18}
                color={
                  activeTab === 'checklists' ? '#FFFFFF' : Palette.textSecondary
                }
              />
              <AppText
                variant="bodyBold"
                color={
                  activeTab === 'checklists' ? '#FFFFFF' : Palette.textSecondary
                }
              >
                체크리스트 (ရုံးလုပ်ငန်း)
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('recycling')}
              style={[
                styles.segmentButton,
                activeTab === 'recycling' && styles.segmentButtonActiveTeal,
              ]}
            >
              <Recycle
                size={18}
                color={
                  activeTab === 'recycling' ? '#FFFFFF' : Palette.textSecondary
                }
              />
              <AppText
                variant="bodyBold"
                color={
                  activeTab === 'recycling' ? '#FFFFFF' : Palette.textSecondary
                }
              >
                분리수거 (အမှိုက်ပစ်နည်း)
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('safety')}
              style={[
                styles.segmentButton,
                activeTab === 'safety' && styles.segmentButtonActiveDanger,
              ]}
            >
              <ShieldAlert
                size={18}
                color={
                  activeTab === 'safety' ? '#FFFFFF' : Palette.textSecondary
                }
              />
              <AppText
                variant="bodyBold"
                color={
                  activeTab === 'safety' ? '#FFFFFF' : Palette.textSecondary
                }
              >
                사기 주의 (သတိပေးချက်)
              </AppText>
            </Pressable>
          </View>

          {/* MODE 1: STEP-BY-STEP CHECKLISTS */}
          {activeTab === 'checklists' ? (
            <View style={styles.sectionWrap}>
              {/* Category Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {ADMIN_CATEGORY_FILTERS.map((cat) => {
                  const active = selectedAdminCat === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setSelectedAdminCat(cat.id)}
                      style={[
                        styles.filterChip,
                        active && styles.filterChipActiveBlue,
                      ]}
                    >
                      <AppText
                        variant="badge"
                        color={active ? '#FFFFFF' : Palette.textPrimary}
                      >
                        {cat.labelKo} · {cat.labelMm}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Checklist Guide Cards */}
              {filteredGuides.map((guide) => {
                const total = guide.steps.length;
                const doneCount = guide.steps.filter(
                  (s) => completedSteps[s.id]
                ).length;
                const progressPct =
                  total > 0 ? Math.round((doneCount / total) * 100) : 0;

                return (
                  <View key={guide.id} style={styles.guideCard}>
                    <View style={styles.guideHeader}>
                      <View style={styles.guideBadgeRow}>
                        <View style={styles.blueBadge}>
                          <AppText variant="badge" color={Palette.secondary}>
                            {guide.badgeText}
                          </AppText>
                        </View>
                        <AppText
                          variant="caption"
                          color={Palette.textSecondary}
                        >
                          ⏱ {guide.estimatedTime}
                        </AppText>
                      </View>

                      <AppText
                        variant="h2"
                        color={Palette.textPrimary}
                        script="korean"
                      >
                        {guide.titleKo}
                      </AppText>
                      <AppText variant="bodyBold" color={Palette.secondary}>
                        {guide.titleMm}
                      </AppText>
                      <AppText variant="burmese" color={Palette.textSecondary}>
                        {guide.subtitleMm}
                      </AppText>

                      {/* Progress Bar */}
                      <View style={styles.progressSection}>
                        <View style={styles.progressLabelRow}>
                          <AppText
                            variant="caption"
                            color={
                              doneCount === total
                                ? Palette.success
                                : Palette.secondary
                            }
                          >
                            완료 진행률 (ပြီးစီးမှု): {doneCount} / {total} ({progressPct}%)
                          </AppText>
                          {doneCount > 0 ? (
                            <Pressable
                              onPress={() =>
                                resetGuideSteps(guide.steps.map((s) => s.id))
                              }
                              style={styles.resetBtn}
                            >
                              <RotateCcw size={13} color={Palette.textSecondary} />
                              <AppText
                                variant="caption"
                                color={Palette.textSecondary}
                              >
                                초기화
                              </AppText>
                            </Pressable>
                          ) : null}
                        </View>
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${progressPct}%`,
                                backgroundColor:
                                  doneCount === total
                                    ? Palette.success
                                    : Palette.secondary,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Steps List */}
                    <View style={styles.stepsContainer}>
                      {guide.steps.map((step) => {
                        const checked = Boolean(completedSteps[step.id]);
                        return (
                          <Pressable
                            key={step.id}
                            onPress={() => toggleStep(step.id)}
                            style={[
                              styles.stepItem,
                              checked && styles.stepItemChecked,
                            ]}
                          >
                            <View style={styles.stepTopRow}>
                              {checked ? (
                                <CheckCircle2
                                  size={22}
                                  color={Palette.success}
                                />
                              ) : (
                                <Circle size={22} color={Palette.secondary} />
                              )}
                              <View style={styles.flex1}>
                                <AppText
                                  variant="h3"
                                  color={
                                    checked
                                      ? Palette.success
                                      : Palette.textPrimary
                                  }
                                  script="korean"
                                >
                                  {step.titleKo}
                                </AppText>
                                <AppText
                                  variant="bodyBold"
                                  color={Palette.textPrimary}
                                >
                                  {step.titleMm}
                                </AppText>
                              </View>
                            </View>

                            <AppText
                              variant="burmese"
                              color={Palette.textSecondary}
                              style={styles.stepDesc}
                            >
                              {step.descriptionMm}
                            </AppText>

                            {step.requiredDocs && step.requiredDocs.length > 0 ? (
                              <View style={styles.docsBox}>
                                <View style={styles.docsHeader}>
                                  <FileText
                                    size={14}
                                    color={Palette.secondary}
                                  />
                                  <AppText
                                    variant="caption"
                                    color={Palette.secondary}
                                  >
                                    준비 서류 (လိုအပ်သော စာရွက်စာတမ်းများ):
                                  </AppText>
                                </View>
                                <View style={styles.docsPillsWrap}>
                                  {step.requiredDocs.map((doc) => (
                                    <View key={doc} style={styles.docPill}>
                                      <AppText
                                        variant="caption"
                                        color={Palette.textPrimary}
                                      >
                                        • {doc}
                                      </AppText>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ) : null}

                            {step.tipMm ? (
                              <View style={styles.tipBox}>
                                <AppText
                                  variant="burmese"
                                  color={Palette.primaryDark}
                                >
                                  💡 အကြံပြုချက်: {step.tipMm}
                                </AppText>
                              </View>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* MODE 2: RECYCLING GUIDE (분리수거) */}
          {activeTab === 'recycling' ? (
            <View style={styles.sectionWrap}>
              {/* Convenience Store Trash Bag Phrase Banner */}
              <Pressable
                onPress={() =>
                  speakKorean(
                    '일반 쓰레기 종량제 봉투 이십 리터짜리랑 음식물 쓰레기 봉투 주세요.'
                  )
                }
                style={styles.bagPhraseBanner}
              >
                <View style={styles.flex1}>
                  <AppText variant="badge" color={Palette.primaryDark}>
                    편의점/마트에서 쓰레기봉투 살 때 (အမှိုက်အိတ်ဝယ်ချိန် ပြောရန်)
                  </AppText>
                  <AppText
                    variant="h3"
                    color={Palette.textPrimary}
                    script="korean"
                  >
                    &ldquo;일반 쓰레기 종량제 봉투(20L)랑 음식물 봉투 주세요.&rdquo;
                  </AppText>
                  <AppText variant="burmese" color={Palette.textSecondary}>
                    ရိုးရိုးအမှိုက်အိတ် (20L) နဲ့ အစားအသောက်အမှိုက်အိတ် ပေးပါ။ (နှိပ်၍ အသံနားထောင်ပါ)
                  </AppText>
                </View>
                <View style={styles.ttsCircle}>
                  <Volume2 size={20} color="#FFFFFF" />
                </View>
              </Pressable>

              {/* Search Input */}
              <View style={styles.searchBar}>
                <Search size={18} color={Palette.textSecondary} />
                <TextInput
                  value={wasteSearch}
                  onChangeText={setWasteSearch}
                  placeholder="အမှိုက်အမျိုးအစား ရှာရန် (ဥပမာ - ကြက်ရိုး, 페트병, 라면봉지, ပလတ်စတစ်)..."
                  placeholderTextColor={Palette.textMuted}
                  style={styles.searchInput}
                />
              </View>

              {/* Waste Category Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {WASTE_FILTERS.map((wf) => {
                  const active = selectedWasteCat === wf.id;
                  return (
                    <Pressable
                      key={wf.id}
                      onPress={() => setSelectedWasteCat(wf.id)}
                      style={[
                        styles.filterChip,
                        active && styles.filterChipActiveTeal,
                      ]}
                    >
                      <AppText
                        variant="badge"
                        color={active ? '#FFFFFF' : Palette.textPrimary}
                      >
                        {wf.labelKo} · {wf.labelMm}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Recycling Cards */}
              {filteredRecycling.map((item) => (
                <View key={item.id} style={styles.recyclingCard}>
                  <View style={styles.recyclingTopRow}>
                    <View style={styles.tealPill}>
                      <AppText variant="badge" color={Palette.primaryDark}>
                        {item.categoryKo}
                      </AppText>
                    </View>
                    <AppText variant="caption" color={Palette.textSecondary}>
                      배출 방법: {item.bagTypeKo}
                    </AppText>
                  </View>

                  <AppText
                    variant="h2"
                    color={Palette.textPrimary}
                    script="korean"
                  >
                    {item.nameKo}
                  </AppText>
                  <AppText variant="bodyBold" color={Palette.primaryDark}>
                    {item.nameMm} ({item.categoryMm})
                  </AppText>

                  <View style={styles.disposeBox}>
                    <AppText variant="badge" color={Palette.primaryDark}>
                      ✅ 올바른 배출 방법 (မှန်ကန်စွာ စွန့်ပစ်နည်း)
                    </AppText>
                    <AppText variant="burmese" color={Palette.textPrimary}>
                      {item.howToDisposeMm}
                    </AppText>
                  </View>

                  <View style={styles.warningBox}>
                    <View style={styles.warningHeader}>
                      <AlertTriangle size={16} color={Palette.danger} />
                      <AppText variant="badge" color={Palette.danger}>
                        과태료 주의! (ဒဏ်ငွေမဆောင်ရစေရန် အထူးသတိပြုရန်)
                      </AppText>
                    </View>
                    <AppText variant="burmese" color={Palette.textPrimary}>
                      {item.warningMm}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {/* MODE 3: SCAM & SAFETY ALERTS */}
          {activeTab === 'safety' ? (
            <View style={styles.sectionWrap}>
              {SAFETY_ALERTS.map((alert) => (
                <View key={alert.id} style={styles.safetyCard}>
                  <View style={styles.warningHeader}>
                    <ShieldAlert size={22} color={Palette.danger} />
                    <AppText
                      variant="h2"
                      color={Palette.danger}
                      script="korean"
                    >
                      {alert.titleKo}
                    </AppText>
                  </View>
                  <AppText variant="bodyBold" color={Palette.textPrimary}>
                    {alert.titleMm}
                  </AppText>
                  <AppText variant="burmese" color={Palette.textSecondary}>
                    {alert.summaryMm}
                  </AppText>

                  <View style={styles.safetyStepsBox}>
                    {alert.actionStepsMm.map((step, idx) => (
                      <AppText
                        key={idx}
                        variant="burmese"
                        color={Palette.textPrimary}
                      >
                        {idx + 1}. {step}
                      </AppText>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.xxxl,
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Palette.surface,
    padding: 5,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 6,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  segmentButtonActiveBlue: {
    backgroundColor: Palette.secondary,
  },
  segmentButtonActiveTeal: {
    backgroundColor: Palette.primary,
  },
  segmentButtonActiveDanger: {
    backgroundColor: Palette.danger,
  },
  sectionWrap: {
    gap: Spacing.md,
  },
  chipsRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  filterChip: {
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  filterChipActiveBlue: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  filterChipActiveTeal: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  guideCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: Spacing.md,
  },
  guideHeader: {
    gap: 4,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  guideBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  blueBadge: {
    backgroundColor: Palette.secondarySoft,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  progressSection: {
    marginTop: Spacing.sm,
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Palette.surfaceSubtle,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  stepsContainer: {
    gap: Spacing.md,
  },
  stepItem: {
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 6,
  },
  stepItemChecked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  stepTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  stepDesc: {
    paddingLeft: 30,
  },
  docsBox: {
    marginLeft: 30,
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 4,
  },
  docsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docsPillsWrap: {
    gap: 2,
  },
  docPill: {
    paddingHorizontal: 4,
  },
  tipBox: {
    marginLeft: 30,
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  bagPhraseBanner: {
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ttsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Palette.textPrimary,
    paddingVertical: 4,
  },
  recyclingCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: Spacing.sm,
  },
  recyclingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  tealPill: {
    backgroundColor: Palette.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  disposeBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
    gap: 4,
  },
  warningBox: {
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FDA4AF',
    gap: 4,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safetyCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Palette.danger,
    gap: Spacing.sm,
  },
  safetyStepsBox: {
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
  },
});

