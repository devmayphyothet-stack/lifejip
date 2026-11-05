import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

export type AppTextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subtitle'
  | 'body'
  | 'bodyBold'
  | 'burmese'
  | 'koreanShowCard'
  | 'caption'
  | 'badge';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  color?: string;
  fontSize?: number;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  script?: 'dual' | 'korean' | 'burmese' | 'mono';
}

const VARIANT_CONFIG: Record<
  AppTextVariant,
  { fontSize: number; fontWeight: TextStyle['fontWeight']; color: string }
> = {
  h1: { fontSize: 24, fontWeight: '800', color: Palette.textPrimary },
  h2: { fontSize: 20, fontWeight: '700', color: Palette.textPrimary },
  h3: { fontSize: 17, fontWeight: '700', color: Palette.textPrimary },
  subtitle: { fontSize: 15, fontWeight: '600', color: Palette.textSecondary },
  body: { fontSize: 15, fontWeight: '400', color: Palette.textPrimary },
  bodyBold: { fontSize: 15, fontWeight: '700', color: Palette.textPrimary },
  burmese: { fontSize: 14, fontWeight: '500', color: Palette.textSecondary },
  koreanShowCard: { fontSize: 28, fontWeight: '800', color: Palette.textPrimary },
  caption: { fontSize: 12, fontWeight: '500', color: Palette.textSecondary },
  badge: { fontSize: 12, fontWeight: '700', color: Palette.textPrimary },
};

/**
 * Dual-Script (Korean + Burmese) Safe Text Component.
 * Enforces `lineHeight: fontSize * 1.6` and `paddingVertical: 4` so tall Burmese
 * upper/lower vowel diacritics never clip on Android, iOS, or Web.
 */
export function AppText({
  variant = 'body',
  color,
  fontSize,
  weight,
  align,
  script = 'dual',
  style,
  children,
  ...rest
}: AppTextProps) {
  const baseConfig = VARIANT_CONFIG[variant];
  const flattenedStyle = StyleSheet.flatten(style) as TextStyle | undefined;

  const resolvedFontSize =
    fontSize ?? flattenedStyle?.fontSize ?? baseConfig.fontSize;

  // Enforce dual-script rule: lineHeight = fontSize * 1.6 and paddingVertical = 4
  const computedLineHeight = Math.round(resolvedFontSize * 1.6);

  const fontFamily =
    script === 'korean'
      ? Fonts.korean
      : script === 'burmese'
        ? Fonts.burmese
        : script === 'mono'
          ? Fonts.mono
          : Fonts.dual;

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: resolvedFontSize,
          lineHeight: computedLineHeight,
          paddingVertical: 4,
          fontWeight: weight ?? baseConfig.fontWeight,
          color: color ?? baseConfig.color,
          fontFamily,
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 4,
    ...(Platform.OS === 'android' ? { includeFontPadding: true } : {}),
  },
});

export default AppText;

