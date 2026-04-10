import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';

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
    profileBlock: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    rolePill: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.round,
      backgroundColor: colors.backgroundLight,
    },
    roleText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    meta: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    emailNote: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    saveBtn: {
      marginTop: theme.spacing.lg,
    },
  });
}

function formatJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState(user?.name ?? '');

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (!user) return null;

  const roleLabel = user.role === 'trainer' ? t('settings.roleTrainer') : t('settings.roleClient');

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed) updateUser({ name: trimmed });
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Button
            title={t('settings.back')}
            onPress={() => router.back()}
            variant="text"
            style={styles.backButton}
          />
          <Text style={styles.title}>{t('settings.accountTitle')}</Text>
        </View>

        <View style={styles.profileBlock}>
          <Avatar source={user.avatar} name={user.name} size={88} />
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
          <Text style={styles.meta}>
            {t('settings.memberSince')}: {formatJoined(user.joinedAt)}
          </Text>
        </View>

        <Card>
          <Input label={t('auth.name')} value={name} onChangeText={setName} placeholder={t('auth.enterName')} />
          <Input label={t('auth.email')} value={user.email} editable={false} />
          <Text style={styles.emailNote}>{t('settings.emailReadOnly')}</Text>
        </Card>

        <Button title={t('settings.saveProfile')} onPress={handleSave} style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}
