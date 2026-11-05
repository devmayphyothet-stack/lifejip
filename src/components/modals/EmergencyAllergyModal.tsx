import {
  AlertTriangle,
  HeartPulse,
  MapPin,
  Phone,
  ShieldAlert,
  Volume2,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Linking,
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
import type { EmergencyProfile } from '@/types';

interface EmergencyAllergyModalProps {
  visible: boolean;
  profile: EmergencyProfile;
  onClose: () => void;
  onEditPress?: () => void;
}

export function EmergencyAllergyModal({
  visible,
  profile,
  onClose,
  onEditPress,
}: EmergencyAllergyModalProps) {
  const [speaking, setSpeaking] = useState(false);

  const fullEmergencySpeechKo = [
    '응급 의료 및 알레르기 안내입니다.',
    `혈액형은 ${profile.bloodType} 입니다.`,
    `알레르기 정보: ${profile.allergiesKo}.`,
    `기저질환 정보: ${profile.chronicConditionsKo}.`,
    `현재 복용 중인 약: ${profile.medicationsKo}.`,
    profile.koreanAddressKo ? `거주지 주소는 ${profile.koreanAddressKo} 입니다.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleSpeakAll = () => {
    setSpeaking(true);
    speakKorean(fullEmergencySpeechKo, {
      rate: 0.88,
      onDone: () => setSpeaking(false),
    });
  };

  const handleClose = () => {
    stopSpeech();
    setSpeaking(false);
    onClose();
  };

  const dialNumber = (num: string) => {
    Linking.openURL(`tel:${num.replace(/[^0-9+]/g, '')}`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top SOS Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.sosBadge}>
              <ShieldAlert size={18} color="#FFFFFF" />
              <AppText variant="badge" color="#FFFFFF">
                SOS · 응급 의료 카드
              </AppText>
            </View>
            <AppText variant="caption" color={Palette.textSecondary}>
              ဆရာဝန် / 119 အရေးပေါ်ဝန်ထမ်းအား ဤမျက်နှာပြင်ကို ပြသပါ
            </AppText>
          </View>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityLabel="Close Emergency Card"
          >
            <X size={24} color={Palette.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Korean Intro Banner for Paramedics/Doctors */}
          <View style={styles.introBanner}>
            <AppText
              variant="h2"
              color={Palette.danger}
              script="korean"
              style={styles.introKo}
            >
              저는 미얀마 사람입니다. 한국어가 서툽니다. 아래 응급 의료 정보를 확인해 주세요.
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              &ldquo;ကျွန်တော်/ကျွန်မသည် မြန်မာနိုင်ငံသား ဖြစ်ပါသည်။ ကိုရီးယားစကား မကျွမ်းကျင်ပါ။ အောက်ပါ အရေးပေါ် ဆေးဘက်ဆိုင်ရာ အချက်အလက်များကို ကြည့်ရှုပေးပါ။&rdquo;
            </AppText>

            <Pressable
              onPress={handleSpeakAll}
              style={({ pressed }) => [
                styles.ttsPrimaryBtn,
                pressed && { backgroundColor: '#BE123C' },
              ]}
            >
              <Volume2 size={22} color="#FFFFFF" />
              <AppText variant="bodyBold" color="#FFFFFF">
                {speaking
                  ? '한국어 음성 안내 재생 중...'
                  : '전체 의료정보 음성으로 들려주기 (TTS)'}
              </AppText>
            </Pressable>
          </View>

          {/* Blood Type & Name Row */}
          <View style={styles.gridRow}>
            <View style={[styles.infoCard, styles.flex1]}>
              <View style={styles.cardHeaderRow}>
                <HeartPulse size={18} color={Palette.danger} />
                <AppText variant="caption" color={Palette.textSecondary}>
                  혈액형 (သွေးအမျိုးအစား)
                </AppText>
              </View>
              <AppText variant="h1" color={Palette.danger} script="korean">
                {profile.bloodType || '미입력'}
              </AppText>
            </View>

            <View style={[styles.infoCard, styles.flex1]}>
              <AppText variant="caption" color={Palette.textSecondary}>
                성명 / 비자 (အမည် / ဗီဇာ)
              </AppText>
              <AppText variant="h3" color={Palette.textPrimary}>
                {profile.fullName || '미얀마 거주자'}
              </AppText>
              <AppText variant="caption" color={Palette.secondary}>
                체류자격: {profile.visaType || 'D-2 / E-9'}
              </AppText>
            </View>
          </View>

          {/* Critical Allergy Box */}
          <View style={styles.allergyBox}>
            <View style={styles.cardHeaderRow}>
              <AlertTriangle size={20} color={Palette.danger} />
              <AppText variant="h3" color={Palette.danger} script="korean">
                약물 · 음식 알레르기 (ဆေးနှင့် အစားအသောက် ဓာတ်မတည့်မှု)
              </AppText>
            </View>
            <AppText
              variant="koreanShowCard"
              fontSize={24}
              color={Palette.textPrimary}
              script="korean"
            >
              {profile.allergiesKo}
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              {profile.allergiesMm}
            </AppText>
          </View>

          {/* Chronic Conditions & Current Medications */}
          <View style={styles.infoCard}>
            <AppText variant="subtitle" color={Palette.primaryDark}>
              기저질환 및 복용 중인 약 (ရောဂါအခံ နှင့် သောက်နေကျဆေး)
            </AppText>
            <AppText variant="h3" color={Palette.textPrimary} script="korean">
              • 기저질환: {profile.chronicConditionsKo}
            </AppText>
            <AppText variant="h3" color={Palette.textPrimary} script="korean">
              • 복용약: {profile.medicationsKo}
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              {profile.chronicConditionsMm}
            </AppText>
          </View>

          {/* My Korean Address Card (For Taxi / 119 Location reporting) */}
          <View style={styles.addressCard}>
            <View style={styles.cardHeaderRow}>
              <MapPin size={20} color={Palette.secondary} />
              <AppText variant="h3" color={Palette.secondary} script="korean">
                내 한국 주소 · 도로명 주소 (နေထိုင်ရာ လိပ်စာကတ်)
              </AppText>
            </View>
            <AppText
              variant="h2"
              color={Palette.textPrimary}
              script="korean"
              style={styles.addressText}
            >
              {profile.koreanAddressKo}
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              {profile.koreanAddressNoteMm}
            </AppText>
            <Pressable
              onPress={() =>
                speakKorean(`기사님, 이 주소로 가 주세요. ${profile.koreanAddressKo}`)
              }
              style={styles.secondaryActionBtn}
            >
              <Volume2 size={18} color={Palette.secondary} />
              <AppText variant="bodyBold" color={Palette.secondary}>
                택시/구급대원에게 주소 읽어주기 (လိပ်စာ အသံထွက်ပြောရန်)
              </AppText>
            </Pressable>
          </View>

          {/* Emergency Contacts */}
          <View style={styles.infoCard}>
            <AppText variant="subtitle" color={Palette.textSecondary}>
              비상연락처 (အရေးပေါ် ဆက်သွယ်ရန်ဖုန်း)
            </AppText>
            <View style={styles.contactRow}>
              <View style={styles.flex1}>
                <AppText variant="h3" color={Palette.textPrimary}>
                  {profile.emergencyContactName || '보호자 / 지인'} ({profile.emergencyContactRelation})
                </AppText>
                <AppText variant="bodyBold" color={Palette.secondary}>
                  {profile.emergencyContactPhone}
                </AppText>
              </View>
              <Pressable
                onPress={() => dialNumber(profile.emergencyContactPhone)}
                style={styles.callContactBtn}
              >
                <Phone size={18} color="#FFFFFF" />
                <AppText variant="badge" color="#FFFFFF">
                  전화 걸기
                </AppText>
              </Pressable>
            </View>
          </View>

          {/* Quick 119 / 1345 Dial Footer */}
          <View style={styles.emergencyDialRow}>
            <Pressable
              onPress={() => dialNumber('119')}
              style={[styles.dialBtn, { backgroundColor: Palette.danger }]}
            >
              <Phone size={20} color="#FFFFFF" />
              <AppText variant="bodyBold" color="#FFFFFF">
                119 응급실/구급차 호출
              </AppText>
            </Pressable>
            {onEditPress ? (
              <Pressable
                onPress={() => {
                  handleClose();
                  onEditPress();
                }}
                style={[styles.dialBtn, { backgroundColor: Palette.secondary }]}
              >
                <AppText variant="bodyBold" color="#FFFFFF">
                  내 정보 수정 (ပြင်ဆင်ရန်)
                </AppText>
              </Pressable>
            ) : null}
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
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Palette.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  closeButton: {
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
  introBanner: {
    backgroundColor: Palette.dangerSoft,
    borderWidth: 1.5,
    borderColor: Palette.danger,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  introKo: {
    letterSpacing: -0.3,
  },
  ttsPrimaryBtn: {
    marginTop: Spacing.xs,
    backgroundColor: Palette.danger,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allergyBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Palette.danger,
    gap: 6,
  },
  addressCard: {
    backgroundColor: Palette.secondarySoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#93C5FD',
    gap: 6,
  },
  addressText: {
    marginVertical: 2,
  },
  secondaryActionBtn: {
    marginTop: Spacing.xs,
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Palette.secondary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: 4,
  },
  callContactBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emergencyDialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  dialBtn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

