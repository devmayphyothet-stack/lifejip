import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_EMERGENCY_PROFILE } from '@/data/seedData';
import type { EmergencyProfile } from '@/types';

const STORAGE_KEYS = {
  COMPLETED_STEPS: '@lifejip/completed_checklist_steps_v1',
  BOOKMARKED_PHRASES: '@lifejip/bookmarked_phrases_v1',
  EMERGENCY_PROFILE: '@lifejip/emergency_profile_v1',
} as const;

export async function loadCompletedSteps(): Promise<Record<string, boolean>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_STEPS);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export async function saveCompletedSteps(
  steps: Record<string, boolean>
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.COMPLETED_STEPS,
      JSON.stringify(steps)
    );
  } catch {
    // Offline fallback ignore write errors
  }
}

export async function loadBookmarkedPhrases(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKED_PHRASES);
    return raw ? (JSON.parse(raw) as string[]) : ['ph-hosp-1', 'ph-pharm-1'];
  } catch {
    return ['ph-hosp-1', 'ph-pharm-1'];
  }
}

export async function saveBookmarkedPhrases(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.BOOKMARKED_PHRASES,
      JSON.stringify(ids)
    );
  } catch {
    // Offline fallback ignore write errors
  }
}

export async function loadEmergencyProfile(): Promise<EmergencyProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_PROFILE);
    if (!raw) return DEFAULT_EMERGENCY_PROFILE;
    return {
      ...DEFAULT_EMERGENCY_PROFILE,
      ...(JSON.parse(raw) as Partial<EmergencyProfile>),
    };
  } catch {
    return DEFAULT_EMERGENCY_PROFILE;
  }
}

export async function saveEmergencyProfile(
  profile: EmergencyProfile
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.EMERGENCY_PROFILE,
      JSON.stringify(profile)
    );
  } catch {
    // Offline fallback ignore write errors
  }
}

