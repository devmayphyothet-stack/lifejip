import {
  AlertTriangle,
  Clock,
  Moon,
  Pill,
  Sun,
  Sunset,
  Volume2,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { speakKorean } from '@/services/speech';

const TIME_SLOTS = [
  { id: 'morning', ko: '아침', mm: 'မနက်', icon: 'sun' },
  { id: 'lunch', ko: '점심', mm: 'နေ့လယ်', icon: 'sun' },
  { id: 'dinner', ko: '저녁', mm: 'ညနေ', icon: 'sunset' },
  { id: 'bedtime', ko: '취침 전', mm: 'အိပ်ရာမဝင်မီ', icon: 'moon' },
] as const;

const MEAL_TIMINGS = [
  {
    id: 'after_30',
    ko: '식후 30분',
    mm: 'ထမင်းစားပြီး မိနစ် (၃၀) အကြာတွင်',
    noteMm: 'အစာအိမ်မထိခိုက်စေရန် အစာစားပြီး မိနစ် ၃၀ အကြာ သောက်ပါ။',
  },
  {
    id: 'after_imm',
    ko: '식후 즉시',
    mm: 'ထမင်းစားပြီး ချက်ချင်း',
    noteMm: 'ထမင်းစားပြီးပြီးချင်း သောက်ရမည့်ဆေး ဖြစ်ပါသည်။',
  },
  {
    id: 'before_30',
    ko: '식전 30분 (공복)',
    mm: 'ထမင်းမစားမီ မိနစ် (၃၀) အလို (အစာအိမ်အလွတ်တွင်)',
    noteMm: 'အစာမစားမီ နာရီဝက်ကြိုတင် သောက်ရပါမည်။',
  },
  {
    id: 'prn',
    ko: '필요시 (아플 때 / 열날 때)',
    mm: 'ဖျားချိန် / နာကျင်ချိန်မှသာ လိုအပ်သလို',
    noteMm: 'ရောဂါလက္ခဏာ ပေါ်လာသည့်အချိန်မှသာ သောက်ရန် (၄~၆ နာရီခြား)။',
  },
] as const;

const DOSE_AMOUNTS = [
  { id: '1pack', ko: '1회 1포', mm: 'တစ်ကြိမ်သောက်လျှင် ဆေးထုပ် (၁) ထုပ်' },
  { id: '1pill', ko: '1회 1정(1캡슐)', mm: 'တစ်ကြိမ်သောက်လျှင် ဆေး (၁) လုံး' },
  { id: '2pills', ko: '1회 2정', mm: 'တစ်ကြိမ်သောက်လျှင် ဆေး (၂) လုံး' },
] as const;

const CAUTIONS = [
  {
    id: 'drowsy',
    ko: '졸음 주의 (운전·기계조작 주의)',
    mm: 'အိပ်ငိုက်စေတတ်သဖြင့် ကား/စက်မောင်းနှင်ချိန် သတိထားပါ',
  },
  {
    id: 'no_alcohol',
    ko: '복용 중 금주 (술 마시지 마세요)',
    mm: 'ဆေးသောက်နေစဉ် အရက်/ဘီယာ လုံးဝ မသောက်ရပါ',
  },
  {
    id: 'antibiotic',
    ko: '항생제 포함 (증상 좋아져도 끝까지 복용)',
    mm: 'ပဋိဇီဝဆေး (Antibiotic) ပါဝင်သဖြင့် သက်သာသွားသော်လည်း ဆေးကုန်အောင် သောက်ပါ',
  },
] as const;

export function PrescriptionDecoderCard() {
  const [selectedTimes, setSelectedTimes] = useState<string[]>([
    'morning',
    'lunch',
    'dinner',
  ]);
  const [mealTimingId, setMealTimingId] = useState<string>('after_30');
  const [doseAmountId, setDoseAmountId] = useState<string>('1pack');
  const [selectedCautions, setSelectedCautions] = useState<string[]>([
    'no_alcohol',
  ]);

  const toggleTime = (id: string) => {
    setSelectedTimes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleCaution = (id: string) => {
    setSelectedCautions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const summary = useMemo(() => {
    const activeTimes = TIME_SLOTS.filter((t) => selectedTimes.includes(t.id));
    const timing =
      MEAL_TIMINGS.find((m) => m.id === mealTimingId) ?? MEAL_TIMINGS[0];
    const dose =
      DOSE_AMOUNTS.find((d) => d.id === doseAmountId) ?? DOSE_AMOUNTS[0];
    const cautions = CAUTIONS.filter((c) => selectedCautions.includes(c.id));

    const timesKo =
      activeTimes.length > 0
        ? activeTimes.map((t) => t.ko).join(', ')
        : '지정 시간';
    const timesMm =
      activeTimes.length > 0
        ? activeTimes.map((t) => t.mm).join('၊ ')
        : '(အချိန်ရွေးပါ)';

    const koreanSentence = `하루 ${activeTimes.length}번 (${timesKo}), ${timing.ko}에 ${dose.ko}씩 복용하세요.`;
    const burmeseSentence = `တစ်နေ့ (${activeTimes.length}) ကြိမ် [${timesMm}] — ${timing.mm} ${dose.mm} သောက်ပါ။`;

    return {
      activeTimes,
      timing,
      dose,
      cautions,
      koreanSentence,
      burmeseSentence,
    };
  }, [selectedTimes, mealTimingId, doseAmountId, selectedCautions]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Pill size={20} color={Palette.primary} />
        </View>
        <View style={styles.flex1}>
          <AppText variant="h2" color={Palette.textPrimary} script="korean">
            처방전 · 약봉투 시각적 복용법 해독기
          </AppText>
          <AppText variant="burmese" color={Palette.textSecondary}>
            သင့်ဆေးအိတ် (약봉투) ပေါ်တွင် ရေးထားသော စာသားများကို ရွေးနှိပ်ပြီး မြန်မာလို သောက်သုံးနည်း အတိအကျ ကြည့်ရှုပါ
          </AppText>
        </View>
      </View>

      {/* 1. Time of Day Slots */}
      <View style={styles.fieldGroup}>
        <AppText variant="bodyBold" color={Palette.textPrimary}>
          1. 약봉투에 체크된 시간 (ဆေးအိတ်ပေါ်တွင် အမှန်ခြစ်ထားသော အချိန်များ)
        </AppText>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((slot) => {
            const active = selectedTimes.includes(slot.id);
            return (
              <Pressable
                key={slot.id}
                onPress={() => toggleTime(slot.id)}
                style={[styles.timeCard, active && styles.timeCardActive]}
              >
                {slot.icon === 'sun' ? (
                  <Sun
                    size={18}
                    color={active ? '#FFFFFF' : Palette.primary}
                  />
                ) : slot.icon === 'sunset' ? (
                  <Sunset
                    size={18}
                    color={active ? '#FFFFFF' : Palette.warning}
                  />
                ) : (
                  <Moon
                    size={18}
                    color={active ? '#FFFFFF' : Palette.secondary}
                  />
                )}
                <AppText
                  variant="h3"
                  color={active ? '#FFFFFF' : Palette.textPrimary}
                  script="korean"
                >
                  {slot.ko}
                </AppText>
                <AppText
                  variant="caption"
                  color={active ? '#CCFBF1' : Palette.textSecondary}
                >
                  {slot.mm}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. Meal Timing */}
      <View style={styles.fieldGroup}>
        <AppText variant="bodyBold" color={Palette.textPrimary}>
          2. 식사 전/후 기준 (ထမင်းမစားမီ / စားပြီး သောက်ရမည့်အချိန်)
        </AppText>
        <View style={styles.chipsWrap}>
          {MEAL_TIMINGS.map((m) => {
            const active = mealTimingId === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMealTimingId(m.id)}
                style={[styles.optionChip, active && styles.optionChipActive]}
              >
                <AppText
                  variant="bodyBold"
                  color={active ? '#FFFFFF' : Palette.textPrimary}
                  script="korean"
                >
                  {m.ko}
                </AppText>
                <AppText
                  variant="caption"
                  color={active ? '#CCFBF1' : Palette.textSecondary}
                >
                  {m.mm}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 3. Dose Amount */}
      <View style={styles.fieldGroup}>
        <AppText variant="bodyBold" color={Palette.textPrimary}>
          3. 1회 복용량 (တစ်ကြိမ်သောက်ရမည့် ဆေးပမာဏ)
        </AppText>
        <View style={styles.chipsWrap}>
          {DOSE_AMOUNTS.map((d) => {
            const active = doseAmountId === d.id;
            return (
              <Pressable
                key={d.id}
                onPress={() => setDoseAmountId(d.id)}
                style={[styles.optionChip, active && styles.optionChipBlue]}
              >
                <AppText
                  variant="bodyBold"
                  color={active ? '#FFFFFF' : Palette.textPrimary}
                  script="korean"
                >
                  {d.ko}
                </AppText>
                <AppText
                  variant="caption"
                  color={active ? '#DBEAFE' : Palette.textSecondary}
                >
                  {d.mm}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 4. Cautions */}
      <View style={styles.fieldGroup}>
        <AppText variant="bodyBold" color={Palette.textPrimary}>
          4. 약봉투 주의사항 문구 (အထူးသတိပေးစာသားများ ပါဝင်ပါက ရွေးပါ)
        </AppText>
        <View style={styles.chipsWrap}>
          {CAUTIONS.map((c) => {
            const active = selectedCautions.includes(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => toggleCaution(c.id)}
                style={[styles.optionChip, active && styles.optionChipDanger]}
              >
                <AppText
                  variant="bodyBold"
                  color={active ? '#FFFFFF' : Palette.textPrimary}
                  script="korean"
                >
                  {c.ko}
                </AppText>
                <AppText
                  variant="caption"
                  color={active ? '#FFE4E6' : Palette.textSecondary}
                >
                  {c.mm}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Visual Decoded Result Box */}
      <View style={styles.decodedBox}>
        <View style={styles.decodedHeader}>
          <View style={styles.decodedTitleRow}>
            <Clock size={18} color={Palette.primaryDark} />
            <AppText variant="badge" color={Palette.primaryDark}>
              해독 결과 · သင့်ဆေးသောက်ရမည့် အချိန်ဇယား အနှစ်ချုပ်
            </AppText>
          </View>
          <Pressable
            onPress={() => speakKorean(summary.koreanSentence)}
            style={styles.speakBtn}
          >
            <Volume2 size={16} color="#FFFFFF" />
            <AppText variant="badge" color="#FFFFFF">
              한국어 듣기
            </AppText>
          </Pressable>
        </View>

        <AppText variant="h2" color={Palette.textPrimary} script="korean">
          {summary.koreanSentence}
        </AppText>

        <AppText variant="h3" color={Palette.primaryDark}>
          {summary.burmeseSentence}
        </AppText>

        <AppText variant="burmese" color={Palette.textSecondary}>
          💡 {summary.timing.noteMm}
        </AppText>

        {summary.cautions.length > 0 ? (
          <View style={styles.cautionAlertBox}>
            {summary.cautions.map((c) => (
              <View key={c.id} style={styles.cautionRow}>
                <AlertTriangle size={15} color={Palette.danger} />
                <AppText
                  variant="burmese"
                  color={Palette.danger}
                  style={styles.flex1}
                >
                  {c.mm}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
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
  fieldGroup: {
    gap: 8,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeCard: {
    flexGrow: 1,
    flexBasis: 110,
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Palette.border,
    alignItems: 'center',
    gap: 2,
  },
  timeCardActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primaryDark,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    flexGrow: 1,
    minWidth: 180,
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  optionChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primaryDark,
  },
  optionChipBlue: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondaryDark,
  },
  optionChipDanger: {
    backgroundColor: Palette.danger,
    borderColor: '#BE123C',
  },
  decodedBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Palette.primary,
    gap: 6,
  },
  decodedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  decodedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cautionAlertBox: {
    marginTop: 4,
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  cautionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

