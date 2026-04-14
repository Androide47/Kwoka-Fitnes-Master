import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import type { Client } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

const MAX_GOALS = 12;

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
    hint: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    goalRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    goalInputWrap: {
      flex: 1,
      minWidth: 0,
    },
    removeTouch: {
      padding: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    addBtn: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    saveBtn: {
      marginTop: theme.spacing.lg,
    },
  });
}

export default function GoalsSettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [goals, setGoals] = useState<string[]>(['']);

  useLayoutEffect(() => {
    if (user && user.role !== 'client') {
      router.replace('/settings');
    }
  }, [user, router]);

  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'client') {
        const g = (user as Client).goals;
        setGoals(g && g.length > 0 ? [...g] : ['']);
      }
    }, [user])
  );

  if (!user || user.role !== 'client') {
    return null;
  }

  const setGoalAt = (index: number, value: string) => {
    setGoals((prev) => prev.map((g, i) => (i === index ? value : g)));
  };

  const removeGoal = (index: number) => {
    setGoals((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  };

  const addGoal = () => {
    if (goals.length >= MAX_GOALS) return;
    setGoals((prev) => [...prev, '']);
  };

  const handleSave = () => {
    const cleaned = goals.map((g) => g.trim()).filter(Boolean);
    updateUser({ goals: cleaned });
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button
            title={t('settings.back')}
            onPress={() => router.back()}
            variant="text"
            style={styles.backButton}
          />
          <Text style={styles.title}>{t('settings.goalsTitle')}</Text>
        </View>

        <Text style={styles.hint}>{t('settings.goalsHint')}</Text>

        {goals.map((goal, index) => (
          <View key={index} style={styles.goalRow}>
            <View style={styles.goalInputWrap}>
              <Input
                placeholder={t('settings.goalPlaceholder')}
                value={goal}
                onChangeText={(text) => setGoalAt(index, text)}
                multiline
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <TouchableOpacity
              onPress={() => removeGoal(index)}
              style={styles.removeTouch}
              accessibilityRole="button"
              accessibilityLabel={t('settings.removeGoalA11y')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        {goals.length < MAX_GOALS && (
          <Button title={t('settings.addGoal')} onPress={addGoal} variant="outline" style={styles.addBtn} />
        )}

        <Button title={t('settings.saveGoals')} onPress={handleSave} style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}
