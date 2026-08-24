import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import type { Client } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

const GOAL_KEYS = [
  'onboarding.goalLoseWeight',
  'onboarding.goalBuildMuscle',
  'onboarding.goalEndurance',
  'onboarding.goalFlexibility',
  'onboarding.goalGeneral',
  'onboarding.goalSport',
] as const;

const HABIT_KEYS = [
  'onboarding.habitExercise',
  'onboarding.habitNutrition',
  'onboarding.habitWater',
  'onboarding.habitSleep',
  'onboarding.habitStress',
  'onboarding.habitAlcohol',
  'onboarding.habitWalk',
  'onboarding.habitStretch',
] as const;

const LEVELS: Array<Client['fitnessLevel']> = ['beginner', 'intermediate', 'advanced'];

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    flex: { flex: 1 },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    stepLabel: {
      fontSize: 12,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    dots: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    dot: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.primary,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    half: {
      flex: 1,
    },
    chipGrid: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    chipOn: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '22',
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
    chipTextOn: {
      color: colors.text,
      fontWeight: '600',
    },
    sectionLabel: {
      fontSize: 16,
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    actionBtn: {
      flex: 1,
    },
    error: {
      color: colors.error,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
  });
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const client = user?.role === 'client' ? (user as Client) : null;

  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [birthday, setBirthday] = useState(client?.birthday ?? '');
  const [unitSystem, setUnitSystem] = useState<NonNullable<Client['unitSystem']>>(
    client?.unitSystem ?? 'imperial',
  );
  const [height, setHeight] = useState(client?.height ? String(client.height) : '');
  const [weight, setWeight] = useState(client?.weight ? String(client.weight) : '');
  const [fitnessLevel, setFitnessLevel] = useState<Client['fitnessLevel'] | ''>(
    client?.profileComplete ? client.fitnessLevel : '',
  );
  const [goals, setGoals] = useState<string[]>(client?.goals ?? []);
  const [habits, setHabits] = useState<string[]>(client?.habits ?? []);
  const [medical, setMedical] = useState((client?.medicalConditions ?? []).join(', '));
  const [error, setError] = useState('');

  const persistDraft = (patch: Partial<Client> = {}) => {
    updateUser({
      phone: phone.trim(),
      birthday,
      unitSystem,
      height: Number(height) || 0,
      weight: Number(weight) || 0,
      fitnessLevel: fitnessLevel || 'beginner',
      goals,
      habits,
      medicalConditions: medical
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      profileComplete: false,
      ...patch,
    });
  };

  const validate = () => {
    if (step === 0) {
      if (!phone.trim()) {
        setError(t('onboarding.errorPhone'));
        return false;
      }
      if (!birthday.trim()) {
        setError(t('onboarding.errorBirthday'));
        return false;
      }
    }
    if (step === 1) {
      if (!height.trim() || Number(height) <= 0) {
        setError(t('onboarding.errorHeight'));
        return false;
      }
      if (!weight.trim() || Number(weight) <= 0) {
        setError(t('onboarding.errorWeight'));
        return false;
      }
    }
    if (step === 2) {
      if (!fitnessLevel) {
        setError(t('onboarding.errorLevel'));
        return false;
      }
      if (goals.length === 0) {
        setError(t('onboarding.errorGoals'));
        return false;
      }
    }
    if (step === 3 && habits.length === 0) {
      setError(t('onboarding.errorHabits'));
      return false;
    }
    setError('');
    return true;
  };

  const handleContinue = () => {
    if (!validate()) return;
    persistDraft();
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    persistDraft({ profileComplete: true });
    router.replace('/(tabs)');
  };

  const titles = [
    t('onboarding.aboutTitle'),
    t('onboarding.bodyTitle'),
    t('onboarding.fitnessTitle'),
    t('onboarding.lifestyleTitle'),
  ];
  const subtitles = [
    t('onboarding.aboutSubtitle'),
    t('onboarding.bodySubtitle'),
    t('onboarding.fitnessSubtitle'),
    t('onboarding.lifestyleSubtitle'),
  ];

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepLabel}>
            {t('onboarding.stepOf').replace('{step}', String(step + 1)).replace('{total}', '4')}
          </Text>
          <Text style={styles.title}>{titles[step]}</Text>
          <Text style={styles.subtitle}>{subtitles[step]}</Text>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map((index) => (
              <View key={index} style={[styles.dot, index <= step && styles.dotActive]} />
            ))}
          </View>

          {step === 0 && (
            <>
              <Input
                label={t('onboarding.phone')}
                placeholder={t('onboarding.phonePlaceholder')}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label={t('onboarding.birthday')}
                placeholder="YYYY-MM-DD"
                value={birthday}
                onChangeText={setBirthday}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.sectionLabel}>{t('onboarding.units')}</Text>
              <View style={[styles.row, { marginBottom: theme.spacing.md }]}>
                {(['imperial', 'metric'] as const).map((system) => (
                  <TouchableOpacity
                    key={system}
                    style={[styles.chip, styles.half, unitSystem === system && styles.chipOn]}
                    onPress={() => setUnitSystem(system)}
                  >
                    <Text style={[styles.chipText, unitSystem === system && styles.chipTextOn]}>
                      {system === 'imperial' ? t('onboarding.imperial') : t('onboarding.metric')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Input
                    label={unitSystem === 'metric' ? t('onboarding.heightCm') : t('onboarding.heightIn')}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.half}>
                  <Input
                    label={unitSystem === 'metric' ? t('onboarding.weightKg') : t('onboarding.weightLb')}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.sectionLabel}>{t('onboarding.fitnessLevel')}</Text>
              <View style={styles.chipGrid}>
                {LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.chip, fitnessLevel === level && styles.chipOn]}
                    onPress={() => setFitnessLevel(level)}
                  >
                    <Text style={[styles.chipText, fitnessLevel === level && styles.chipTextOn]}>
                      {t(`common.${level}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionLabel}>{t('onboarding.goals')}</Text>
              <View style={styles.chipGrid}>
                {GOAL_KEYS.map((key) => {
                  const label = t(key);
                  const selected = goals.includes(label);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, selected && styles.chipOn]}
                      onPress={() => setGoals(toggleValue(goals, label))}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.sectionLabel}>{t('onboarding.habits')}</Text>
              <View style={styles.chipGrid}>
                {HABIT_KEYS.map((key) => {
                  const label = t(key);
                  const selected = habits.includes(label);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, selected && styles.chipOn]}
                      onPress={() => setHabits(toggleValue(habits, label))}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Input
                label={t('onboarding.medical')}
                placeholder={t('onboarding.medicalPlaceholder')}
                value={medical}
                onChangeText={setMedical}
                multiline
              />
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            {step > 0 && (
              <Button
                title={t('common.back')}
                variant="outline"
                style={styles.actionBtn}
                onPress={() => {
                  persistDraft();
                  setError('');
                  setStep((current) => current - 1);
                }}
              />
            )}
            <Button
              title={step === 3 ? t('onboarding.finish') : t('common.next')}
              style={styles.actionBtn}
              onPress={handleContinue}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
