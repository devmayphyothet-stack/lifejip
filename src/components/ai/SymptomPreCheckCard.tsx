import {
  Bot,
  MessageSquareHeart,
  Stethoscope,
  Volume2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing } from '@/constants/theme';
import {
  AI_PRECHECK_TOPICS,
  type SymptomPreCheckReply,
} from '@/services/aiService';
import { speakKorean } from '@/services/speech';

export function SymptomPreCheckCard() {
  const [selectedReply, setSelectedReply] = useState<SymptomPreCheckReply>(
    AI_PRECHECK_TOPICS[0]
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Bot size={22} color="#FFFFFF" />
        </View>
        <View style={styles.flex1}>
          <AppText variant="h2" color={Palette.textPrimary} script="korean">
            AI 증상 사전 상담 & 진료비 · 산재 Q&A
          </AppText>
          <AppText variant="burmese" color={Palette.textSecondary}>
            ကိုရီးယားဆေးရုံမသွားမီ အမေးများဆုံး မေးခွန်းများ၊ ကျန်းမာရေးအာမခံ (건강보험) ကုန်ကျစရိတ် နှင့် လုပ်ငန်းခွင်ထိခိုက်မှု (산재) လမ်းညွှန်
          </AppText>
        </View>
      </View>

      {/* Topic Selector Pills */}
      <View style={styles.topicsWrap}>
        {AI_PRECHECK_TOPICS.map((topic) => {
          const active = selectedReply.id === topic.id;
          return (
            <Pressable
              key={topic.id}
              onPress={() => setSelectedReply(topic)}
              style={[styles.topicBtn, active && styles.topicBtnActive]}
            >
              <MessageSquareHeart
                size={16}
                color={active ? '#FFFFFF' : Palette.aiAccent}
              />
              <AppText
                variant="burmese"
                color={active ? '#FFFFFF' : Palette.textPrimary}
                style={styles.flex1}
              >
                {topic.questionTriggerMm}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Selected Answer Box */}
      <View style={styles.answerCard}>
        <View style={styles.deptBadgeRow}>
          <View
            style={[
              styles.deptBadge,
              selectedReply.urgencyLevel === 'urgent' && styles.deptBadgeUrgent,
            ]}
          >
            <Stethoscope size={14} color="#FFFFFF" />
            <AppText variant="badge" color="#FFFFFF">
              권장: {selectedReply.departmentKo}
            </AppText>
          </View>
        </View>

        <AppText variant="h3" color={Palette.textPrimary} script="korean">
          {selectedReply.titleKo}
        </AppText>

        <AppText variant="burmese" color={Palette.textPrimary}>
          {selectedReply.answerMm}
        </AppText>

        {/* Phrase to Speak at Hospital */}
        <Pressable
          onPress={() => speakKorean(selectedReply.koreanPhraseToSay)}
          style={styles.phraseBox}
        >
          <View style={styles.flex1}>
            <AppText variant="caption" color={Palette.primaryDark}>
              병원에서 이렇게 말하세요 (ဆေးရုံတွင် ပြောရန် ကိုရီးယားစကား):
            </AppText>
            <AppText variant="h3" color={Palette.textPrimary} script="korean">
              &ldquo;{selectedReply.koreanPhraseToSay}&rdquo;
            </AppText>
            <AppText variant="caption" color={Palette.textSecondary}>
              အသံထွက်: {selectedReply.pronunciationMm}
            </AppText>
          </View>
          <View style={styles.speakerBtn}>
            <Volume2 size={18} color="#FFFFFF" />
          </View>
        </Pressable>
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
    borderColor: '#C4B5FD',
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
    backgroundColor: Palette.aiAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  topicsWrap: {
    gap: Spacing.xs,
  },
  topicBtn: {
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  topicBtnActive: {
    backgroundColor: Palette.aiAccent,
    borderColor: Palette.aiAccent,
  },
  answerCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    gap: Spacing.sm,
  },
  deptBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  deptBadgeUrgent: {
    backgroundColor: Palette.danger,
  },
  phraseBox: {
    marginTop: 4,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  speakerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

