import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useLanguageStore } from '@/store/language-store';
import { useNotificationPreferencesStore } from '@/store/notification-preferences-store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    backButton: {
      width: 'auto',
      marginRight: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    rowText: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    rowTitle: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    rowDesc: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    systemCard: {
      marginTop: theme.spacing.lg,
    },
    systemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    systemTextWrap: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
  });
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const workoutReminders = useNotificationPreferencesStore((s) => s.workoutReminders);
  const messageAlerts = useNotificationPreferencesStore((s) => s.messageAlerts);
  const announcements = useNotificationPreferencesStore((s) => s.announcements);
  const setWorkoutReminders = useNotificationPreferencesStore((s) => s.setWorkoutReminders);
  const setMessageAlerts = useNotificationPreferencesStore((s) => s.setMessageAlerts);
  const setAnnouncements = useNotificationPreferencesStore((s) => s.setAnnouncements);

  const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button
            title={t('settings.back')}
            onPress={() => router.back()}
            variant="text"
            style={styles.backButton}
          />
          <Text style={styles.title}>{t('settings.notifications')}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('settings.notifications')}</Text>
        <Card>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{t('settings.notifWorkoutReminders')}</Text>
              <Text style={styles.rowDesc}>{t('settings.notifWorkoutRemindersDesc')}</Text>
            </View>
            <Switch
              value={workoutReminders}
              onValueChange={setWorkoutReminders}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{t('settings.notifMessages')}</Text>
              <Text style={styles.rowDesc}>{t('settings.notifMessagesDesc')}</Text>
            </View>
            <Switch
              value={messageAlerts}
              onValueChange={setMessageAlerts}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{t('settings.notifAnnouncements')}</Text>
              <Text style={styles.rowDesc}>{t('settings.notifAnnouncementsDesc')}</Text>
            </View>
            <Switch
              value={announcements}
              onValueChange={setAnnouncements}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </Card>

        <Card style={styles.systemCard}>
          <TouchableOpacity style={styles.systemRow} onPress={openSystemSettings} activeOpacity={0.7}>
            <View style={styles.systemTextWrap}>
              <Text style={styles.rowTitle}>{t('settings.openSystemSettings')}</Text>
              <Text style={styles.rowDesc}>{t('settings.openSystemSettingsDesc')}</Text>
            </View>
            <ExternalLink size={22} color={colors.primary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
