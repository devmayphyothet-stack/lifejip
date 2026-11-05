import { useFocusEffect } from 'expo-router';
import {
  Bookmark,
  Calculator,
  Check,
  HeartPulse,
  MapPin,
  Pill,
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
import type { EmergencyProfile } from '@/types';

const BLOOD_TYPES = [
  'O+ (RH+ O형)',
  'A+ (RH+ A형)',
  'B+ (RH+ B형)',
  'AB+ (RH+ AB형)',
  '모름 (မသိပါ)',
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

const PRESCRIPTION_DECODER_ITEMS = [
  {
    ko: '1일 3회 · 3일분',
    mm: 'တစ်နေ့ (၃) ကြိမ် · (၃) ရက်စာ',
    detailMm: 'မနက်၊ နေ့လယ်၊ ညနေ တစ်ထုပ်စီ သောက်ရန်',
  },
  {
    ko: '식후 30분 복용',
    mm: 'ထမင်းစားပြီး မိနစ် (၃၀) အကြာ သောက်ရန်',
    detailMm: 'အစာအိမ်မထိခိုက်စေရန် အစာစားပြီးမှ သောက်ပါ',
  },
  {
    ko: '식전 30분 / 공복 복용',
    mm: 'ထမင်းမစားမီ မိနစ် (၃၀) / အစာအိမ်အလွတ်တွင် သောက်ရန်',
    detailMm: 'အစာအိမ်ဆေး သို့မဟုတ် အချို့ဆေးများအတွက်',
  },
  {
    ko: '취침 전 1포(1정) 복용',
    mm: 'အိပ်ရာမဝင်မီ (၁) ထုပ် / (၁) လုံး သောက်ရန်',
    detailMm: 'အိပ်ငိုက်စေတတ်သော နှာစေး/ဓာတ်မတည့်ဆေးများ ပါဝင်တတ်သည်',
  },
];

export default function ToolsScreen() {
  const [profile, setProfile] = useState<EmergencyProfile>(
    DEFAULT_EMERGENCY_PROFILE
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEmergencyProfile().then(setProfile);
      loadBookmarkedPhrases().then(setBookmarkedIds);
    }, [])
  );

  const handleSaveProfile = async () => {
    await saveEmergencyProfile(profile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const removeBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const updated = prev.filter((item) => item !== id);
      saveBookmarkedPhrases(updated);
      return updated;
    });
  };

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
              응급 · 주소 카드 & 생활 도구 (Tools & Saved)
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              အင်တာနက်မရှိချိန်တွင်ပါ အသုံးပြုနိုင်သော အရေးပေါ် ဆေးဘက်ဆိုင်ရာကတ်၊ ကိုရီးယားလိပ်စာကတ် နှင့် ဆေးအိတ်အညွှန်း ဖတ်နည်း
            </AppText>
          </View>

          {/* Full-Screen SOS Card Trigger Banner */}
          <View style={styles.sosBanner}>
            <View style={styles.flex1}>
              <View style={styles.sosBadge}>
                <ShieldAlert size={16} color="#FFFFFF" />
                <AppText variant="badge" color="#FFFFFF">
                  OFFLINE EMERGENCY CARD
                </AppText>
              </View>
              <AppText variant="h2" color={Palette.danger} script="korean">
                응급실 · 구급대원 · 택시용 전체화면 카드
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                သိမ်းဆည်းထားသော သွေးအမျိုးအစား၊ ဆေးဓာတ်မတည့်မှု နှင့် နေရပ်လိပ်စာကို စာလုံးကြီး မျက်နှာပြင်အပြည့်ဖြင့် ဖွင့်ပြရန် —
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

          {/* Editable Offline Emergency & Korean Address Profile Form */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <HeartPulse size={20} color={Palette.danger} />
              <AppText variant="h2" color={Palette.textPrimary} script="korean">
                내 응급 의료 · 알레르기 · 주소 정보 설정
              </AppText>
            </View>
            <AppText variant="burmese" color={Palette.textSecondary}>
              အောက်ပါအချက်အလက်များသည် သင့်ဖုန်းထဲတွင်သာ လုံခြုံစွာ သိမ်းဆည်းထားပြီး အင်တာနက်မရှိချိန်တွင်ပါ ဆရာဝန်အား ပြသနိုင်ပါသည်။
            </AppText>

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

            {/* Quick Allergy Presets + Input */}
            <View style={styles.fieldGroup}>
              <AppText variant="bodyBold" color={Palette.textPrimary}>
                2. 약물 · 음식 알레르기 (ဆေးနှင့် အစားအသောက် ဓာတ်မတည့်မှု)
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
                3. 기저질환 및 복용 중인 약 (ရောဂါအခံ နှင့် လက်ရှိသောက်နေသောဆေး)
              </AppText>
              <TextInput
                value={profile.chronicConditionsKo}
                onChangeText={(text) =>
                  setProfile((prev) => ({ ...prev, chronicConditionsKo: text }))
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

            {/* My Korean Address (도로명 주소) */}
            <View style={styles.fieldGroup}>
              <View style={styles.cardHeaderRow}>
                <MapPin size={18} color={Palette.secondary} />
                <AppText variant="bodyBold" color={Palette.secondary}>
                  4. 내 한국 도로명 주소 (နေထိုင်ရာ ကိုရီးယားလိပ်စာ — တက္ကစီ/119 ပြရန်)
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
                  5. 비상연락처 (အရေးပေါ်ဖုန်းနံပါတ်)
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
                  6. 비자 만료일 (ဗီဇာကုန်ဆုံးရက် YYYY-MM-DD)
                </AppText>
                <TextInput
                  value={profile.visaExpiryDate}
                  onChangeText={(text) =>
                    setProfile((prev) => ({ ...prev, visaExpiryDate: text }))
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
                  : '내 응급·주소 카드 저장하기 (သိမ်းဆည်းရန်)'}
              </AppText>
            </Pressable>
          </View>

          {/* Prescription & Medicine Bag Dosage Decoder (처방전 / 약봉투 읽는 법) */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Pill size={20} color={Palette.primary} />
              <AppText variant="h2" color={Palette.textPrimary} script="korean">
                약봉투 · 처방전 복용법 해독기 (ဆေးအိတ်အညွှန်း ဖတ်နည်း)
              </AppText>
            </View>
            <AppText variant="burmese" color={Palette.textSecondary}>
              ကိုရီးယားဆေးဆိုင် (약국) မှ ပေးလိုက်သော ဆေးအိတ်ပေါ်ရှိ စာသားများ၏ အဓိပ္ပာယ် —
            </AppText>

            <View style={styles.decoderGrid}>
              {PRESCRIPTION_DECODER_ITEMS.map((item) => (
                <Pressable
                  key={item.ko}
                  onPress={() => speakKorean(item.ko)}
                  style={styles.decoderCard}
                >
                  <View style={styles.decoderHeader}>
                    <AppText
                      variant="h3"
                      color={Palette.primaryDark}
                      script="korean"
                    >
                      {item.ko}
                    </AppText>
                    <Volume2 size={16} color={Palette.primary} />
                  </View>
                  <AppText variant="bodyBold" color={Palette.textPrimary}>
                    {item.mm}
                  </AppText>
                  <AppText variant="caption" color={Palette.textSecondary}>
                    {item.detailMm}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Saved / Bookmarked Phrases */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Bookmark size={20} color={Palette.secondary} />
              <AppText variant="h2" color={Palette.textPrimary} script="korean">
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
                    <AppText variant="burmese" color={Palette.textSecondary}>
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

          {/* V2 & V3 Upcoming Modules Preview */}
          <View style={styles.roadmapRow}>
            <View style={[styles.roadmapCard, styles.roadmapBlue]}>
              <View style={styles.cardHeaderRow}>
                <Calculator size={18} color={Palette.secondary} />
                <AppText variant="badge" color={Palette.secondary}>
                  Phase 2 (V2) 모듈
                </AppText>
              </View>
              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                아르바이트 급여 · 주휴수당 & 원화(KRW)⇄짯(MMK) 계산기
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                အချိန်ပိုင်းအလုပ်လစာ၊ 주휴수당 (အပတ်စဉ်ပိတ်ရက်ဆုကြေး) နှင့် ဝမ် ⇄ ကျပ် ငွေလဲနှုန်းတွက်ချက်စက် (Phase 2 တွင် ပါဝင်မည်)။
              </AppText>
            </View>

            <View style={[styles.roadmapCard, styles.roadmapViolet]}>
              <View style={styles.cardHeaderRow}>
                <Sparkles size={18} color={Palette.aiAccent} />
                <AppText variant="badge" color={Palette.aiAccent}>
                  Phase 3 (V3) Vision AI
                </AppText>
              </View>
              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                AI 고지서 · 계약서 · 처방전 카메라 번역기
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                관리비 မီတာစာရွက်၊ အိမ်ငှားစာချုပ် နှင့် ဆေးစာများကို ဓာတ်ပုံရိုက်ရုံဖြင့် မြန်မာလို အနှစ်ချုပ်ရှင်းပြပေးမည့် AI Scanner။
              </AppText>
            </View>
          </View>
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
  decoderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  decoderCard: {
    flexGrow: 1,
    flexBasis: 210,
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
    gap: 2,
  },
  decoderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  roadmapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  roadmapCard: {
    flexGrow: 1,
    flexBasis: 260,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: 4,
  },
  roadmapBlue: {
    backgroundColor: Palette.secondarySoft,
    borderColor: '#93C5FD',
  },
  roadmapViolet: {
    backgroundColor: Palette.aiAccentSoft,
    borderColor: '#C4B5FD',
  },
});

