import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Heart,
  MessageCirclePlus,
  Send,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing } from '@/constants/theme';

export interface CommunityTipItem {
  id: string;
  authorName: string;
  authorBadge: string;
  categoryKo: string;
  titleKo: string;
  contentMm: string;
  likes: number;
}

const INITIAL_COMMUNITY_TIPS: CommunityTipItem[] = [
  {
    id: 'tip-1',
    authorName: 'Ko Min (서울 유학생)',
    authorBadge: 'D-2 유학',
    categoryKo: '교통 · 알뜰교통/기후동행',
    titleKo: '서울 지하철·버스 무제한 기후동행카드 (청년 할인)',
    contentMm:
      'ဆိုးလ်မှာ နေတဲ့ ကျောင်းသားနဲ့ လူငယ် (အသက် ၁၉~၃၉ နှစ်) တွေ 기후동행카드 (Climate Card) လုပ်ထားရင် တစ်လ 55,000 ဝမ်နဲ့ ဆိုးလ်မြေအောက်ရထားနဲ့ ဘတ်စ်ကား အကန့်အသတ်မရှိ စီးလို့ရပါတယ်။ ဘူတာရုံ 편의점 မှာ ကတ်ဝယ်ပြီး 티머니 App မှာ မှတ်ပုံတင်နိုင်ပါတယ်။',
    likes: 48,
  },
  {
    id: 'tip-2',
    authorName: 'Ma Su (인천 직장인)',
    authorBadge: 'E-9/E-7 근로자',
    categoryKo: '병원 · 실비/건강보험',
    titleKo: '약국 봉투 계산서(약제비 영수증) 버리지 마세요!',
    contentMm:
      'ကျောင်းသားအာမခံ (유학생 보험) သို့မဟုတ် 실비보험 ရှိသူတွေ ဆေးခန်းပြပြီးရင် 병원 진료비 영수증 တင်မကဘဲ 약국 (ဆေးဆိုင်) ကပေးတဲ့ 약봉투 ပေါ်က 약제비 계산서 စာရွက်ကိုပါ ဓာတ်ပုံရိုက်ထားပါ။ အာမခံပြန်လျှောက်ရင် ဆေးဖိုးပါ ပြန်ထုတ်လို့ ရပါတယ်။',
    likes: 63,
  },
  {
    id: 'tip-3',
    authorName: 'Ko Aung (수원 거주)',
    authorBadge: '체류 4년차',
    categoryKo: '자취 · 중고거래',
    titleKo: '당근마켓(Karrot)으로 자취방 가전 싸게 구하기',
    contentMm:
      'အခန်းအသစ်ပြောင်းခါစမှာ 전자레인지 (Microwave)၊ 밥솥 (ထမင်းပေါင်းအိုး)၊ 빨래건조대 (အဝတ်လှန်းစင်) တွေကို အသစ်မဝယ်ဘဲ 당근마켓 (Karrot App) မှာ ကိုယ့်ရပ်ကွက် 인증 လုပ်ပြီး ရှာဝယ်ရင် အခမဲ့ (나눔) သို့မဟုတ် 5,000~10,000 ဝမ်နဲ့ အကောင်းစားတွေ ရနိုင်ပါတယ်။',
    likes: 39,
  },
  {
    id: 'tip-4',
    authorName: 'Ma Hnin (부산 대학교)',
    authorBadge: 'D-4/D-2',
    categoryKo: '은행 · 환전/송금',
    titleKo: '은행 증명서 인터넷 발급 시 수수료 무료 꿀팁',
    contentMm:
      'ဗီဇာသက်တမ်းတိုးဖို့ 은행 잔고증명서 (ဘဏ်လက်ကျန်ရှင်းတမ်း) လိုတဲ့အခါ ဘဏ်ခွဲကို လူကိုယ်တိုင်သွားရင် 2,000 ဝမ်ပေးရပေမယ့် Hana / Shinhan ဘဏ်ဝက်ဘ်ဆိုက် (PC) ကနေ ထုတ်ရင် သက်သာပြီး အချိန်မကုန်ပါဘူး။ ထုတ်တဲ့နေ့မှာတော့ ငွေအဝင်အထွက် လုံးဝ မလုပ်မိဖို့ သတိထားပါ။',
    likes: 52,
  },
];

const CUSTOM_TIPS_KEY = '@lifejip/community_tips_v3';
const LIKED_TIPS_KEY = '@lifejip/liked_tips_v3';

export function CommunityTipsCard() {
  const [tips, setTips] = useState<CommunityTipItem[]>(INITIAL_COMMUNITY_TIPS);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitleKo, setNewTitleKo] = useState('');
  const [newContentMm, setNewContentMm] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(CUSTOM_TIPS_KEY)
      .then((raw) => {
        if (raw) {
          const custom = JSON.parse(raw) as CommunityTipItem[];
          setTips([...custom, ...INITIAL_COMMUNITY_TIPS]);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(LIKED_TIPS_KEY)
      .then((raw) => {
        if (raw) setLikedIds(JSON.parse(raw) as string[]);
      })
      .catch(() => {});
  }, []);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      AsyncStorage.setItem(LIKED_TIPS_KEY, JSON.stringify(updated)).catch(
        () => {}
      );
      return updated;
    });
  };

  const handleAddTip = async () => {
    if (!newContentMm.trim()) return;
    const created: CommunityTipItem = {
      id: `custom-${Date.now()}`,
      authorName: newAuthor.trim() || '미얀마 교민 (LifeJip 회원)',
      authorBadge: '커뮤니티 나눔',
      categoryKo: '생활 꿀팁',
      titleKo: newTitleKo.trim() || '한국 생활 실전 꿀팁 공유',
      contentMm: newContentMm.trim(),
      likes: 1,
    };

    const existingCustom = tips.filter((t) => t.id.startsWith('custom-'));
    const updatedCustom = [created, ...existingCustom];
    setTips([created, ...tips]);
    await AsyncStorage.setItem(
      CUSTOM_TIPS_KEY,
      JSON.stringify(updatedCustom)
    ).catch(() => {});

    setNewAuthor('');
    setNewTitleKo('');
    setNewContentMm('');
    setShowAddForm(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Users size={20} color={Palette.primary} />
        </View>
        <View style={styles.flex1}>
          <AppText variant="h2" color={Palette.textPrimary} script="korean">
            미얀마 유학생 · 근로자 생활 꿀팁 커뮤니티
          </AppText>
          <AppText variant="burmese" color={Palette.textSecondary}>
            ကိုရီးယားရောက် မြန်မာကျောင်းသားနှင့် အလုပ်သမားအချင်းချင်း မျှဝေထားသော လက်တွေ့ နေထိုင်မှု အကြံပြုချက်များ
          </AppText>
        </View>
        <Pressable
          onPress={() => setShowAddForm((prev) => !prev)}
          style={styles.writeBtn}
        >
          <MessageCirclePlus size={16} color="#FFFFFF" />
          <AppText variant="badge" color="#FFFFFF">
            꿀팁 작성
          </AppText>
        </Pressable>
      </View>

      {/* Add Tip Form */}
      {showAddForm ? (
        <View style={styles.formBox}>
          <AppText variant="bodyBold" color={Palette.primaryDark}>
            새 한국 생활 꿀팁 공유하기 (သင့်အတွေ့အကြုံ/အကြံပြုချက် ရေးသားမျှဝေရန်)
          </AppText>
          <TextInput
            value={newAuthor}
            onChangeText={setNewAuthor}
            placeholder="이름 / 닉네임 (예: Ko Kyaw · 부산)"
            placeholderTextColor={Palette.textMuted}
            style={styles.input}
          />
          <TextInput
            value={newTitleKo}
            onChangeText={setNewTitleKo}
            placeholder="제목 (예: 외국인 알바 세금 환급 꿀팁)"
            placeholderTextColor={Palette.textMuted}
            style={styles.input}
          />
          <TextInput
            value={newContentMm}
            onChangeText={setNewContentMm}
            multiline
            numberOfLines={3}
            placeholder="မြန်မာလို အကြံပြုချက် အသေးစိတ် ရေးသားပါ..."
            placeholderTextColor={Palette.textMuted}
            style={[styles.input, styles.textArea]}
          />
          <Pressable onPress={handleAddTip} style={styles.submitBtn}>
            <Send size={16} color="#FFFFFF" />
            <AppText variant="bodyBold" color="#FFFFFF">
              꿀팁 등록하기 (မျှဝေရန်)
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {/* Tips Feed */}
      <View style={styles.feedStack}>
        {tips.map((tip) => {
          const liked = likedIds.includes(tip.id);
          const displayLikes = tip.likes + (liked ? 1 : 0);
          return (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipMetaRow}>
                <View style={styles.authorWrap}>
                  <AppText variant="badge" color={Palette.primaryDark}>
                    {tip.authorName}
                  </AppText>
                  <View style={styles.badgePill}>
                    <AppText variant="caption" color={Palette.secondary}>
                      {tip.authorBadge} · {tip.categoryKo}
                    </AppText>
                  </View>
                </View>

                <Pressable
                  onPress={() => toggleLike(tip.id)}
                  style={[styles.likeBtn, liked && styles.likeBtnActive]}
                >
                  <Heart
                    size={15}
                    color={liked ? Palette.danger : Palette.textSecondary}
                  />
                  <AppText
                    variant="badge"
                    color={liked ? Palette.danger : Palette.textSecondary}
                  >
                    도움됨 {displayLikes}
                  </AppText>
                </Pressable>
              </View>

              <AppText variant="h3" color={Palette.textPrimary} script="korean">
                {tip.titleKo}
              </AppText>
              <AppText variant="burmese" color={Palette.textSecondary}>
                {tip.contentMm}
              </AppText>
            </View>
          );
        })}
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
    flexWrap: 'wrap',
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
    minWidth: 180,
  },
  writeBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.primary,
    gap: Spacing.sm,
  },
  input: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  textArea: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  feedStack: {
    gap: Spacing.sm,
  },
  tipCard: {
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 4,
  },
  tipMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  authorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgePill: {
    backgroundColor: Palette.secondarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  likeBtnActive: {
    backgroundColor: Palette.dangerSoft,
    borderColor: '#FDA4AF',
  },
});

