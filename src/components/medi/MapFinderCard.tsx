import { ExternalLink, MapPin, Moon, Stethoscope } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing } from '@/constants/theme';

type MapProvider = 'naver' | 'kakao';

const QUICK_MEDICAL_PLACES = [
  {
    id: 'night-pharm',
    queryKo: '심야약국',
    titleKo: '공공심야약국 · 24시 약국',
    titleMm: 'ညဖွင့်ဆေးဆိုင် (심야약국 / ၂၄ နာရီ ဆေးဆိုင်)',
    badge: '야간 필수',
    isUrgent: true,
  },
  {
    id: 'sunday-pharm',
    queryKo: '일요일 문여는 약국',
    titleKo: '휴일지킴이 · 일요일 문여는 약국',
    titleMm: 'တနင်္ဂနွေ နှင့် ရုံးပိတ်ရက်ဖွင့်သော ဆေးဆိုင်',
    badge: '주말/공휴일',
    isUrgent: false,
  },
  {
    id: 'er',
    queryKo: '응급실',
    titleKo: '24시간 종합병원 응급실',
    titleMm: '၂၄ နာရီ အရေးပေါ်ဆေးရုံဌာန (응급실)',
    badge: '119 응급',
    isUrgent: true,
  },
  {
    id: 'naegwa',
    queryKo: '내과',
    titleKo: '내과 (감기 · 복통 · 몸살)',
    titleMm: 'အထွေထွေ အတွင်းရောဂါကု ဆေးခန်း (내과)',
    badge: '내과',
    isUrgent: false,
  },
  {
    id: 'ent',
    queryKo: '이비인후과',
    titleKo: '이비인후과 (목 · 코 · 귀)',
    titleMm: 'နား၊ နှာခေါင်း၊ လည်ချောင်း ဆေးခန်း (이비인후과)',
    badge: 'ENT',
    isUrgent: false,
  },
  {
    id: 'ortho',
    queryKo: '정형외과',
    titleKo: '정형외과 (허리 · 관절 · 골절)',
    titleMm: 'အရိုး၊ အကြော၊ အဆစ် ဆေးခန်း (정형외과)',
    badge: 'X-ray/물리치료',
    isUrgent: false,
  },
  {
    id: 'dental',
    queryKo: '치과',
    titleKo: '치과 (치통 · 사랑니 · 스케일링)',
    titleMm: 'သွားနှင့်ခံတွင်း ဆေးခန်း (치과)',
    badge: '치과',
    isUrgent: false,
  },
  {
    id: 'obgyn',
    queryKo: '산부인과',
    titleKo: '산부인과 (여성 진료 · 임신)',
    titleMm: 'သားဖွားမီးယပ် နှင့် အမျိုးသမီး ဆေးခန်း (산부인과)',
    badge: '여성건강',
    isUrgent: false,
  },
];

export function MapFinderCard() {
  const [provider, setProvider] = useState<MapProvider>('naver');

  const openMapSearch = (queryKo: string) => {
    const encoded = encodeURIComponent(queryKo);
    const url =
      provider === 'naver'
        ? `https://map.naver.com/p/search/${encoded}`
        : `https://map.kakao.com/link/search/${encoded}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <MapPin size={20} color={Palette.primary} />
        </View>
        <View style={styles.flex1}>
          <AppText variant="h2" color={Palette.textPrimary} script="korean">
            내 주변 병원 · 심야약국 원탭 지도 검색
          </AppText>
          <AppText variant="burmese" color={Palette.textSecondary}>
            သင့်အနီးရှိ ဆေးခန်းများ၊ ညဖွင့်ဆေးဆိုင် (심야약국) နှင့် အရေးပေါ်ဌာန (응급실) များကို Naver Map သို့မဟုတ် KakaoMap ဖြင့် တစ်ချက်နှိပ် ရှာဖွေပါ
          </AppText>
        </View>
      </View>

      {/* Map App Selector (Naver Map vs KakaoMap) */}
      <View style={styles.providerToggleRow}>
        <Pressable
          onPress={() => setProvider('naver')}
          style={[
            styles.providerBtn,
            provider === 'naver' && styles.providerNaverActive,
          ]}
        >
          <AppText
            variant="bodyBold"
            color={provider === 'naver' ? '#FFFFFF' : Palette.textPrimary}
          >
            N 네이버 지도 (Naver Map)
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setProvider('kakao')}
          style={[
            styles.providerBtn,
            provider === 'kakao' && styles.providerKakaoActive,
          ]}
        >
          <AppText
            variant="bodyBold"
            color={provider === 'kakao' ? '#0F172A' : Palette.textPrimary}
          >
            K 카카오맵 (KakaoMap)
          </AppText>
        </Pressable>
      </View>

      {/* Quick One-Tap Place Grid */}
      <View style={styles.placesGrid}>
        {QUICK_MEDICAL_PLACES.map((place) => (
          <Pressable
            key={place.id}
            onPress={() => openMapSearch(place.queryKo)}
            style={({ pressed }) => [
              styles.placeCard,
              place.isUrgent && styles.placeCardUrgent,
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={styles.placeTopRow}>
              <View
                style={[
                  styles.placeBadge,
                  place.isUrgent && styles.placeBadgeUrgent,
                ]}
              >
                {place.isUrgent ? (
                  <Moon size={12} color="#FFFFFF" />
                ) : (
                  <Stethoscope size={12} color={Palette.primaryDark} />
                )}
                <AppText
                  variant="caption"
                  color={place.isUrgent ? '#FFFFFF' : Palette.primaryDark}
                >
                  {place.badge}
                </AppText>
              </View>
              <ExternalLink
                size={15}
                color={place.isUrgent ? Palette.danger : Palette.primary}
              />
            </View>

            <AppText
              variant="h3"
              color={Palette.textPrimary}
              script="korean"
            >
              {place.titleKo}
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              {place.titleMm}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  providerToggleRow: {
    flexDirection: 'row',
    backgroundColor: Palette.background,
    padding: 5,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 6,
  },
  providerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  providerNaverActive: {
    backgroundColor: '#16A34A',
  },
  providerKakaoActive: {
    backgroundColor: '#FACC15',
  },
  placesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  placeCard: {
    flexGrow: 1,
    flexBasis: 210,
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 4,
  },
  placeCardUrgent: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },
  placeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  placeBadgeUrgent: {
    backgroundColor: Palette.danger,
  },
});

