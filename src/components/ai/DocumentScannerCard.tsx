import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  AlertTriangle,
  Camera,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing } from '@/constants/theme';
import {
  type DocumentAnalysisResult,
  type DocumentScanType,
  analyzeKoreanDocument,
} from '@/services/aiService';
import { speakKorean } from '@/services/speech';

const DOC_TYPES: {
  id: DocumentScanType;
  labelKo: string;
  labelMm: string;
}[] = [
  {
    id: 'utility_bill',
    labelKo: '관리비 · 도시가스 · 전기세',
    labelMm: 'မီတာ / ဂက်စ် / 관리비 စာရွက်',
  },
  {
    id: 'housing_contract',
    labelKo: '임대차계약서 (월세/전세)',
    labelMm: 'အိမ်ငှားစာချုပ်',
  },
  {
    id: 'prescription',
    labelKo: '처방전 · 약봉투',
    labelMm: 'ဆေးစာ / ဆေးအိတ်',
  },
  {
    id: 'official_notice',
    labelKo: '출입국 · 건강보험 통지서',
    labelMm: '출입국 / အာမခံရုံးစာ',
  },
];

export function DocumentScannerCard() {
  const [selectedDocType, setSelectedDocType] =
    useState<DocumentScanType>('utility_bill');
  const [koreanText, setKoreanText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);

  const handlePickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
      }

      const pickerResult = useCamera
        ? await ImagePicker.launchCameraAsync({
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            base64: true,
          });

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        const asset = pickerResult.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 ?? undefined);
        // Automatically run analysis on the selected document
        setAnalyzing(true);
        const analysis = await analyzeKoreanDocument({
          documentType: selectedDocType,
          koreanText,
          imageBase64: asset.base64 ?? undefined,
        });
        setResult(analysis);
        setAnalyzing(false);
      }
    } catch {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async (overrideType?: DocumentScanType) => {
    const docType = overrideType ?? selectedDocType;
    setAnalyzing(true);
    const analysis = await analyzeKoreanDocument({
      documentType: docType,
      koreanText,
      imageBase64,
    });
    setResult(analysis);
    setAnalyzing(false);
  };

  return (
    <View style={styles.card}>
      {/* AI Header */}
      <View style={styles.headerRow}>
        <View style={styles.aiIconBox}>
          <Sparkles size={22} color="#FFFFFF" />
        </View>
        <View style={styles.flex1}>
          <View style={styles.aiTag}>
            <AppText variant="badge" color={Palette.aiAccent}>
              VISION AI OCR & DOCUMENT TRANSLATOR
            </AppText>
          </View>
          <AppText variant="h2" color={Palette.textPrimary} script="korean">
            한국 서류 · 고지서 · 약봉투 AI 미얀마어 요약
          </AppText>
          <AppText variant="burmese" color={Palette.textSecondary}>
            관리비 မီတာစာရွက်၊ အိမ်ငှားစာချုပ်၊ ဆေးအိတ် နှင့် အစိုးရရုံးစာများကို ဓာတ်ပုံရိုက်၍ဖြစ်စေ၊ စာသားထည့်၍ဖြစ်စေ မြန်မာလို အနှစ်ချုပ် ကြည့်ရှုပါ
          </AppText>
        </View>
      </View>

      {/* 1. Select Document Category */}
      <View style={styles.fieldGroup}>
        <AppText variant="bodyBold" color={Palette.textPrimary}>
          1. 문서 종류 선택 (စာရွက်စာတမ်း အမျိုးအစား ရွေးပါ)
        </AppText>
        <View style={styles.docTypeGrid}>
          {DOC_TYPES.map((dt) => {
            const active = selectedDocType === dt.id;
            return (
              <Pressable
                key={dt.id}
                onPress={() => {
                  setSelectedDocType(dt.id);
                  handleAnalyze(dt.id);
                }}
                style={[styles.docChip, active && styles.docChipActive]}
              >
                <AppText
                  variant="bodyBold"
                  color={active ? '#FFFFFF' : Palette.textPrimary}
                  script="korean"
                >
                  {dt.labelKo}
                </AppText>
                <AppText
                  variant="caption"
                  color={active ? '#EDE9FE' : Palette.textSecondary}
                >
                  {dt.labelMm}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. Camera / Gallery Upload Buttons */}
      <View style={styles.cameraRow}>
        <Pressable
          onPress={() => handlePickImage(true)}
          style={styles.cameraBtn}
        >
          <Camera size={20} color="#FFFFFF" />
          <View>
            <AppText variant="bodyBold" color="#FFFFFF">
              카메라로 서류 촬영
            </AppText>
            <AppText variant="caption" color="#EDE9FE">
              ကင်မရာဖြင့် ဓာတ်ပုံရိုက်ရန်
            </AppText>
          </View>
        </Pressable>

        <Pressable
          onPress={() => handlePickImage(false)}
          style={styles.galleryBtn}
        >
          <ImageIcon size={20} color={Palette.aiAccent} />
          <View>
            <AppText variant="bodyBold" color={Palette.aiAccent}>
              앨범에서 사진 선택
            </AppText>
            <AppText variant="caption" color={Palette.textSecondary}>
              ဖုန်းထဲမှ ပုံရွေးရန်
            </AppText>
          </View>
        </Pressable>
      </View>

      {/* Image Preview if selected */}
      {imageUri ? (
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            contentFit="cover"
          />
          <View style={styles.previewMeta}>
            <AppText variant="bodyBold" color={Palette.aiAccent}>
              ✓ 사진 업로드 완료 (ဓာတ်ပုံ ရွေးချယ်ပြီးပါပြီ)
            </AppText>
            <Pressable
              onPress={() => {
                setImageUri(null);
                setImageBase64(undefined);
              }}
            >
              <AppText variant="caption" color={Palette.danger}>
                사진 제거 (ပုံဖျက်ရန်)
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* 3. Optional Korean Text / SMS Input */}
      <View style={styles.fieldGroup}>
        <AppText variant="bodyBold" color={Palette.textPrimary}>
          2. 한국어 고지서/문자 내용 붙여넣기 (선택 • စာသား/SMS ရှိပါက ထည့်နိုင်သည်)
        </AppText>
        <TextInput
          value={koreanText}
          onChangeText={setKoreanText}
          multiline
          numberOfLines={3}
          placeholder="예: 11월분 관리비 145,000원, 납부기한 2026년 11월 25일 / 도시가스 요금 안내..."
          placeholderTextColor={Palette.textMuted}
          style={styles.textArea}
        />

        <Pressable
          onPress={() => handleAnalyze()}
          style={({ pressed }) => [
            styles.analyzeBtn,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Sparkles size={18} color="#FFFFFF" />
          <AppText variant="bodyBold" color="#FFFFFF">
            {analyzing
              ? 'AI 분석 중... (ခွဲခြမ်းစိတ်ဖြာနေပါသည်)'
              : '미얀마어로 핵심 요약 보기 (မြန်မာလို အနှစ်ချုပ်ကြည့်ရန်)'}
          </AppText>
        </Pressable>
      </View>

      {/* 4. AI Analysis Result Card */}
      {result ? (
        <View style={styles.resultBox}>
          <View style={styles.resultHeader}>
            <View style={styles.sourceBadge}>
              <FileText size={14} color={Palette.aiAccent} />
              <AppText variant="caption" color={Palette.aiAccent}>
                {result.source === 'cloud_vision_ai'
                  ? 'Supabase Vision AI 요약'
                  : '오프라인 스마트 문서 해독기'}
              </AppText>
            </View>
            <Pressable
              onPress={() => speakKorean(result.titleKo)}
              style={styles.ttsSmallBtn}
            >
              <Volume2 size={14} color={Palette.aiAccent} />
              <AppText variant="caption" color={Palette.aiAccent}>
                제목 듣기
              </AppText>
            </Pressable>
          </View>

          <AppText variant="h2" color={Palette.textPrimary} script="korean">
            {result.titleKo}
          </AppText>
          <AppText variant="bodyBold" color={Palette.aiAccent}>
            {result.titleMm}
          </AppText>
          <AppText variant="burmese" color={Palette.textPrimary}>
            {result.summaryMm}
          </AppText>

          <View style={styles.itemsList}>
            {result.keyItems.map((item, idx) => (
              <View key={idx} style={styles.keyItemRow}>
                <View style={styles.keyItemTop}>
                  <AppText
                    variant="bodyBold"
                    color={Palette.textPrimary}
                    script="korean"
                  >
                    • {item.termKo}
                  </AppText>
                  <AppText variant="caption" color={Palette.aiAccent}>
                    {item.valueKo}
                  </AppText>
                </View>
                <AppText variant="burmese" color={Palette.textSecondary}>
                  ➔ {item.meaningMm}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.cautionBox}>
            <View style={styles.cautionHeader}>
              <AlertTriangle size={16} color={Palette.danger} />
              <AppText variant="badge" color={Palette.danger}>
                필수 확인 주의사항
              </AppText>
            </View>
            <AppText variant="burmese" color={Palette.textPrimary}>
              {result.cautionMm}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  aiIconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Palette.aiAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTag: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.aiAccentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginBottom: 2,
  },
  flex1: {
    flex: 1,
  },
  fieldGroup: {
    gap: 8,
  },
  docTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  docChip: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  docChipActive: {
    backgroundColor: Palette.aiAccent,
    borderColor: Palette.aiAccent,
  },
  cameraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cameraBtn: {
    flex: 1,
    minWidth: 160,
    backgroundColor: Palette.aiAccent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  galleryBtn: {
    flex: 1,
    minWidth: 160,
    backgroundColor: Palette.aiAccentSoft,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  previewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.background,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  previewImage: {
    width: 68,
    height: 68,
    borderRadius: Radius.sm,
  },
  previewMeta: {
    flex: 1,
    gap: 4,
  },
  textArea: {
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    fontSize: 14,
    color: Palette.textPrimary,
    minHeight: 74,
    textAlignVertical: 'top',
  },
  analyzeBtn: {
    backgroundColor: Palette.aiAccent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resultBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    gap: Spacing.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  ttsSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  itemsList: {
    gap: Spacing.xs,
    marginTop: 4,
  },
  keyItemRow: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 2,
  },
  keyItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  cautionBox: {
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FDA4AF',
    gap: 4,
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

