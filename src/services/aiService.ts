import { isSupabaseConfigured, supabase } from '@/services/supabase';

export type DocumentScanType =
  | 'utility_bill'
  | 'housing_contract'
  | 'prescription'
  | 'official_notice';

export interface DocumentKeyItem {
  termKo: string;
  valueKo: string;
  meaningMm: string;
}

export interface DocumentAnalysisResult {
  documentType: DocumentScanType;
  titleKo: string;
  titleMm: string;
  summaryMm: string;
  keyItems: DocumentKeyItem[];
  cautionMm: string;
  source: 'cloud_vision_ai' | 'smart_local_analyzer';
}

const SAMPLE_ANALYSES: Record<DocumentScanType, DocumentAnalysisResult> = {
  utility_bill: {
    documentType: 'utility_bill',
    titleKo: '관리비 · 도시가스 · 전기요금 고지서 분석',
    titleMm: 'လစဉ် အိမ်လခဝန်ဆောင်ခ (관리비) နှင့် မီတာ/ဂက်စ်ဖိုး စာရွက် အနှစ်ချုပ်',
    summaryMm:
      'ဤစာရွက်သည် လစဉ်ပေးဆောင်ရမည့် အဆောက်အဦဝန်ဆောင်ခ (관리비)၊ ရေဖိုး (수도요금)၊ လျှပ်စစ်မီးဖိုး (전기요금) နှင့် အပူပေးဂက်စ်ဖိုး (도시가스) တို့ကို ဖော်ပြထားသော တောင်းခံလွှာ ဖြစ်ပါသည်။ 납부기한 (နောက်ဆုံးပေးဆောင်ရမည့်ရက်) မတိုင်မီ 가상계좌 (သတ်မှတ်ဘဏ်အကောင့်) သို့ လွှဲပေးရပါမည်။',
    keyItems: [
      {
        termKo: '당월 부과금액 / 납부하실 금액',
        valueKo: '이번 달 내야 할 총 금액',
        meaningMm: 'ယခုလ ပေးဆောင်ရမည့် စုစုပေါင်း ကျသင့်ငွေပမာဏ',
      },
      {
        termKo: '납부기한 (납기일)',
        valueKo: '연체료 부과 기준일',
        meaningMm: 'နောက်ဆုံးထား ပေးဆောင်ရမည့်ရက် (ကျော်လွန်ပါက ဒဏ်ကြေး 연체료 ၂% တက်နိုင်သည်)',
      },
      {
        termKo: '일반관리비 · 청소비 · 공동전기료',
        valueKo: '건물 공용 관리 비용',
        meaningMm: 'အဆောက်အဦ သန့်ရှင်းရေး၊ လုံခြုံရေး နှင့် ဘုံသုံးမီးဖိုး',
      },
      {
        termKo: '세대 전기료 · 수도료 · 난방비(도시가스)',
        valueKo: '내가 사용한 만큼 내는 비용',
        meaningMm: 'မိမိအခန်းတွင် သုံးစွဲခဲ့သည့် မီးဖိုး၊ ရေဖိုး နှင့် အပူပေးဂက်စ်ဖိုး',
      },
      {
        termKo: '납부 전용 가상계좌',
        valueKo: '고지서 하단 은행 계좌번호',
        meaningMm: 'စာရွက်အောက်ခြေရှိ ငွေလွှဲရမည့် သီးသန့်ဘဏ်အကောင့်နံပါတ်',
      },
    ],
    cautionMm:
      '⚠️ 이체 (ငွေလွှဲ) သည့်အခါ ယခင်လက လွှဲခဲ့သော 계좌번호 ဖြစ်/မဖြစ် စစ်ဆေးပါ။ ဆောင်းရာသီတွင် 보일러 (အပူပေးစက်) ကို 외출 သို့မဟုတ် 실내 18~20°C တွင် ထားပါက ဂက်စ်ဖိုး သက်သာပါသည်။',
    source: 'smart_local_analyzer',
  },
  housing_contract: {
    documentType: 'housing_contract',
    titleKo: '주택 임대차계약서 (월세 · 전세 · 특약사항) 분석',
    titleMm: 'အိမ်ငှားစာချုပ် (월세/전세) အရေးကြီးအချက်များ နှင့် သတိထားရန် အနှစ်ချုပ်',
    summaryMm:
      'ဤစာချုပ်သည် အိမ်ရှင် (임대인) နှင့် အိမ်ငှား (임차인) ကြား ချုပ်ဆိုသော တရားဝင် အိမ်ငှားစာချုပ် ဖြစ်ပါသည်။ စပေါ်ငွေ (보증금)၊ လစဉ်အိမ်လခ (차임/월세) နှင့် အထူးသဘောတူညီချက် (특약사항) တို့ကို အဓိက စစ်ဆေးရပါမည်။',
    keyItems: [
      {
        termKo: '보증금 (Deposit)',
        valueKo: '퇴실 시 돌려받는 금액',
        meaningMm: 'အိမ်စပေါ်ငွေ (စာချုပ်ပြည့်၍ အိမ်ပြန်အပ်ချိန် ပြန်ရမည့်ငွေ)',
      },
      {
        termKo: '차임 (월세) 및 지급일',
        valueKo: '매월 지정일 선불/후불 지급',
        meaningMm: 'လစဉ်ပေးချေရမည့် အိမ်လခ နှင့် လစဉ် ငွေလွှဲရမည့်ရက်',
      },
      {
        termKo: '임대차 기간 (계약기간)',
        valueKo: '보통 1년 또는 2년 계약',
        meaningMm: 'အိမ်ငှားသက်တမ်း (စာချုပ်မကုန်မီ ၂~၆ လအလိုတွင် သက်တမ်းတိုး/မတိုး အိမ်ရှင်ကို ကြိုပြောရမည်)',
      },
      {
        termKo: '특약사항 (Special Terms)',
        valueKo: '수리비, 원상복구, 반려동물, 중도해지 조건',
        meaningMm: 'အထူးသဘောတူညီချက် (ပစ္စည်းပျက်ပြင်ဆင်စရိတ်၊ အိမ်ပြန်အပ်ချိန် သန့်ရှင်းရေးခ စသည်)',
      },
    ],
    cautionMm:
      '⚠️ အိမ်ပြောင်းပြီး (၁၄) ရက်အတွင်း 주민센터 သို့မဟုတ် 출입국 တွင် 체류지 변경신고 (전입신고) နှင့် 확정일자 မဖြစ်မနေ လုပ်ပါ (မလုပ်ပါက ဒဏ်ငွေ ၁ သိန်း~၁၀ သိန်းဝမ် ကျနိုင်သည်)။',
    source: 'smart_local_analyzer',
  },
  prescription: {
    documentType: 'prescription',
    titleKo: '약봉투 · 처방전 복약안내문 해독',
    titleMm: 'ဆေးစာ (처방전) နှင့် ဆေးအိတ် (약봉투) သောက်သုံးနည်း အနှစ်ချုပ်',
    summaryMm:
      'ဆေးအိတ်ပေါ်ရှိ ဆေးအမျိုးအစား (소염진통제 အရောင်ကျအကိုက်အခဲပျောက်ဆေး၊ 항생제 ပဋိဇီဝဆေး၊ 위장약 အစာအိမ်ဆေး) နှင့် တစ်နေ့ သောက်ရမည့် အကြိမ်ရေကို ဖော်ပြထားပါသည်။',
    keyItems: [
      {
        termKo: '투약량 · 횟수 · 일수 (예: 1정 / 3회 / 3일분)',
        valueKo: '한 번에 먹는 양 / 하루 횟수 / 총 일수',
        meaningMm: 'တစ်ကြိမ်သောက်ရမည့်ပမာဏ / တစ်နေ့သောက်ရမည့်အကြိမ် / စုစုပေါင်း ရက်အရေအတွက်',
      },
      {
        termKo: '식후 30분 (아침 · 점심 · 저녁)',
        valueKo: '식사 마친 뒤 30분 후 복용',
        meaningMm: 'မနက်၊ နေ့လယ်၊ ညနေ ထမင်းစားပြီး မိနစ် (၃၀) အကြာတွင် သောက်ရန်',
      },
      {
        termKo: '소염진통제 / 해열제',
        valueKo: '통증 완화 및 열 내리는 약',
        meaningMm: 'အရောင်ကျ နှင့် အဖျား/အကိုက်အခဲ ပျောက်ဆေး',
      },
      {
        termKo: '항생제 (Antibiotics)',
        valueKo: '세균 감염 치료제',
        meaningMm: 'ပိုးသတ်ဆေး/ပဋိဇီဝဆေး (ရောဂါသက်သာသွားသော်လည်း ပေးထားသည့်ရက် ကုန်အောင် သောက်ရမည်)',
      },
      {
        termKo: '위장보호제 / 소화제',
        valueKo: '속쓰림 방지 약',
        meaningMm: 'ဆေးကြောင့် အစာအိမ်မအောင့်စေရန် ထည့်ပေးထားသော အစာအိမ်ကာကွယ်ဆေး',
      },
    ],
    cautionMm:
      '⚠️ ဆေးသောက်နေစဉ် အရက်/ဘီယာ လုံးဝ မသောက်ရပါ။ 졸음 주의 (အိပ်ငိုက်တတ်သည်) ပါဝင်ပါက ကား/စက်ယန္တရား မောင်းနှင်ချိန် သတိထားပါ။',
    source: 'smart_local_analyzer',
  },
  official_notice: {
    documentType: 'official_notice',
    titleKo: '출입국 · 국민건강보험(NHIS) 우편 고지서 해독',
    titleMm: 'လူဝင်မှုကြီးကြပ်ရေး (출입국) နှင့် ကျန်းမာရေးအာမခံ (건강보험) အကြောင်းကြားစာ',
    summaryMm:
      'ကိုရီးယားအစိုးရရုံးများမှ စာတိုက်ဖြင့် ပေးပို့သော တရားဝင် အကြောင်းကြားစာ သို့မဟုတ် အာမခံကြေး တောင်းခံလွှာ ဖြစ်ပါသည်။',
    keyItems: [
      {
        termKo: '국민건강보험료 납부고지서',
        valueKo: '매월 25일까지 납부 필수',
        meaningMm: 'အမျိုးသားကျန်းမာရေးအာမခံကြေး (လစဉ် ၂၅ ရက်နေ့ နောက်ဆုံးထား သွင်းရမည်)',
      },
      {
        termKo: '체류기간 만료 사전안내문',
        valueKo: '비자 만료일 전 연장 신청 안내',
        meaningMm: 'ဗီဇာသက်တမ်း ကုန်ဆုံးတော့မည်ဖြစ်ကြောင်း ကြိုတင်သတိပေးစာ',
      },
      {
        termKo: '출석요구서 / 사실확인 통지서',
        valueKo: '관할 출입국·외국인청 방문 요청',
        meaningMm: 'သက်ဆိုင်ရာ 출입국 ရုံးသို့ လူကိုယ်တိုင် လာရောက်ဖြေရှင်းရန် ဆင့်ခေါ်စာ (1345 သို့ ချက်ချင်းဖုန်းဆက်မေးမြန်းပါ)',
      },
    ],
    cautionMm:
      '⚠️ 건강보험료 (ကျန်းမာရေးအာမခံကြေး) မသွင်းဘဲ ကြွေးကျန်ရှိပါက ဆေးရုံတက်ချိန် အာမခံခံစားခွင့် ဆုံးရှုံးပြီး ဗီဇာသက်တမ်းတိုးရာတွင် အခက်အခဲဖြစ်နိုင်ပါသည်။',
    source: 'smart_local_analyzer',
  },
};

const KEYWORD_DICTIONARY: {
  pattern: RegExp;
  termKo: string;
  meaningMm: string;
}[] = [
  {
    pattern: /관리비|청소비|승강기|공용/,
    termKo: '관리비 항목',
    meaningMm: 'အဆောက်အဦ လစဉ်ဝန်ဆောင်ခ (သန့်ရှင်းရေး/ဓာတ်လှေကား/ဘုံမီးဖိုး)',
  },
  {
    pattern: /도시가스|난방|보일러/,
    termKo: '도시가스 · 난방비',
    meaningMm: 'အပူပေးစက် နှင့် မီးဖိုချောင်သုံး ဂက်စ်ဖိုး',
  },
  {
    pattern: /전기요금|전기세|한전/,
    termKo: '전기요금 (한국전력)',
    meaningMm: 'လျှပ်စစ်မီးဖိုး (KEPCO)',
  },
  {
    pattern: /수도요금|상하수도/,
    termKo: '상하수도 요금',
    meaningMm: 'ရေဖိုး (ရေသုံးစွဲခ)',
  },
  {
    pattern: /납부기한|납기일|마감일/,
    termKo: '납부기한 (마감일)',
    meaningMm: 'နောက်ဆုံးထား ပေးသွင်းရမည့် ရက်စွဲ',
  },
  {
    pattern: /보증금|임대차|월세|차임/,
    termKo: '보증금 · 월세 조건',
    meaningMm: 'အိမ်စပေါ်ငွေ နှင့် လစဉ်အိမ်လခ သတ်မှတ်ချက်',
  },
  {
    pattern: /식후|식전|취침|1일|복용/,
    termKo: '약 복용 지시문',
    meaningMm: 'ဆေးသောက်ရမည့် အချိန်နှင့် အကြိမ်ရေ လမ်းညွှန်ချက်',
  },
  {
    pattern: /건강보험|건보료|체납/,
    termKo: '국민건강보험료 안내',
    meaningMm: 'ကျန်းမာရေးအာမခံကြေး ပေးသွင်းရန် အကြောင်းကြားချက်',
  },
];

export async function analyzeKoreanDocument(params: {
  documentType: DocumentScanType;
  koreanText?: string;
  imageBase64?: string;
}): Promise<DocumentAnalysisResult> {
  const { documentType, koreanText, imageBase64 } = params;

  // 1. Try Supabase Edge Function if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke(
        'analyze-document',
        {
          body: { documentType, koreanText, imageBase64 },
        }
      );
      if (!error && data && data.titleMm) {
        return {
          ...data,
          documentType,
          source: 'cloud_vision_ai',
        } as DocumentAnalysisResult;
      }
    } catch {
      // Fallback to local smart analyzer below
    }
  }

  // 2. Smart Local Offline Analyzer
  const baseTemplate = SAMPLE_ANALYSES[documentType];
  const rawText = (koreanText ?? '').trim();

  if (!rawText) {
    return baseTemplate;
  }

  // Extract amounts (e.g., 125,000원) and dates (e.g., 2026년 11월 25일) from pasted text
  const detectedItems: DocumentKeyItem[] = [];
  const amountMatches = rawText.match(/[0-9,]+원/g);
  if (amountMatches && amountMatches.length > 0) {
    detectedItems.push({
      termKo: '감지된 금액 (စာသားထဲမှ တွေ့ရှိသော ငွေပမာဏ)',
      valueKo: amountMatches.slice(0, 3).join(' / '),
      meaningMm: `စာရွက်/မက်ဆေ့ချ်ထဲတွင် ဖော်ပြထားသော ဝမ်ငွေပမာဏ (${amountMatches
        .slice(0, 3)
        .join(', ')})`,
    });
  }

  const dateMatches = rawText.match(
    /\d{4}[년.-]\s*\d{1,2}[월.-]\s*\d{1,2}일?|\d{1,2}월\s*\d{1,2}일/g
  );
  if (dateMatches && dateMatches.length > 0) {
    detectedItems.push({
      termKo: '감지된 날짜 / 기한 (တွေ့ရှိသော ရက်စွဲ)',
      valueKo: dateMatches.slice(0, 2).join(', '),
      meaningMm: `သတိပြုရမည့် ရက်စွဲ / နောက်ဆုံးရက် (${dateMatches
        .slice(0, 2)
        .join(', ')})`,
    });
  }

  for (const entry of KEYWORD_DICTIONARY) {
    if (entry.pattern.test(rawText)) {
      detectedItems.push({
        termKo: entry.termKo,
        valueKo: '문서 내 포함됨',
        meaningMm: entry.meaningMm,
      });
    }
  }

  return {
    ...baseTemplate,
    keyItems:
      detectedItems.length > 0
        ? [...detectedItems, ...baseTemplate.keyItems.slice(0, 3)]
        : baseTemplate.keyItems,
  };
}

export interface SymptomPreCheckReply {
  id: string;
  questionTriggerMm: string;
  titleKo: string;
  departmentKo: string;
  urgencyLevel: 'normal' | 'urgent';
  answerMm: string;
  koreanPhraseToSay: string;
  pronunciationMm: string;
}

export const AI_PRECHECK_TOPICS: SymptomPreCheckReply[] = [
  {
    id: 'qa-night-pain',
    questionTriggerMm: 'ညသန်းခေါင် အရမ်းဖျား/ဗိုက်အောင့်ရင် ဘယ်သွားရမလဲ?',
    titleKo: '야간/새벽 급성 통증 및 고열 대처법',
    departmentKo: '응급실 (종합병원) 또는 공공심야약국',
    urgencyLevel: 'urgent',
    answerMm:
      'ည ၁၀ နာရီနောက်ပိုင်း ဆေးခန်းများ ပိတ်ချိန်တွင် သာမန်ဖျားနာ/အကိုက်အခဲအတွက် 심야약국 (ညဖွင့်ဆေးဆိုင်) သို့မဟုတ် 24시 편의점 တွင် 타이레놀 ဝယ်သောက်နိုင်ပါသည်။ သို့သော် မခံမရပ်နိုင်အောင် ဗိုက်အောင့်ခြင်း၊ အသက်ရှူကျပ်ခြင်း၊ အဖျား 39°C ကျော်ခြင်းဖြစ်ပါက 119 ကို ခေါ်ဆိုပါ သို့မဟုတ် အနီးဆုံး 종합병원 응급실 (အရေးပေါ်ဌာန) သို့ သွားပါ။',
    koreanPhraseToSay: '배가 너무 아프고 열이 많이 나서 응급실에 가고 싶어요.',
    pronunciationMm: 'ဘယ်ဂါ နောမူ အာဖာဂို ယောလ်အီ မာနီ နာဆော အွန်းဂွတ်ရှီလ်အဲ ဂါဂို ရှစ်ဖောယို။',
  },
  {
    id: 'qa-work-injury',
    questionTriggerMm: 'အလုပ်လုပ်ရင်း ထိခိုက်ဒဏ်ရာရရင် (산재) ဘယ်လိုပြောရမလဲ?',
    titleKo: '산업재해 (산재보험) 진료 안내',
    departmentKo: '정형외과 / 외과 (산재지정병원)',
    urgencyLevel: 'urgent',
    answerMm:
      'စက်ရုံ သို့မဟုတ် လုပ်ငန်းခွင်တွင် ထိခိုက်ဒဏ်ရာရပါက (၄ ရက်နှင့်အထက် ကုသရန်လိုအပ်ပါက) 산재보험 (လုပ်ငန်းခွင်ထိခိုက်မှုအာမခံ) ဖြင့် ဆေးကုသစရိတ် နှင့် နားရက်လစာ တောင်းခံပိုင်ခွင့် ရှိပါသည်။ ဆေးရုံရောက်လျှင် 산재지정병원 (산재 အကျုံးဝင်သောဆေးရုံ) ဟုတ်/မဟုတ် မေးပြီး လုပ်ငန်းခွင်၌ ထိခိုက်ကြောင်း ဆရာဝန်ကို အသိပေးပါ။ အကူအညီလိုပါက 1350 သို့မဟုတ် 1577-0071 သို့ ဆက်သွယ်ပါ။',
    koreanPhraseToSay: '일하다가 다쳤어요. 산재보험 처리가 가능한 병원인가요?',
    pronunciationMm: 'အီလ်ဟာဒါဂါ ဒါချောဆောယို။ ဆန်ဂျယ်ဘိုဟောမ် ချောရီဂါ ဂါနွန်းဟန် ဗျောင်းဝေါန်အင်းန်ဂါယို?',
  },
  {
    id: 'qa-nhis-cost',
    questionTriggerMm: 'ကျန်းမာရေးအာမခံ (건강보험) နဲ့ ဆေးခန်းပြရင် ဘယ်လောက်ကျလဲ?',
    titleKo: '국민건강보험 적용 시 동네 의원 진료비',
    departmentKo: '동네 의원 (내과 · 이비인후과 · 정형외과 등)',
    urgencyLevel: 'normal',
    answerMm:
      'ARC ကတ်နှင့် 국민건강보험 (NHIS) ရှိပါက ရပ်ကွက်ထဲရှိ သာမန်ဆေးခန်း (의원) များတွင် ဆရာဝန်ပြခမှာ 5,000 ဝမ် ~ 15,000 ဝမ်ခန့်သာ ကျသင့်ပြီး ဆေးဆိုင် (약국) တွင် ဆေးဖိုးမှာ 3,000 ဝမ် ~ 8,000 ဝမ်ခန့်သာ ကျသင့်ပါသည် (X-ray သို့မဟုတ် သွေးစစ်ပါက အနည်းငယ် ပိုကျနိုင်သည်)။ ဆေးရုံကြီး (대학병원) သို့ တိုက်ရိုက်မသွားဘဲ 동네 의원 မှ အရင်ပြသပါ။',
    koreanPhraseToSay: '외국인등록증 있어요. 건강보험 적용해 주세요.',
    pronunciationMm: 'ဝဲဂွတ်ဂင်းန်ဒွန်းလို့ဂျွန်း အီဆောယို။ ဂေါန်ဂန်ဘိုဟောမ် ဂျော့ဂျုံးဟယ် ဂျူဆယ်ယို။',
  },
  {
    id: 'qa-dental-scaling',
    questionTriggerMm: 'သွားကျောက်ခြစ်တာ (스케일링) အာမခံနဲ့ သက်သာခွင့် ရှိလား?',
    titleKo: '연 1회 건강보험 치석제거 (스케일링) 혜택',
    departmentKo: '치과 (သွားနှင့်ခံတွင်း ဆေးခန်း)',
    urgencyLevel: 'normal',
    answerMm:
      '국민건강보험 ရှိသူတိုင်း တစ်နှစ်လျှင် (၁) ကြိမ် သွားကျောက်ခြစ်ခြင်း (스케일링) ကို အာမခံနှုန်းထား (16,000 ဝမ် ~ 20,000 ဝမ်ခန့်) ဖြင့် 치과 တိုင်းတွင် ပြုလုပ်နိုင်ပါသည်။',
    koreanPhraseToSay: '건강보험 적용되는 연 1회 스케일링 받으러 왔어요.',
    pronunciationMm: 'ဂေါန်ဂန်ဘိုဟောမ် ဂျော့ဂျုံးဒွယ်နွန်း ယောန် အီလ်ဟွဲ စကေးလင်း ဘာဒือရော ဝါဆောယို။',
  },
];

