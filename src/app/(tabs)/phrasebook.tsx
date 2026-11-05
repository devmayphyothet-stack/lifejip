import { useFocusEffect } from 'expo-router';
import {
  Bookmark,
  Search,
  Volume2,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
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
  PHRASE_CATEGORIES,
  SITUATION_VOCABS,
} from '@/data/seedData';
import { speakKorean } from '@/services/speech';
import {
  loadBookmarkedPhrases,
  saveBookmarkedPhrases,
} from '@/services/storage';
import type { PhraseCategory } from '@/types';

export default function PhrasebookScreen() {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'saved' | PhraseCategory
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadBookmarkedPhrases().then(setBookmarkedIds);
    }, [])
  );

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      saveBookmarkedPhrases(updated);
      return updated;
    });
  };

  const filteredPhrases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SITUATION_VOCABS.filter((phrase) => {
      if (selectedCategory === 'saved' && !bookmarkedIds.includes(phrase.id)) {
        return false;
      }
      if (
        selectedCategory !== 'all' &&
        selectedCategory !== 'saved' &&
        phrase.category !== selectedCategory
      ) {
        return false;
      }
      if (!q) return true;
      return (
        phrase.korean.toLowerCase().includes(q) ||
        phrase.burmese.toLowerCase().includes(q) ||
        phrase.pronunciationMm.toLowerCase().includes(q) ||
        phrase.categoryKo.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery, bookmarkedIds]);

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
              상황별 필수 한국어 회화 (Phrasebook)
            </AppText>
            <AppText variant="burmese" color={Palette.textSecondary}>
              ဆေးရုံ၊ ဆေးဆိုင်၊ 출입국 (လူဝင်မှုကြီးကြပ်ရေး)၊ ဘဏ် နှင့် အိမ်ခြံမြေရုံးများတွင် ချက်ချင်းပြောနိုင်/အသံဖွင့်ပြနိုင်သော စကားပြောများ
            </AppText>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search size={18} color={Palette.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="စကားပြော ရှာဖွေရန် (ဥပမာ - 보험, 처방전, 비자, 체크카드)..."
              placeholderTextColor={Palette.textMuted}
              style={styles.searchInput}
            />
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <Pressable
              onPress={() => setSelectedCategory('all')}
              style={[
                styles.chip,
                selectedCategory === 'all' && styles.chipActive,
              ]}
            >
              <AppText
                variant="badge"
                color={
                  selectedCategory === 'all' ? '#FFFFFF' : Palette.textPrimary
                }
              >
                전체 · အားလုံး
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setSelectedCategory('saved')}
              style={[
                styles.chip,
                selectedCategory === 'saved' && styles.chipSavedActive,
              ]}
            >
              <AppText
                variant="badge"
                color={
                  selectedCategory === 'saved' ? '#FFFFFF' : Palette.secondary
                }
              >
                ★ 저장됨 ({bookmarkedIds.length}) · မှတ်သားထားသော
              </AppText>
            </Pressable>

            {PHRASE_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[styles.chip, active && styles.chipActive]}
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

          {/* Phrase Cards */}
          {filteredPhrases.map((item) => {
            const isSaved = bookmarkedIds.includes(item.id);
            return (
              <View key={item.id} style={styles.phraseCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.categoryBadge}>
                    <AppText variant="badge" color={Palette.primaryDark}>
                      {item.categoryKo} · {item.categoryMm}
                    </AppText>
                  </View>

                  <View style={styles.actionsRow}>
                    <Pressable
                      onPress={() => speakKorean(item.korean, { rate: 0.9 })}
                      style={styles.speakBtn}
                    >
                      <Volume2 size={18} color="#FFFFFF" />
                      <AppText variant="badge" color="#FFFFFF">
                        음성 듣기
                      </AppText>
                    </Pressable>

                    <Pressable
                      onPress={() => toggleBookmark(item.id)}
                      style={[
                        styles.bookmarkBtn,
                        isSaved && styles.bookmarkBtnActive,
                      ]}
                      accessibilityLabel="Toggle bookmark"
                    >
                      <Bookmark
                        size={18}
                        color={isSaved ? Palette.secondary : Palette.textMuted}
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={() => speakKorean(item.korean, { rate: 0.85 })}
                >
                  <AppText
                    variant="h2"
                    color={Palette.textPrimary}
                    script="korean"
                  >
                    {item.korean}
                  </AppText>
                </Pressable>

                <AppText variant="bodyBold" color={Palette.primaryDark}>
                  {item.burmese}
                </AppText>

                <AppText variant="burmese" color={Palette.textSecondary}>
                  အသံထွက်: {item.pronunciationMm}
                </AppText>

                {item.usageTipMm ? (
                  <View style={styles.tipBanner}>
                    <AppText variant="burmese" color={Palette.secondaryDark}>
                      💡 {item.usageTipMm}
                    </AppText>
                  </View>
                ) : null}
              </View>
            );
          })}
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
  chipsRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  chipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipSavedActive: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  phraseCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  categoryBadge: {
    backgroundColor: Palette.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speakBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.background,
  },
  bookmarkBtnActive: {
    borderColor: Palette.secondary,
    backgroundColor: Palette.secondarySoft,
  },
  tipBanner: {
    marginTop: 4,
    backgroundColor: Palette.secondarySoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});

