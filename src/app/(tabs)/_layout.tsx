import { Tabs, router, usePathname } from 'expo-router';
import {
  BookOpen,
  BriefcaseMedical,
  ClipboardCheck,
  Home,
  ShieldAlert,
  Wrench,
} from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette, Radius, Spacing, WebBreakpoint } from '@/constants/theme';

type TabRouteItem = {
  name: 'index' | 'admin' | 'medi' | 'phrasebook' | 'tools';
  href: '/' | '/admin' | '/medi' | '/phrasebook' | '/tools';
  labelEn: string;
  labelKo: string;
  labelMm: string;
  isCenterHighlight?: boolean;
  Icon: typeof Home;
};

const TAB_ITEMS: TabRouteItem[] = [
  {
    name: 'index',
    href: '/',
    labelEn: 'Home',
    labelKo: '홈 · 긴급',
    labelMm: 'ပင်မ',
    Icon: Home,
  },
  {
    name: 'admin',
    href: '/admin',
    labelEn: 'Life & Admin',
    labelKo: '체류 · 분리수거',
    labelMm: 'နေထိုင်မှုလမ်းညွှန်',
    Icon: ClipboardCheck,
  },
  {
    name: 'medi',
    href: '/medi',
    labelEn: 'Medi Helper',
    labelKo: '병원 · 증상카드',
    labelMm: 'ဆေးခန်းပြရန်',
    isCenterHighlight: true,
    Icon: BriefcaseMedical,
  },
  {
    name: 'phrasebook',
    href: '/phrasebook',
    labelEn: 'Phrasebook',
    labelKo: '상황별 회화',
    labelMm: 'စကားပြော',
    Icon: BookOpen,
  },
  {
    name: 'tools',
    href: '/tools',
    labelEn: 'Tools & Saved',
    labelKo: '응급카드 · 도구',
    labelMm: 'ကိရိယာများ',
    Icon: Wrench,
  },
];

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isDesktopSidebar = width >= WebBreakpoint;

  const isRouteActive = (item: TabRouteItem) => {
    if (item.href === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.startsWith(item.href);
  };

  return (
    <View
      style={[
        styles.rootWrapper,
        isDesktopSidebar && styles.rootWrapperDesktop,
      ]}
    >
      {/* Left Sidebar for Web/Tablet >= 768px */}
      {isDesktopSidebar ? (
        <View style={styles.sidebar}>
          <View style={styles.brandBox}>
            <View style={styles.logoMark}>
              <AppText variant="h2" color="#FFFFFF" script="korean">
                집
              </AppText>
            </View>
            <View style={styles.brandTextWrap}>
              <AppText variant="h2" color={Palette.textPrimary}>
                LifeJip
              </AppText>
              <AppText variant="caption" color={Palette.textSecondary}>
                Korea Life, Admin & Medi Guide
              </AppText>
            </View>
          </View>

          <View style={styles.sidebarNav}>
            {TAB_ITEMS.map((item) => {
              const active = isRouteActive(item);
              const IconComponent = item.Icon;

              return (
                <Pressable
                  key={item.name}
                  onPress={() => router.push(item.href)}
                  style={({ pressed }) => [
                    styles.sidebarItem,
                    item.isCenterHighlight && styles.sidebarItemMedi,
                    active && styles.sidebarItemActive,
                    active &&
                      item.isCenterHighlight &&
                      styles.sidebarItemMediActive,
                    pressed && { opacity: 0.88 },
                  ]}
                >
                  <IconComponent
                    size={20}
                    color={
                      item.isCenterHighlight
                        ? active
                          ? '#FFFFFF'
                          : Palette.primary
                        : active
                          ? Palette.primary
                          : Palette.textSecondary
                    }
                  />
                  <View style={styles.sidebarLabelCol}>
                    <AppText
                      variant="bodyBold"
                      color={
                        item.isCenterHighlight && active
                          ? '#FFFFFF'
                          : active
                            ? Palette.primaryDark
                            : Palette.textPrimary
                      }
                    >
                      {item.labelEn} · {item.labelKo}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={
                        item.isCenterHighlight && active
                          ? '#CCFBF1'
                          : Palette.textSecondary
                      }
                    >
                      {item.labelMm}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            <View style={styles.offlineBadge}>
              <ShieldAlert size={16} color={Palette.primaryDark} />
              <AppText variant="caption" color={Palette.primaryDark}>
                100% Offline-First Ready
              </AppText>
            </View>
            <AppText variant="caption" color={Palette.textSecondary}>
              အင်တာနက်မရှိချိန်တွင်ပါ အရေးပေါ်ဆေးရုံပြကတ်နှင့် လမ်းညွှန်များ အသုံးပြုနိုင်ပါသည်။
            </AppText>
          </View>
        </View>
      ) : null}

      {/* Main Content Area + Mobile Bottom Tabs */}
      <View style={styles.mainContent}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Palette.primary,
            tabBarInactiveTintColor: Palette.textSecondary,
            tabBarStyle: isDesktopSidebar
              ? { display: 'none' }
              : styles.mobileTabBar,
            tabBarLabelStyle: styles.mobileTabLabel,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <Home size={22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Admin',
              tabBarIcon: ({ color }) => (
                <ClipboardCheck size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="medi"
            options={{
              title: 'Medi Helper',
              tabBarIcon: ({ focused }) => (
                <View
                  style={[
                    styles.centerMediButton,
                    focused && styles.centerMediButtonFocused,
                  ]}
                >
                  <BriefcaseMedical size={24} color="#FFFFFF" />
                </View>
              ),
              tabBarLabelStyle: [
                styles.mobileTabLabel,
                { fontWeight: '800', color: Palette.primaryDark },
              ],
            }}
          />
          <Tabs.Screen
            name="phrasebook"
            options={{
              title: 'Phrases',
              tabBarIcon: ({ color }) => <BookOpen size={22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="tools"
            options={{
              title: 'Tools',
              tabBarIcon: ({ color }) => <Wrench size={22} color={color} />,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  rootWrapperDesktop: {
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: Palette.surface,
    borderRightWidth: 1,
    borderRightColor: Palette.border,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextWrap: {
    flex: 1,
  },
  sidebarNav: {
    flex: 1,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sidebarItemActive: {
    backgroundColor: Palette.primarySoft,
    borderColor: Palette.primary,
  },
  sidebarItemMedi: {
    borderColor: Palette.primary,
    backgroundColor: '#F0FDFA',
  },
  sidebarItemMediActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primaryDark,
  },
  sidebarLabelCol: {
    flex: 1,
  },
  sidebarFooter: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    gap: 6,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mainContent: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  mobileTabBar: {
    height: Platform.select({ ios: 86, android: 72, default: 70 }),
    paddingTop: 6,
    paddingBottom: Platform.select({ ios: 22, android: 10, default: 8 }),
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  mobileTabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  centerMediButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
    borderWidth: 3,
    borderColor: Palette.surface,
    shadowColor: Palette.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  centerMediButtonFocused: {
    backgroundColor: Palette.primaryDark,
    transform: [{ scale: 1.05 }],
  },
});

