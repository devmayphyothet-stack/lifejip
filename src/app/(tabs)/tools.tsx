import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  Bookmark,
  Calculator,
  CalendarClock,
  Check,
  CloudUpload,
  HeartPulse,
  MapPin,
  Save,
  ShieldAlert,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CurrencyConverterCard } from '@/components/calculators/CurrencyConverterCard';
import { WageCalculatorCard } from '@/components/calculators/WageCalculatorCard';
import { CommunityTipsCard } from '@/components/ai/CommunityTipsCard';
import { DocumentScannerCard } from '@/components/ai/DocumentScannerCard';
import { EmergencyAllergyModal } from '@/components/modals/EmergencyAllergyModal';
import { AppText } from '@/components/ui/AppText';
import {
  MaxContentWidth,
  Palette,
  Radius,
  Spacing,
} from '@/constants/theme';
import {
  DEFAULT_EMERGENCY_PROFILE,
  SITUATION_VOCABS,
} from '@/data/seedData';
import { speakKorean } from '@/services/speech';
import {
  loadBookmarkedPhrases,
  loadEmergencyProfile,
  saveBookmarkedPhrases,
  saveEmergencyProfile,
} from '@/services/storage';
import {
  type SyncStatusResult,
  getLastSyncTimestamp,
  performCloudSync,
} from '@/services/sync';
import type { EmergencyProfile } from '@/types';

type ToolsTabMode =
  | 'calculators'
  | 'ai_scanner'
  | 'emergency_visa'
  | 'community';

const BLOOD_TYPES = [
  'O+ (RH+ O형)',
  'A+ (RH+ A형)',
  'B+ (RH+ B형)',
  'AB+ (RH+ AB형)',
  '모름 (မသိပါ)',
];

const VISA_TYPES = [
  'D-2 (유학)',
  'D-4 (어학연수)',
  'E-9 (비전문취업)',
  'E-7 (특정활동)',
  'G-1 (기타)',
  'D-10 (구직)',
];

const QUICK_ALLERGY_PRESETS = [
  {
    ko: '페니실린/항생제 알레르기 있음',
    mm: 'ပဋိဇီဝဆေး (Penicillin) ဓာတ်မတည့်ပါ',
  },
  {
    ko: '진통제(아스피린/NSAIDs) 알레르기 있음',
    mm: 'အကိုက်အခဲပျောက်ဆေး ဓာတ်မတည့်ပါ',
  },
  {
    ko: '갑각류(새우·게) 음식 알레르기 있음',
    mm: 'ပုစွန်/ဂဏန်း ပင်လယ်စာ ဓာတ်မတည့်ပါ',
  },
  {
    ko: '특이 약물·음식 알레르기 없음',
    mm: 'ထူးခြားသော ဆေး/အစာ ဓာတ်မတည့်မှု မရှိပါ',
  },
];

export default function ToolsScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const initialSection: ToolsTabMode =
    params.section === 'ai_scanner'
      ? 'ai_scanner'
      : params.section === 'emergency_visa'
        ? 'emergency_visa'
        : params.section === 'community'
          ? 'community'
          : 'calculators';

  const [activeSection, setActiveSection] =
    useState<ToolsTabMode>(initialSection);
  const [lastParamSection, setLastParamSection] = useState<string | undefined>(
    params.section
  );
  if (params.section !== lastParamSection) {
    setLastParamSection(params.section);
    if (
      params.section === 'calculators' ||
      params.section === 'ai_scanner' ||
      params.section === 'emergency_visa' ||
      params.section === 'community'
    ) {
      setActiveSection(params.section);
    }
  }

  const [profile, setProfile] = useState<EmergencyProfile>(
    DEFAULT_EMERGENCY_PROFILE
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncStatusResult | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEmergencyProfile().then(setProfile);
      loadBookmarkedPhrases().then(setBookmarkedIds);
      getLastSyncTimestamp().then(setLastSyncTime);
    }, [])
  );

  const handleSaveProfile = async () => {
    await saveEmergencyProfile(profile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    await saveEmergencyProfile(profile);
    const res = await performCloudSync();
    setSyncResult(res);
    setLastSyncTime(res.lastSyncedAt);
    setIsSyncing(false);
  };

  const removeBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const updated = prev.filter((item) => item !== id);
      saveBookmarkedPhrases(updated);
      return updated;
    });
  };

  const getVisaDDay = () => {
    if (!profile.visaExpiryDate) return null;
    const expiry = new Date(profile.visaExpiryDate);
    if (Number.isNaN(expiry.getTime())) return null;
    const now = new Date();
    return Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const visaDDay = getVisaDDay();
  const savedPhrases = SITUATION_VOCABS.filter((p) =>
    bookmarkedIds.includes(p.id)
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
              계산기 · 응급카드 · 약봉투 도구 (Tools & Saved)
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              အချိန်ပိုင်းလစာ/주휴수당 တွက်စက်၊ KRW ⇄ MMK ငွေလဲနှုန်းတွက်စက်၊ အရေးပေါ်ဆေးဘက်ဆိုင်ရာကတ်၊ ဗီဇာသက်တမ်း D-Day နှင့် ဆေးအိတ်ဖတ်စက်
            </AppText>
          </View>

          {/* Top Full-Screen SOS Card Trigger Banner */}
          <View style={styles.sosBanner}>
            <View style={styles.flex1}>
              <View style={styles.sosBadge}>
                <ShieldAlert size={16} color="#FFFFFF" />
                <AppText variant="badge" color="#FFFFFF">
                  OFFLINE EMERGENCY & ADDRESS CARD
                </AppText>
              </View>
              <AppText variant="h2" color={Palette.danger} script="korean">
                응급실 · 구급대원 · 택시용 전체화면 카드
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                သွေးအမျိုးအစား၊ ဆေးဓာတ်မတည့်မှု နှင့် နေရပ်လိပ်စာကို စာလုံးကြီး မျက်နှာပြင်အပြည့်ဖြင့် ဖွင့်ပြရန် —
              </AppText>
            </View>
            <Pressable
              onPress={() => setShowEmergencyModal(true)}
              style={styles.openFullBtn}
            >
              <HeartPulse size={20} color="#FFFFFF" />
              <AppText variant="bodyBold" color="#FFFFFF">
                전체화면 열기
              </AppText>
            </Pressable>
          </View>

          {/* 4-Way Section Switcher */}
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setActiveSection('calculators')}
              style={[
                styles.segmentBtn,
                activeSection === 'calculators' && styles.segmentBtnBlue,
              ]}
            >
              <Calculator
                size={16}
                color={
                  activeSection === 'calculators'
                    ? '#FFFFFF'
                    : Palette.textSecondary
                }
              />
              <AppText
                variant="badge"
                color={
                  activeSection === 'calculators'
                    ? '#FFFFFF'
                    : Palette.textSecondary
                }
              >
                급여 · 환율
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setActiveSection('ai_scanner')}
              style={[
                styles.segmentBtn,
                activeSection === 'ai_scanner' && styles.segmentBtnViolet,
              ]}
            >
              <Sparkles
                size={16}
                color={
                  activeSection === 'ai_scanner'
                    ? '#FFFFFF'
                    : Palette.textSecondary
                }
              />
              <AppText
                variant="badge"
                color={
                  activeSection === 'ai_scanner'
                    ? '#FFFFFF'
                    : Palette.textSecondary
                }
              >
                AI 스캐너
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setActiveSection('emergency_visa')}
              style={[
                styles.segmentBtn,
                activeSection === 'emergency_visa' && styles.segmentBtnDanger,
              ]}
            >
              <HeartPulse
                size={16}
                color={
                  activeSection === 'emergency_visa'
                    ? '#FFFFFF'
                    : Palette.textSecondary
                }
              />
              <AppText
                variant="badge"
                color={
                  activeSection === 'emergency_visa'
                    ? '#FFFFFF'
                    : Palette.textSecondary
                }
              >
                응급 · 비자
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setActiveSection('community')}
              style={[
                styles.segmentBtn,
                activeSection === 'community' && styles.segmentBtnTeal,
              ]}
            >
              <Bookmark
                size={16}
                color={
                  activeSection === 'community'
                    ? '#FFFFFF'
                    : Palette.textSecondary
                }
              />
              <AppText
                variant="badge"
                color={
                  activeSection === 'community'
                    ? '#FFFFFF'
                    : Palette.textSecondary
                }
              >
                꿀팁 · 저장
              </AppText>
            </Pressable>
          </View>

          {/* SECTION 1: WAGE & CURRENCY CALCULATORS */}
          {activeSection === 'calculators' ? (
            <View style={styles.sectionStack}>
              <WageCalculatorCard />
              <CurrencyConverterCard />
            </View>
          ) : null}

          {/* SECTION 2: VISION AI DOCUMENT SCANNER */}
          {activeSection === 'ai_scanner' ? (
            <View style={styles.sectionStack}>
              <DocumentScannerCard />
            </View>
          ) : null}

          {/* SECTION 2: EMERGENCY PROFILE, VISA COUNTDOWN & SUPABASE CLOUD SYNC */}
          {activeSection === 'emergency_visa' ? (
            <View style={styles.sectionStack}>
              {/* Visa Expiry Countdown & Cloud Sync Card */}
              <View style={styles.visaCloudCard}>
                <View style={styles.visaTopRow}>
                  <View style={styles.cardHeaderRow}>
                    <CalendarClock size={20} color="#B45309" />
                    <AppText variant="h2" color={Palette.textPrimary} script="korean">
                      비자 만료 D-Day & 클라우드 백업
                    </AppText>
                  </View>
                  {visaDDay !== null ? (
                    <View
                      style={[
                        styles.dDayBadge,
                        visaDDay <= 60 && { backgroundColor: Palette.danger },
                      ]}
                    >
                      <AppText variant="badge" color="#FFFFFF">
                        {visaDDay >= 0
                          ? `만료 D-${visaDDay}일`
                          : `만료 D+${Math.abs(visaDDay)}일 경과`}
                      </AppText>
                    </View>
                  ) : null}
                </View>

                <AppText variant="burmese" color={Palette.textSecondary}>
                  သင့်ဗီဇာ ({profile.visaType}) ကုန်ဆုံးရက်မှာ {profile.visaExpiryDate} ဖြစ်ပါသည်။ ဗီဇာမကုန်မီ (၄) လအလိုမှစ၍ HiKorea တွင် သက်တမ်းတိုး လျှောက်ထားနိုင်ပါသည်။
                </AppText>

                <View style={styles.syncRow}>
                  <View style={styles.flex1}>
                    <AppText variant="caption" color={Palette.textSecondary}>
                      마지막 동기화: {lastSyncTime ?? '로컬 오프라인 모드 작동 중'}
                    </AppText>
                    {syncResult ? (
                      <AppText variant="burmese" color={Palette.primaryDark}>
                        ✓ {syncResult.messageMm}
                      </AppText>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={handleCloudSync}
                    style={styles.syncBtn}
                  >
                    <CloudUpload size={18} color="#FFFFFF" />
                    <AppText variant="badge" color="#FFFFFF">
                      {isSyncing ? '동기화 중...' : '데이터 백업 · 동기화'}
                    </AppText>
                  </Pressable>
                </View>
              </View>

              {/* Editable Offline Emergency & Korean Address Form */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <HeartPulse size={20} color={Palette.danger} />
                  <AppText
                    variant="h2"
                    color={Palette.textPrimary}
                    script="korean"
                  >
                    내 응급 의료 · 알레르기 · 주소 정보 설정
                  </AppText>
                </View>

                {/* Blood Type Selector */}
                <View style={styles.fieldGroup}>
                  <AppText variant="bodyBold" color={Palette.textPrimary}>
                    1. 혈액형 (သွေးအမျိုးအစား ရွေးပါ)
                  </AppText>
                  <View style={styles.chipsWrap}>
                    {BLOOD_TYPES.map((bt) => {
                      const active = profile.bloodType === bt;
                      return (
                        <Pressable
                          key={bt}
                          onPress={() =>
                            setProfile((prev) => ({ ...prev, bloodType: bt }))
                          }
                          style={[
                            styles.selectChip,
                            active && styles.selectChipDanger,
                          ]}
                        >
                          <AppText
                            variant="badge"
                            color={active ? '#FFFFFF' : Palette.textPrimary}
                          >
                            {bt}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Visa Type Selector */}
                <View style={styles.fieldGroup}>
                  <AppText variant="bodyBold" color={Palette.textPrimary}>
                    2. 체류자격 / 비자 종류 (ဗီဇာအမျိုးအစား ရွေးပါ)
                  </AppText>
                  <View style={styles.chipsWrap}>
                    {VISA_TYPES.map((vt) => {
                      const active = profile.visaType === vt;
                      return (
                        <Pressable
                          key={vt}
                          onPress={() =>
                            setProfile((prev) => ({ ...prev, visaType: vt }))
                          }
                          style={[
                            styles.selectChip,
                            active && styles.selectChipBlue,
                          ]}
                        >
                          <AppText
                            variant="badge"
                            color={active ? '#FFFFFF' : Palette.textPrimary}
                          >
                            {vt}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Quick Allergy Presets + Input */}
                <View style={styles.fieldGroup}>
                  <AppText variant="bodyBold" color={Palette.textPrimary}>
                    3. 약물 · 음식 알레르기 (ဆေးနှင့် အစားအသောက် ဓာတ်မတည့်မှု)
                  </AppText>
                  <View style={styles.chipsWrap}>
                    {QUICK_ALLERGY_PRESETS.map((preset) => {
                      const active = profile.allergiesKo === preset.ko;
                      return (
                        <Pressable
                          key={preset.ko}
                          onPress={() =>
                            setProfile((prev) => ({
                              ...prev,
                              allergiesKo: preset.ko,
                              allergiesMm: preset.mm,
                            }))
                          }
                          style={[
                            styles.selectChip,
                            active && styles.selectChipTeal,
                          ]}
                        >
                          <AppText
                            variant="caption"
                            color={active ? '#FFFFFF' : Palette.textPrimary}
                          >
                            {preset.ko} ({preset.mm})
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    value={profile.allergiesKo}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, allergiesKo: text }))
                    }
                    placeholder="한국어로 알레르기 정보 입력..."
                    placeholderTextColor={Palette.textMuted}
                    style={styles.input}
                  />
                </View>

                {/* Chronic Conditions & Medications */}
                <View style={styles.fieldGroup}>
                  <AppText variant="bodyBold" color={Palette.textPrimary}>
                    4. 기저질환 및 복용 중인 약 (ရောဂါအခံ နှင့် လက်ရှိသောက်နေသောဆေး)
                  </AppText>
                  <TextInput
                    value={profile.chronicConditionsKo}
                    onChangeText={(text) =>
                      setProfile((prev) => ({
                        ...prev,
                        chronicConditionsKo: text,
                      }))
                    }
                    placeholder="예: 고혈압, 당뇨, 천식 / 기저질환 없음"
                    placeholderTextColor={Palette.textMuted}
                    style={styles.input}
                  />
                  <TextInput
                    value={profile.medicationsKo}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, medicationsKo: text }))
                    }
                    placeholder="현재 복용 중인 약 (예: 혈압약 매일 복용 중)"
                    placeholderTextColor={Palette.textMuted}
                    style={styles.input}
                  />
                </View>

                {/* My Korean Address */}
                <View style={styles.fieldGroup}>
                  <View style={styles.cardHeaderRow}>
                    <MapPin size={18} color={Palette.secondary} />
                    <AppText variant="bodyBold" color={Palette.secondary}>
                      5. 내 한국 도로명 주소 (နေထိုင်ရာ ကိုရီးယားလိပ်စာ — တက္ကစီ/119 ပြရန်)
                    </AppText>
                  </View>
                  <TextInput
                    value={profile.koreanAddressKo}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, koreanAddressKo: text }))
                    }
                    placeholder="예: 서울특별시 용산구 한남대로 28길 12, 201호"
                    placeholderTextColor={Palette.textMuted}
                    style={styles.input}
                  />
                </View>

                {/* Emergency Contact & Visa Expiry */}
                <View style={styles.twoColRow}>
                  <View style={[styles.fieldGroup, styles.flex1]}>
                    <AppText variant="bodyBold" color={Palette.textPrimary}>
                      6. 비상연락처 (အရေးပေါ်ဖုန်းနံပါတ်)
                    </AppText>
                    <TextInput
                      value={profile.emergencyContactPhone}
                      onChangeText={(text) =>
                        setProfile((prev) => ({
                          ...prev,
                          emergencyContactPhone: text,
                        }))
                      }
                      placeholder="010-0000-0000"
                      placeholderTextColor={Palette.textMuted}
                      style={styles.input}
                    />
                  </View>

                  <View style={[styles.fieldGroup, styles.flex1]}>
                    <AppText variant="bodyBold" color={Palette.textPrimary}>
                      7. 비자 만료일 (ဗီဇာကုန်ဆုံးရက် YYYY-MM-DD)
                    </AppText>
                    <TextInput
                      value={profile.visaExpiryDate}
                      onChangeText={(text) =>
                        setProfile((prev) => ({
                          ...prev,
                          visaExpiryDate: text,
                        }))
                      }
                      placeholder="2027-03-31"
                      placeholderTextColor={Palette.textMuted}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Save Button */}
                <Pressable
                  onPress={handleSaveProfile}
                  style={({ pressed }) => [
                    styles.saveBtn,
                    savedNotice && { backgroundColor: Palette.success },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  {savedNotice ? (
                    <Check size={20} color="#FFFFFF" />
                  ) : (
                    <Save size={20} color="#FFFFFF" />
                  )}
                  <AppText variant="bodyBold" color="#FFFFFF">
                    {savedNotice
                      ? '저장 완료! (သိမ်းဆည်းပြီးပါပြီ)'
                      : '내 응급·비자·주소 카드 저장하기 (သိမ်းဆည်းရန်)'}
                  </AppText>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* SECTION 4: COMMUNITY TIPS & SAVED PHRASES */}
          {activeSection === 'community' ? (
            <View style={styles.sectionStack}>
              {/* Community Tips Feed & Add Form */}
              <CommunityTipsCard />

              {/* Saved / Bookmarked Phrases */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Bookmark size={20} color={Palette.secondary} />
                  <AppText
                    variant="h2"
                    color={Palette.textPrimary}
                    script="korean"
                  >
                    저장한 필수 회화 ({savedPhrases.length}개)
                  </AppText>
                </View>

                {savedPhrases.length === 0 ? (
                  <AppText variant="burmese" color={Palette.textSecondary}>
                    Phrasebook တွင် ★ နှိပ်၍ မှတ်သားထားသော စကားပြောများ ဤနေရာတွင် ပေါ်လာပါမည်။
                  </AppText>
                ) : (
                  savedPhrases.map((phrase) => (
                    <View key={phrase.id} style={styles.savedPhraseRow}>
                      <View style={styles.flex1}>
                        <AppText
                          variant="h3"
                          color={Palette.textPrimary}
                          script="korean"
                        >
                          {phrase.korean}
                        </AppText>
                        <AppText
                          variant="burmese"
                          color={Palette.textSecondary}
                        >
                          {phrase.burmese} ({phrase.pronunciationMm})
                        </AppText>
                      </View>
                      <Pressable
                        onPress={() => speakKorean(phrase.korean)}
                        style={styles.iconCircleBtn}
                      >
                        <Volume2 size={18} color="#FFFFFF" />
                      </Pressable>
                      <Pressable
                        onPress={() => removeBookmark(phrase.id)}
                        style={styles.unbookmarkBtn}
                      >
                        <AppText variant="caption" color={Palette.danger}>
                          삭제
                        </AppText>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <EmergencyAllergyModal
        visible={showEmergencyModal}
        profile={profile}
        onClose={() => setShowEmergencyModal(false)}
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
  sosBanner: {
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Palette.danger,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Palette.danger,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: 4,
  },
  openFullBtn: {
    backgroundColor: Palette.danger,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  segmentBtnBlue: {
    backgroundColor: Palette.secondary,
  },
  segmentBtnViolet: {
    backgroundColor: Palette.aiAccent,
  },
  segmentBtnDanger: {
    backgroundColor: Palette.danger,
  },
  segmentBtnTeal: {
    backgroundColor: Palette.primary,
  },
  sectionStack: {
    gap: Spacing.lg,
  },
  visaCloudCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: Spacing.sm,
  },
  visaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  dDayBadge: {
    backgroundColor: Palette.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  syncRow: {
    marginTop: 4,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  syncBtn: {
    backgroundColor: Palette.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectChip: {
    backgroundColor: Palette.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  selectChipDanger: {
    backgroundColor: Palette.danger,
    borderColor: Palette.danger,
  },
  selectChipBlue: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  selectChipTeal: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  input: {
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  twoColRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
    minWidth: 200,
  },
  saveBtn: {
    backgroundColor: Palette.secondary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  savedPhraseRow: {
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unbookmarkBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roadmapCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: 4,
  },
  roadmapViolet: {
    backgroundColor: Palette.aiAccentSoft,
    borderColor: '#C4B5FD',
  },
});
