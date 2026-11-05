import * as Speech from 'expo-speech';

export async function speakKorean(
  text: string,
  options?: { rate?: number; onDone?: () => void }
): Promise<void> {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
    Speech.speak(text, {
      language: 'ko-KR',
      rate: options?.rate ?? 0.9,
      pitch: 1.0,
      onDone: options?.onDone,
      onError: options?.onDone,
      onStopped: options?.onDone,
    });
  } catch {
    options?.onDone?.();
  }
}

export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch {
    // Ignore
  }
}

