import '@/global.css';
import { Platform } from 'react-native';

/**
 * LifeJip Theme System
 * Concept: "Clean Utility, Trustworthy Admin & Calm Healthcare"
 */
export const Palette = {
  primary: '#0D9488', // Emerald Teal — Medical Helper, Recycling, active tabs, primary buttons
  primaryDark: '#0F766E', // Pressed/Hover states
  primarySoft: '#CCFBF1', // Soft teal tint for pills & active backgrounds
  secondary: '#2563EB', // Trust Royal Blue — Admin Checklists, Banking, Wage Calculators
  secondaryDark: '#1D4ED8',
  secondarySoft: '#DBEAFE', // Soft blue background for admin cards
  danger: '#E11D48', // Coral Red — 119/SOS emergency bar, allergy alerts, warnings
  sos: '#E11D48', // Alias for danger / SOS emergency elements
  dangerSoft: '#FFE4E6', // Light red background for emergency cards
  aiAccent: '#7C3AED', // Electric Violet — V3 AI Scanner features
  aiAccentSoft: '#EDE9FE',
  background: '#F8FAFC', // Cool Alabaster — main screen background
  surface: '#FFFFFF', // Pure White — cards, modals, bottom sheets
  surfaceSubtle: '#F1F5F9', // Secondary surface / subtle container
  border: '#E2E8F0', // 1px card borders and dividers
  textPrimary: '#0F172A', // Slate Charcoal — Korean headings and main text
  textSecondary: '#475569', // Muted Slate — Burmese explanations and subtitles
  textMuted: '#94A3B8', // Placeholder and helper captions
  success: '#10B981', // Completed checklist items
  successSoft: '#D1FAE5',
  warning: '#F59E0B', // Visa expiry alerts & scam warnings
  warningSoft: '#FEF3C7',
} as const;

export const Colors = {
  ...Palette,
  light: {
    text: Palette.textPrimary,
    textSecondary: Palette.textSecondary,
    background: Palette.background,
    surface: Palette.surface,
    border: Palette.border,
    tint: Palette.primary,
  },
  dark: {
    text: Palette.textPrimary,
    textSecondary: Palette.textSecondary,
    background: Palette.background,
    surface: Palette.surface,
    border: Palette.border,
    tint: Palette.primary,
  },
} as const;

export const Fonts = {
  korean: Platform.select({
    web: "'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif",
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'sans-serif',
  }),
  burmese: Platform.select({
    web: "'Noto Sans Myanmar', 'Padauk', 'Myanmar Text', system-ui, sans-serif",
    ios: 'Myanmar Sangam MN',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  dual: Platform.select({
    web: "'Pretendard', 'Noto Sans KR', 'Noto Sans Myanmar', system-ui, sans-serif",
    default: undefined,
  }),
  mono: Platform.select({
    web: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const WebBreakpoint = 768;
export const MaxContentWidth = 1040;
