import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeftRight, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing } from '@/constants/theme';

const RATE_STORAGE_KEY = '@lifejip/krw_mmk_rate_per_1000_v2';

// Rate expressed as MMK per 1,000 KRW (standard way Myanmar remitters quote KRW rate, e.g., 1,000 KRW = 3,300 MMK)
const RATE_PRESETS = ['3100', '3250', '3400', '3550'];

const QUICK_KRW_AMOUNTS = [
  { label: '1만원', krw: 10000 },
  { label: '5만원', krw: 50000 },
  { label: '10만원', krw: 100000 },
  { label: '50만원', krw: 500000 },
  { label: '100만원', krw: 1000000 },
  { label: '200만원', krw: 2000000 },
];

export function CurrencyConverterCard() {
  const [direction, setDirection] = useState<'KRW_TO_MMK' | 'MMK_TO_KRW'>(
    'KRW_TO_MMK'
  );
  const [ratePer1000Krw, setRatePer1000Krw] = useState('3300');
  const [inputAmountStr, setInputAmountStr] = useState('100000');

  useEffect(() => {
    AsyncStorage.getItem(RATE_STORAGE_KEY)
      .then((saved) => {
        if (saved) setRatePer1000Krw(saved);
      })
      .catch(() => {});
  }, []);

  const updateRate = (val: string) => {
    setRatePer1000Krw(val);
    AsyncStorage.setItem(RATE_STORAGE_KEY, val).catch(() => {});
  };

  const result = useMemo(() => {
    const rate = Math.max(
      1,
      Number(ratePer1000Krw.replace(/[^0-9.]/g, '')) || 3300
    );
    const amount = Math.max(
      0,
      Number(inputAmountStr.replace(/[^0-9.]/g, '')) || 0
    );

    if (direction === 'KRW_TO_MMK') {
      const mmk = Math.round((amount / 1000) * rate);
      const lakhs = mmk / 100000;
      return {
        krw: amount,
        mmk,
        lakhsText:
          lakhs >= 1
            ? `${lakhs.toFixed(2)} သိန်း (${mmk.toLocaleString('en-US')} ကျပ်)`
            : `${mmk.toLocaleString('en-US')} ကျပ်`,
      };
    } else {
      const krw = Math.round((amount / rate) * 1000);
      const lakhs = amount / 100000;
      return {
        krw,
        mmk: amount,
        lakhsText:
          lakhs >= 1
            ? `${lakhs.toFixed(2)} သိန်း (${amount.toLocaleString('en-US')} ကျပ်)`
            : `${amount.toLocaleString('en-US')} ကျပ်`,
      };
    }
  }, [direction, ratePer1000Krw, inputAmountStr]);

  const toggleDirection = () => {
    if (direction === 'KRW_TO_MMK') {
      setDirection('MMK_TO_KRW');
      setInputAmountStr(String(result.mmk));
    } else {
      setDirection('KRW_TO_MMK');
      setInputAmountStr(String(result.krw));
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <ArrowLeftRight size={20} color={Palette.primary} />
        </View>
        <View style={styles.flex1}>
          <AppText variant="h2" color={Palette.textPrimary} script="korean">
            원화(KRW) ⇄ 미얀마 짯(MMK) 환율 계산기
          </AppText>
          <AppText variant="burmese" color={Palette.textSecondary}>
            ကိုရီးယားဝမ် (KRW) နှင့် မြန်မာကျပ်/သိန်း (MMK) အပြန်အလှန် ငွေလဲနှုန်းတွက်စက်
          </AppText>
        </View>
      </View>

      {/* Exchange Rate Setting (1,000 KRW = X MMK) */}
      <View style={styles.rateBox}>
        <View style={styles.rateHeaderRow}>
          <AppText variant="bodyBold" color={Palette.primaryDark}>
            기준 환율: 1,000원(KRW) 당 미얀마 짯(MMK)
          </AppText>
          <View style={styles.offlineRateTag}>
            <RefreshCw size={12} color={Palette.primaryDark} />
            <AppText variant="caption" color={Palette.primaryDark}>
              내 환율 자동저장
            </AppText>
          </View>
        </View>
        <AppText variant="burmese" color={Palette.textSecondary}>
          ၁,၀၀၀ ဝမ် လျှင် ပေါက်ဈေး မြန်မာကျပ် (Hana EZ / GME / Hanpass ပေါက်ဈေးအတိုင်း ပြင်ဆင်နိုင်သည်) —
        </AppText>

        <View style={styles.presetRow}>
          {RATE_PRESETS.map((r) => {
            const active = ratePer1000Krw === r;
            return (
              <Pressable
                key={r}
                onPress={() => updateRate(r)}
                style={[styles.rateChip, active && styles.rateChipActive]}
              >
                <AppText
                  variant="caption"
                  color={active ? '#FFFFFF' : Palette.textPrimary}
                >
                  1,000원 = {Number(r).toLocaleString()} Ks
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={ratePer1000Krw}
          onChangeText={updateRate}
          keyboardType="numeric"
          placeholder="3300"
          placeholderTextColor={Palette.textMuted}
          style={styles.rateInput}
        />
      </View>

      {/* Direction Switcher & Input */}
      <View style={styles.converterSection}>
        <View style={styles.directionHeader}>
          <AppText variant="bodyBold" color={Palette.textPrimary}>
            {direction === 'KRW_TO_MMK'
              ? '입력: 한국 원화 (KRW ဝမ်ထည့်ရန်)'
              : '입력: 미얀마 짯 (MMK ကျပ်ထည့်ရန်)'}
          </AppText>
          <Pressable onPress={toggleDirection} style={styles.swapBtn}>
            <ArrowLeftRight size={15} color={Palette.secondary} />
            <AppText variant="badge" color={Palette.secondary}>
              KRW ⇄ MMK 전환
            </AppText>
          </Pressable>
        </View>

        {direction === 'KRW_TO_MMK' ? (
          <View style={styles.presetRow}>
            {QUICK_KRW_AMOUNTS.map((item) => (
              <Pressable
                key={item.krw}
                onPress={() => setInputAmountStr(String(item.krw))}
                style={[
                  styles.amountChip,
                  Number(inputAmountStr) === item.krw &&
                    styles.amountChipActive,
                ]}
              >
                <AppText
                  variant="caption"
                  color={
                    Number(inputAmountStr) === item.krw
                      ? '#FFFFFF'
                      : Palette.textPrimary
                  }
                >
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <TextInput
          value={inputAmountStr}
          onChangeText={setInputAmountStr}
          keyboardType="numeric"
          placeholder="100000"
          placeholderTextColor={Palette.textMuted}
          style={styles.amountInput}
        />
      </View>

      {/* Output Card */}
      <View style={styles.outputBox}>
        <AppText variant="caption" color="#CCFBF1">
          환산 결과 (တွက်ချက်မှု ရလဒ်)
        </AppText>
        <AppText variant="h1" color="#FFFFFF" script="korean">
          {direction === 'KRW_TO_MMK'
            ? `${result.mmk.toLocaleString('en-US')} MMK`
            : `${result.krw.toLocaleString('en-US')} KRW (원)`}
        </AppText>
        <AppText variant="bodyBold" color="#F0FDFA">
          မြန်မာငွေ ပမာဏ: {result.lakhsText}
        </AppText>
        <AppText variant="caption" color="#CCFBF1">
          ကိုရီးယားဝမ်: {result.krw.toLocaleString('en-US')} 원
        </AppText>
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
  rateBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
    gap: 6,
  },
  rateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  offlineRateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rateChip: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  rateChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  rateInput: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Palette.border,
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  converterSection: {
    gap: 8,
  },
  directionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.secondarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  amountChip: {
    backgroundColor: Palette.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  amountChipActive: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  amountInput: {
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Palette.primary,
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  outputBox: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: 2,
  },
});

