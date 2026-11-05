import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Coins,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing } from '@/constants/theme';

type TaxMode = 'none' | 'freelance_3_3' | 'insurance_9_4';

const HOURLY_PRESETS = [
  { label: '최저시급 (10,030원)', value: '10030' },
  { label: '11,000원', value: '11000' },
  { label: '12,000원', value: '12000' },
  { label: '15,000원', value: '15000' },
];

const HOURS_PER_DAY_PRESETS = ['4', '5', '6', '8', '10'];
const DAYS_PER_WEEK_PRESETS = ['2', '3', '4', '5', '6'];

export function WageCalculatorCard() {
  const [hourlyWageStr, setHourlyWageStr] = useState('10030');
  const [hoursPerDayStr, setHoursPerDayStr] = useState('6');
  const [daysPerWeekStr, setDaysPerWeekStr] = useState('5');
  const [taxMode, setTaxMode] = useState<TaxMode>('freelance_3_3');
  const [includeJuhyu, setIncludeJuhyu] = useState(true);

  const calculation = useMemo(() => {
    const hourly = Math.max(0, Number(hourlyWageStr.replace(/[^0-9]/g, '')) || 0);
    const hoursPerDay = Math.max(
      0,
      Math.min(24, Number(hoursPerDayStr.replace(/[^0-9.]/g, '')) || 0)
    );
    const daysPerWeek = Math.max(
      0,
      Math.min(7, Number(daysPerWeekStr.replace(/[^0-9.]/g, '')) || 0)
    );

    const weeklyHours = hoursPerDay * daysPerWeek;
    const isJuhyuEligible = weeklyHours >= 15;

    // Korean Labor Standards Act: Weekly Holiday Allowance (주휴수당)
    // If weeklyHours >= 15: (min(weeklyHours, 40) / 40) * 8 * hourlyWage
    const juhyuHours = isJuhyuEligible
      ? (Math.min(weeklyHours, 40) / 40) * 8
      : 0;
    const weeklyJuhyuPay = includeJuhyu ? Math.round(juhyuHours * hourly) : 0;

    const baseWeeklyPay = Math.round(weeklyHours * hourly);
    const totalWeeklyPay = baseWeeklyPay + weeklyJuhyuPay;

    // Average weeks per month = 365 / 12 / 7 ≈ 4.345
    const weeksPerMonth = 4.345;
    const monthlyGross = Math.round(totalWeeklyPay * weeksPerMonth);
    const monthlyJuhyuTotal = Math.round(weeklyJuhyuPay * weeksPerMonth);

    const taxRate =
      taxMode === 'freelance_3_3'
        ? 0.033
        : taxMode === 'insurance_9_4'
          ? 0.094
          : 0;
    const monthlyTax = Math.round(monthlyGross * taxRate);
    const monthlyNet = monthlyGross - monthlyTax;

    // 1-Year Severance Pay (퇴직금) if weeklyHours >= 15
    const estimatedSeverance1Year = isJuhyuEligible ? monthlyGross : 0;

    return {
      hourly,
      weeklyHours,
      isJuhyuEligible,
      juhyuHours: Number(juhyuHours.toFixed(1)),
      baseWeeklyPay,
      weeklyJuhyuPay,
      totalWeeklyPay,
      monthlyGross,
      monthlyJuhyuTotal,
      monthlyTax,
      monthlyNet,
      estimatedSeverance1Year,
    };
  }, [hourlyWageStr, hoursPerDayStr, daysPerWeekStr, taxMode, includeJuhyu]);

  const formatKRW = (amount: number) => `${amount.toLocaleString('en-US')}원`;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Calculator size={20} color={Palette.secondary} />
        </View>
        <View style={styles.flex1}>
          <AppText variant="h2" color={Palette.textPrimary} script="korean">
            아르바이트 급여 · 주휴수당 · 퇴직금 계산기
          </AppText>
          <AppText variant="burmese" color={Palette.textSecondary}>
            အချိန်ပိုင်းအလုပ်လစာ၊ 주휴수당 (တစ်ပတ် ၁၅ နာရီပြည့် ဆုကြေး) နှင့် 퇴직금 (၁ နှစ်ပြည့် လုပ်သက်ဆုကြေး) တွက်ချက်စက်
          </AppText>
        </View>
      </View>

      {/* 1. Hourly Wage Input & Presets */}
      <View style={styles.fieldGroup}>
        <AppText variant="bodyBold" color={Palette.textPrimary}>
          1. 시급 (တစ်နာရီ လုပ်အားခ — ဝမ်)
        </AppText>
        <View style={styles.presetRow}>
          {HOURLY_PRESETS.map((preset) => {
            const active = hourlyWageStr === preset.value;
            return (
              <Pressable
                key={preset.value}
                onPress={() => setHourlyWageStr(preset.value)}
                style={[styles.presetChip, active && styles.presetChipActive]}
              >
                <AppText
                  variant="caption"
                  color={active ? '#FFFFFF' : Palette.textPrimary}
                >
                  {preset.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={hourlyWageStr}
          onChangeText={setHourlyWageStr}
          keyboardType="numeric"
          placeholder="10030"
          placeholderTextColor={Palette.textMuted}
          style={styles.input}
        />
      </View>

      {/* 2. Hours per Day & Days per Week */}
      <View style={styles.twoColRow}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <AppText variant="bodyBold" color={Palette.textPrimary}>
            2. 하루 근무시간 (တစ်နေ့ အလုပ်ချိန် နာရီ)
          </AppText>
          <View style={styles.presetRow}>
            {HOURS_PER_DAY_PRESETS.map((h) => {
              const active = hoursPerDayStr === h;
              return (
                <Pressable
                  key={h}
                  onPress={() => setHoursPerDayStr(h)}
                  style={[styles.smallChip, active && styles.presetChipActive]}
                >
                  <AppText
                    variant="caption"
                    color={active ? '#FFFFFF' : Palette.textPrimary}
                  >
                    {h}시간
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={hoursPerDayStr}
            onChangeText={setHoursPerDayStr}
            keyboardType="numeric"
            placeholder="6"
            placeholderTextColor={Palette.textMuted}
            style={styles.input}
          />
        </View>

        <View style={[styles.fieldGroup, styles.flex1]}>
          <AppText variant="bodyBold" color={Palette.textPrimary}>
            3. 주간 근무일수 (တစ်ပတ် အလုပ်ဆင်းရက်)
          </AppText>
          <View style={styles.presetRow}>
            {DAYS_PER_WEEK_PRESETS.map((d) => {
              const active = daysPerWeekStr === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDaysPerWeekStr(d)}
                  style={[styles.smallChip, active && styles.presetChipActive]}
                >
                  <AppText
                    variant="caption"
                    color={active ? '#FFFFFF' : Palette.textPrimary}
                  >
                    주 {d}일
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={daysPerWeekStr}
            onChangeText={setDaysPerWeekStr}
            keyboardType="numeric"
            placeholder="5"
            placeholderTextColor={Palette.textMuted}
            style={styles.input}
          />
        </View>
      </View>

      {/* Weekly Holiday Allowance (주휴수당) Eligibility Banner */}
      <View
        style={[
          styles.juhyuBanner,
          calculation.isJuhyuEligible
            ? styles.juhyuEligible
            : styles.juhyuNotEligible,
        ]}
      >
        <View style={styles.juhyuTopRow}>
          <View style={styles.juhyuTitleWrap}>
            {calculation.isJuhyuEligible ? (
              <CheckCircle2 size={20} color={Palette.primaryDark} />
            ) : (
              <AlertCircle size={20} color={Palette.warning} />
            )}
            <AppText
              variant="h3"
              color={
                calculation.isJuhyuEligible
                  ? Palette.primaryDark
                  : '#B45309'
              }
              script="korean"
            >
              주간 총 {calculation.weeklyHours}시간 근무 —{' '}
              {calculation.isJuhyuEligible
                ? `주휴수당 대상 (주 +${calculation.juhyuHours}시간분 지급)`
                : '주 15시간 미만 (주휴수당 미발생)'}
            </AppText>
          </View>

          {calculation.isJuhyuEligible ? (
            <Pressable
              onPress={() => setIncludeJuhyu((prev) => !prev)}
              style={[
                styles.togglePill,
                includeJuhyu && styles.togglePillActive,
              ]}
            >
              <AppText
                variant="badge"
                color={includeJuhyu ? '#FFFFFF' : Palette.textPrimary}
              >
                {includeJuhyu ? '주휴수당 포함 ON' : '주휴수당 제외'}
              </AppText>
            </Pressable>
          ) : null}
        </View>

        <AppText variant="burmese" color={Palette.textSecondary}>
          {calculation.isJuhyuEligible
            ? `တစ်ပတ်လျှင် ၁၅ နာရီနှင့်အထက် ပျက်ရက်မရှိ အလုပ်ဆင်းပါက ဥပဒေအရ 주휴수당 (တစ်ပတ်လျှင် +${formatKRW(
                calculation.weeklyJuhyuPay
              )}) ရပိုင်ခွင့်ရှိပါသည်။`
            : 'တစ်ပတ် အလုပ်ချိန် ၁၅ နာရီအောက် နည်းနေသဖြင့် 주휴수당 နှင့် 퇴직금 အကျုံးမဝင်ပါ။'}
        </AppText>
      </View>

      {/* Tax / Insurance Deduction Selector */}
      <View style={styles.fieldGroup}>
        <AppText variant="bodyBold" color={Palette.textPrimary}>
          4. 세금 · 보험 공제 선택 (အခွန် နှင့် အာမခံ ဖြတ်တောက်မှု)
        </AppText>
        <View style={styles.presetRow}>
          <Pressable
            onPress={() => setTaxMode('none')}
            style={[
              styles.taxOption,
              taxMode === 'none' && styles.presetChipActive,
            ]}
          >
            <AppText
              variant="badge"
              color={taxMode === 'none' ? '#FFFFFF' : Palette.textPrimary}
            >
              미적용 (0%)
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setTaxMode('freelance_3_3')}
            style={[
              styles.taxOption,
              taxMode === 'freelance_3_3' && styles.presetChipActive,
            ]}
          >
            <AppText
              variant="badge"
              color={
                taxMode === 'freelance_3_3' ? '#FFFFFF' : Palette.textPrimary
              }
            >
              3.3% (알바 소득세)
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setTaxMode('insurance_9_4')}
            style={[
              styles.taxOption,
              taxMode === 'insurance_9_4' && styles.presetChipActive,
            ]}
          >
            <AppText
              variant="badge"
              color={
                taxMode === 'insurance_9_4' ? '#FFFFFF' : Palette.textPrimary
              }
            >
              4대보험 (~9.4%)
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Results Summary Box */}
      <View style={styles.resultBox}>
        <View style={styles.resultMainRow}>
          <View>
            <AppText variant="caption" color="#DBEAFE">
              예상 월 실수령액 (세후 • အခွန်နှုတ်ပြီး လစဉ်ရမည့်ငွေ)
            </AppText>
            <AppText variant="h1" color="#FFFFFF" script="korean">
              {formatKRW(calculation.monthlyNet)}
            </AppText>
          </View>
          <Coins size={32} color="#93C5FD" />
        </View>

        <View style={styles.resultDivider} />

        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownItem}>
            <AppText variant="caption" color="#DBEAFE">
              주급 합계 (တစ်ပတ်စာ စုစုပေါင်း)
            </AppText>
            <AppText variant="bodyBold" color="#FFFFFF">
              {formatKRW(calculation.totalWeeklyPay)}
            </AppText>
          </View>

          <View style={styles.breakdownItem}>
            <AppText variant="caption" color="#DBEAFE">
              월 주휴수당 포함액 (လစဉ် 주휴수당)
            </AppText>
            <AppText variant="bodyBold" color="#CCFBF1">
              +{formatKRW(calculation.monthlyJuhyuTotal)}
            </AppText>
          </View>

          <View style={styles.breakdownItem}>
            <AppText variant="caption" color="#DBEAFE">
              월 세전 급여 (အခွန်မနှုတ်မီ)
            </AppText>
            <AppText variant="bodyBold" color="#FFFFFF">
              {formatKRW(calculation.monthlyGross)}
            </AppText>
          </View>

          <View style={styles.breakdownItem}>
            <AppText variant="caption" color="#DBEAFE">
              1년 근무 시 예상 퇴직금 (၁ နှစ်ပြည့် 퇴직금)
            </AppText>
            <AppText variant="bodyBold" color="#FDE68A">
              {calculation.isJuhyuEligible
                ? formatKRW(calculation.estimatedSeverance1Year)
                : '해당 없음'}
            </AppText>
          </View>
        </View>
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
    backgroundColor: Palette.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
    minWidth: 200,
  },
  fieldGroup: {
    gap: 6,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    backgroundColor: Palette.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  smallChip: {
    backgroundColor: Palette.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  presetChipActive: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  input: {
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    fontSize: 16,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  twoColRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  juhyuBanner: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: 4,
  },
  juhyuEligible: {
    backgroundColor: '#F0FDFA',
    borderColor: Palette.primary,
  },
  juhyuNotEligible: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  juhyuTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  juhyuTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  togglePill: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  togglePillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  taxOption: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Palette.background,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
  },
  resultBox: {
    backgroundColor: Palette.secondary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  resultMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  breakdownItem: {
    flexGrow: 1,
    flexBasis: 140,
  },
});

