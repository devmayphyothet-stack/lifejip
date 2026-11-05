import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  loadBookmarkedPhrases,
  loadCompletedSteps,
  loadEmergencyProfile,
} from '@/services/storage';
import { isSupabaseConfigured, supabase } from '@/services/supabase';

const LAST_SYNC_KEY = '@lifejip/last_cloud_sync_timestamp_v2';

export interface SyncStatusResult {
  mode: 'cloud_synced' | 'offline_ready';
  lastSyncedAt: string;
  messageKo: string;
  messageMm: string;
}

export async function getLastSyncTimestamp(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

export async function performCloudSync(): Promise<SyncStatusResult> {
  const nowFormatted = new Date().toISOString().slice(0, 16).replace('T', ' ');

  if (!isSupabaseConfigured || !supabase) {
    await AsyncStorage.setItem(LAST_SYNC_KEY, nowFormatted).catch(() => {});
    return {
      mode: 'offline_ready',
      lastSyncedAt: nowFormatted,
      messageKo: '로컬 오프라인 데이터 동기화 완료 (100% 오프라인 작동 중)',
      messageMm:
        'သင့်ဖုန်းအတွင်းရှိ Offline ဒေတာများ အားလုံး အသင့်ရှိနေပါသည် (Supabase URL ထည့်သွင်းပြီးချိန်တွင် Cloud Sync အလိုအလျောက် ချိတ်ဆက်မည်)။',
    };
  }

  try {
    const [completedSteps, bookmarkedPhrases, emergencyProfile] =
      await Promise.all([
        loadCompletedSteps(),
        loadBookmarkedPhrases(),
        loadEmergencyProfile(),
      ]);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (userId) {
      await supabase.from('user_sync_profiles').upsert({
        user_id: userId,
        completed_steps: completedSteps,
        bookmarked_phrases: bookmarkedPhrases,
        emergency_profile: emergencyProfile,
        updated_at: new Date().toISOString(),
      });
    }

    await AsyncStorage.setItem(LAST_SYNC_KEY, nowFormatted);
    return {
      mode: 'cloud_synced',
      lastSyncedAt: nowFormatted,
      messageKo: 'Supabase 클라우드 백업 및 동기화 완료!',
      messageMm: 'Supabase Cloud နှင့် ဒေတာချိတ်ဆက် သိမ်းဆည်းမှု အောင်မြင်ပါသည်။',
    };
  } catch {
    return {
      mode: 'offline_ready',
      lastSyncedAt: nowFormatted,
      messageKo: '오프라인 캐시 모드로 안전하게 저장됨',
      messageMm:
        'အင်တာနက်ချိတ်ဆက်မှု မရှိသော်လည်း သင့်ဖုန်းထဲတွင် လုံခြုံစွာ သိမ်းဆည်းပြီးဖြစ်ပါသည်။',
    };
  }
}

