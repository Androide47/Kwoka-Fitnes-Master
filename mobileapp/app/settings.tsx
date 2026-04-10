import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Globe, Bell, Moon, User, HelpCircle, Info, ChevronRight, LogOut } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import { useThemeMode } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore, Language } from '@/store/language-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: theme.spacing.sm,
    },
    languageOptions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    languageOption: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedLanguage: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    languageText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    selectedLanguageText: {
      color: colors.text,
      fontWeight: '600',
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    menuSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    menuRow: {
      flex: 1,
    },
    logoutButton: {
      marginVertical: theme.spacing.lg,
      borderColor: colors.error,
    },
  });
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  const mode = useThemeMode();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const appearanceSubtitle =
    mode === 'light'
      ? t('settings.modeLight')
      : mode === 'dark'
        ? t('settings.modeDark')
        : t('settings.modeSystem');

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('nav.settings')}</Text>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          </View>

          <View style={styles.languageOptions}>
            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.selectedLanguage]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.languageText, language === 'en' && styles.selectedLanguageText]}>
                {t('settings.english')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, language === 'es' && styles.selectedLanguage]}
              onPress={() => handleLanguageChange('es')}
            >
              <Text style={[styles.languageText, language === 'es' && styles.selectedLanguageText]}>
                {t('settings.spanish')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/notifications')}>
            <Text style={styles.menuItemText}>{t('settings.notifications')}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Moon size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/dark-mode')}>
            <View style={styles.menuRow}>
              <Text style={styles.menuItemText}>{t('settings.appearanceSubtitle')}</Text>
              <Text style={styles.menuSubtitle}>{appearanceSubtitle}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/account')}>
            <Text style={styles.menuItemText}>{t('settings.account')}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.help')}</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/help')}>
            <Text style={styles.menuItemText}>{t('settings.help')}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/about')}>
            <View style={styles.menuRow}>
              <Text style={styles.menuItemText}>{t('app.name')}</Text>
              <Text style={styles.menuSubtitle}>{t('settings.version')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Button
          title={t('auth.logout')}
          onPress={logout}
          variant="outline"
          icon={<LogOut size={20} color={colors.error} />}
          style={styles.logoutButton}
          textStyle={{ color: colors.error }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
