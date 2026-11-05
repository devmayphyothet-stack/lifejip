import { router, useFocusEffect } from 'expo-router';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BriefcaseMedical,
  CalendarClock,
  ClipboardCheck,
  PhoneCall,
  Recycle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
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
  HOTLINE_CONTACTS,
  SAFETY_ALERTS,
} from '@/data/seedData';
import { loadEmergencyProfile } from '@/services/storage';
import type { EmergencyProfile } from '@/types';

export default function HomeScreen() {
  const [profile, setProfile] = useState<EmergencyProfile>(
    DEFAULT_EMERGENCY_PROFILE
  );
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEmergencyProfile().then(setProfile);
    }, [])
  );

  const dialNumber = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  // Calculate Visa D-Day from profile.visaExpiryDate
  const getVisaDDay = () => {
    if (!profile.visaExpiryDate) return null;
    const expiry = new Date(profile.visaExpiryDate);
    if (Number.isNaN(expiry.getTime())) return null;
    const now = new Date();
    const diffDays = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays;
  };

  const visaDDay = getVisaDDay();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Brand Header */}
          <View style={styles.topHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <AppText variant="h2" color="#FFFFFF" script="korean">
                  집
                </AppText>
              </View>
              <View style={styles.flex1}>
                <AppText variant="h1" color={Palette.textPrimary}>
                  LifeJip · 라이프집
                </AppText>
                <AppText variant="burmese" color={Palette.textSecondary}>
                  ကိုရီးယားရောက် မြန်မာများအတွက် နေထိုင်မှု၊ ရုံးလုပ်ငန်း နှင့် ဆေးရုံလမ်းညွှန်
                </AppText>
              </View>
            </View>
          </View>

          {/* Top SOS / Emergency Quick Bar */}
          <View style={styles.sosContainer}>
            <View style={styles.sosHeaderRow}>
              <View style={styles.sosTitleRow}>
                <ShieldAlert size={20} color={Palette.danger} />
                <AppText variant="h3" color={Palette.danger} script="korean">
                  긴급 전화 · 응급 알레르기 카드 (အရေးပေါ် SOS)
                </AppText>
              </View>
              <Pressable
                onPress={() => setShowEmergencyModal(true)}
                style={({ pressed }) => [
                  styles.allergyTriggerBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <AlertTriangle size={16} color="#FFFFFF" />
                <AppText variant="badge" color="#FFFFFF">
                  응급·알레르기·주소 카드 보기
                </AppText>
              </Pressable>
            </View>

            <View style={styles.quickDialRow}>
              <Pressable
                onPress={() => dialNumber('119')}
                style={[styles.sosDialChip, styles.sosDialChipDanger]}
              >
                <PhoneCall size={16} color="#FFFFFF" />
                <View>
                  <AppText variant="bodyBold" color="#FFFFFF">
                    119 구급·화재
                  </AppText>
                  <AppText variant="caption" color="#FFE4E6">
                    လူနာတင်ကား/မီးသတ်
                  </AppText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => dialNumber('112')}
                style={[styles.sosDialChip, styles.sosDialChipDanger]}
              >
                <PhoneCall size={16} color="#FFFFFF" />
                <View>
                  <AppText variant="bodyBold" color="#FFFFFF">
                    112 경찰신고
                  </AppText>
                  <AppText variant="caption" color="#FFE4E6">
                    အရေးပေါ် ရဲစခန်း
                  </AppText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => dialNumber('1345')}
                style={styles.sosDialChip}
              >
                <PhoneCall size={16} color={Palette.secondary} />
                <View>
                  <AppText variant="bodyBold" color={Palette.textPrimary}>
                    1345 출입국
                  </AppText>
                  <AppText variant="caption" color={Palette.textSecondary}>
                    ဗီဇာ (မြန်မာစကားပြန်)
                  </AppText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => dialNumber('1350')}
                style={styles.sosDialChip}
              >
                <PhoneCall size={16} color={Palette.primary} />
                <View>
                  <AppText variant="bodyBold" color={Palette.textPrimary}>
                    1350 노동부
                  </AppText>
                  <AppText variant="caption" color={Palette.textSecondary}>
                    လစာ/အလုပ်သမားရေးရာ
                  </AppText>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Hero CTA: Medi Helper & Show to Doctor */}
          <Pressable
            onPress={() => router.push('/medi')}
            style={({ pressed }) => [
              styles.mediHeroCard,
              pressed && { backgroundColor: Palette.primaryDark },
            ]}
          >
            <View style={styles.mediHeroTop}>
              <View style={styles.mediHeroIconWrap}>
                <BriefcaseMedical size={26} color={Palette.primary} />
              </View>
              <View style={styles.flex1}>
                <AppText variant="badge" color="#CCFBF1">
                  의사/약사 소통 도우미 • MEDI HELPER
                </AppText>
                <AppText variant="h2" color="#FFFFFF" script="korean">
                  어디가 아프신가요? 증상 선택 & 진료과 찾기
                </AppText>
              </View>
              <ArrowRight size={22} color="#FFFFFF" />
            </View>
            <AppText variant="burmese" color="#F0FDFA">
              နေထိုင်မကောင်းဖြစ်နေပါသလား? မြန်မာလို ရောဂါလက္ခဏာရွေးပြီး ဘယ်ဆေးခန်း (내과, 이비인후과, 정형외과) သွားရမလဲ ကြည့်ရှုကာ ဆရာဝန်ပြရန် ကိုရီးယားအသံထွက်ကတ် ဖွင့်ပြပါ။
            </AppText>
          </Pressable>

          {/* Quick Category Grid (4 Core Modules) */}
          <View style={styles.sectionTitleRow}>
            <AppText variant="h3" color={Palette.textPrimary}>
              핵심 메뉴 · အဓိက လမ်းညွှန်များ
            </AppText>
          </View>

          <View style={styles.categoryGrid}>
            <Pressable
              onPress={() => router.push('/admin')}
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.catIconCircle,
                  { backgroundColor: Palette.secondarySoft },
                ]}
              >
                <ClipboardCheck size={22} color={Palette.secondary} />
              </View>
              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                체류 · 행정 체크리스트
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                ARC မှတ်ပုံတင်၊ ဗီဇာသက်တမ်းတိုး၊ ဘဏ်ဖွင့် နှင့် အိမ်ငှားစာချုပ် စစ်ဆေးရန်
              </AppText>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({ pathname: '/admin', params: { tab: 'recycling' } })
              }
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.catIconCircle,
                  { backgroundColor: Palette.primarySoft },
                ]}
              >
                <Recycle size={22} color={Palette.primary} />
              </View>
              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                분리수거 가이드
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                ဒဏ်ငွေမဆောင်ရစေရန် အမှိုက်ခွဲခြားပစ်နည်း (종량제, 음식물, 페트병)
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => router.push('/phrasebook')}
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.catIconCircle,
                  { backgroundColor: '#FEF3C7' },
                ]}
              >
                <BookOpen size={22} color={Palette.warning} />
              </View>
              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                상황별 필수 회화 (TTS)
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                ဆေးရုံ၊ ဆေးဆိုင်၊ 출입국၊ ဘဏ် နှင့် အိမ်ခြံမြေသုံး အသံထွက်စကားပြောများ
              </AppText>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/tools',
                  params: { section: 'calculators' },
                })
              }
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.catIconCircle,
                  { backgroundColor: Palette.secondarySoft },
                ]}
              >
                <Sparkles size={22} color={Palette.secondary} />
              </View>
              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                알바 급여 · 주휴수당 · 환율 계산기
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                အချိန်ပိုင်းအလုပ်လစာ၊ 주휴수당 နှင့် ဝမ် ⇄ မြန်မာကျပ်/သိန်း ငွေလဲနှုန်းတွက်ချက်ရန်
              </AppText>
            </Pressable>
          </View>

          {/* V2 Visa Expiry Countdown, Prescription Decoder & Night Pharmacy Map */}
          <View style={styles.sectionTitleRow}>
            <AppText variant="h3" color={Palette.textPrimary}>
              비자 알림 · 약봉투 해독 · 심야약국 지도 (V2 도구)
            </AppText>
          </View>

          <View style={styles.featureHooksRow}>
            {/* Visa Countdown Widget (Connected to EmergencyProfile) */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/tools',
                  params: { section: 'emergency_visa' },
                })
              }
              style={[styles.hookCard, styles.visaHookCard]}
            >
              <View style={styles.hookHeaderRow}>
                <View style={styles.visaBadge}>
                  <CalendarClock size={16} color={Palette.warning} />
                  <AppText variant="badge" color="#B45309">
                    비자 만료일 알림 ({profile.visaType || 'D-2 / E-9'})
                  </AppText>
                </View>
                {visaDDay !== null ? (
                  <View
                    style={[
                      styles.dDayPill,
                      visaDDay <= 60 && { backgroundColor: Palette.danger },
                    ]}
                  >
                    <AppText variant="badge" color="#FFFFFF">
                      {visaDDay >= 0 ? `D-${visaDDay}` : `D+${Math.abs(visaDDay)}`}
                    </AppText>
                  </View>
                ) : null}
              </View>
              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                체류기간 만료 예정일: {profile.visaExpiryDate}
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                ဗီဇာမကုန်မီ ၄ လအလိုမှစ၍ သက်တမ်းတိုးနိုင်ပါသည်။ ဗီဇာကုန်ဆုံးရက် နှင့် Cloud Backup ကို ဤနေရာတွင် စစ်ဆေးပါ။
              </AppText>
            </Pressable>

            {/* Prescription Bag Decoder & Night Pharmacy Map Card */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/medi',
                  params: { mode: 'prescription_otc' },
                })
              }
              style={[styles.hookCard, styles.aiHookCard]}
            >
              <View style={styles.hookHeaderRow}>
                <View style={styles.aiBadge}>
                  <Sparkles size={16} color="#FFFFFF" />
                  <AppText variant="badge" color="#FFFFFF">
                    처방전 해독 · 심야약국 지도
                  </AppText>
                </View>
                <AppText variant="caption" color={Palette.aiAccent}>
                  Medi & Map
                </AppText>
              </View>
              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                약봉투 복용법 해독기 & 주변 심야약국 찾기
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                ဆေးအိတ် (처방전/약봉투: 식후 30분, 1일 3회) အဓိပ္ပာယ်ဖတ်နည်း နှင့် ညဖွင့်ဆေးဆိုင် (심야약국) Naver/KakaoMap မြေပုံရှာဖွေရန်။
              </AppText>
            </Pressable>
          </View>

          {/* Scam Warning Quick Card & Embassy Contacts */}
          <View style={styles.scamCard}>
            <View style={styles.scamHeader}>
              <AlertTriangle size={18} color={Palette.danger} />
              <AppText variant="h3" color={Palette.danger} script="korean">
                {SAFETY_ALERTS[0].titleKo}
              </AppText>
            </View>
            <AppText variant="burmese" color={Palette.textPrimary}>
              {SAFETY_ALERTS[0].summaryMm}
            </AppText>
          </View>

          {/* Myanmar Embassy & Helpful Hotlines */}
          <View style={styles.embassySection}>
            <AppText variant="subtitle" color={Palette.textPrimary}>
              주한 미얀마 대사관 및 외국인 지원센터 (သံရုံးနှင့် အကူအညီပေးရေးဖုန်းများ)
            </AppText>
            {HOTLINE_CONTACTS.slice(4).map((contact) => (
              <Pressable
                key={contact.id}
                onPress={() => dialNumber(contact.number)}
                style={styles.hotlineRowCard}
              >
                <View style={styles.flex1}>
                  <AppText
                    variant="bodyBold"
                    color={Palette.textPrimary}
                    script="korean"
                  >
                    {contact.titleKo}
                  </AppText>
                  <AppText variant="burmese" color={Palette.textSecondary}>
                    {contact.titleMm} — {contact.subtitleMm}
                  </AppText>
                </View>
                <View style={styles.callBadge}>
                  <PhoneCall size={15} color={Palette.secondary} />
                  <AppText variant="badge" color={Palette.secondary}>
                    {contact.number}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <EmergencyAllergyModal
        visible={showEmergencyModal}
        profile={profile}
        onClose={() => setShowEmergencyModal(false)}
        onEditPress={() => router.push('/tools')}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  sosContainer: {
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#FDA4AF',
    gap: Spacing.md,
  },
  sosHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allergyTriggerBtn: {
    backgroundColor: Palette.danger,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickDialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sosDialChip: {
    flexGrow: 1,
    minWidth: 145,
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  sosDialChipDanger: {
    backgroundColor: Palette.danger,
    borderColor: '#BE123C',
  },
  mediHeroCard: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  mediHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  mediHeroIconWrap: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleRow: {
    marginBottom: -4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 4,
  },
  cardPressed: {
    backgroundColor: Palette.surfaceSubtle,
  },
  catIconCircle: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  featureHooksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  hookCard: {
    flexGrow: 1,
    flexBasis: 280,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: 6,
  },
  visaHookCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  aiHookCard: {
    backgroundColor: Palette.aiAccentSoft,
    borderColor: '#C4B5FD',
  },
  hookHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.warningSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  dDayPill: {
    backgroundColor: Palette.warning,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.aiAccent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  scamCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FECDD3',
    gap: 4,
  },
  scamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  embassySection: {
    gap: Spacing.sm,
  },
  hotlineRowCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.secondarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
});

