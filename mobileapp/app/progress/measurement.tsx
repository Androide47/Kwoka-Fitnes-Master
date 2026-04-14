import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Save, X } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useProgressStore } from '@/store/progress-store';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    closeButton: {
      padding: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    hint: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: 18,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl * 2,
    },
    saveButton: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
  });
}

export default function AddMeasurementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addEntry } = useProgressStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [note, setNote] = useState('');

  const keyboardVerticalOffset = insets.top + theme.spacing.sm;

  const handleSave = () => {
    Keyboard.dismiss();

    const clientId = user?.id ?? 'user-1';

    addEntry({
      clientId,
      type: 'measurement',
      date: new Date().toISOString(),
      measurements: {
        date: new Date().toISOString(),
        weight: parseFloat(weight) || 0,
        chest: parseFloat(chest) || 0,
        waist: parseFloat(waist) || 0,
        hips: parseFloat(hips) || 0,
        arms: parseFloat(arms) || 0,
        thighs: parseFloat(thighs) || 0,
      },
      notes: note,
    });

    setTimeout(() => {
      Alert.alert(t('progress.form.photoSuccessTitle'), t('progress.form.measurementSuccessMessage'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    }, 80);
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={[styles.flex, { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md }]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                router.back();
              }}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('progress.form.addMeasurementsTitle')}</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.hint}>{t('progress.form.imperialUnitsHint')}</Text>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}
          >
            <Input
              label={t('progress.form.weightLbsLabel')}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder={t('progress.form.numericPlaceholder')}
            />

            <Input
              label={t('progress.form.chestInLabel')}
              value={chest}
              onChangeText={setChest}
              keyboardType="decimal-pad"
              placeholder={t('progress.form.numericPlaceholder')}
            />

            <Input
              label={t('progress.form.waistInLabel')}
              value={waist}
              onChangeText={setWaist}
              keyboardType="decimal-pad"
              placeholder={t('progress.form.numericPlaceholder')}
            />

            <Input
              label={t('progress.form.hipsInLabel')}
              value={hips}
              onChangeText={setHips}
              keyboardType="decimal-pad"
              placeholder={t('progress.form.numericPlaceholder')}
            />

            <Input
              label={t('progress.form.armsInLabel')}
              value={arms}
              onChangeText={setArms}
              keyboardType="decimal-pad"
              placeholder={t('progress.form.numericPlaceholder')}
            />

            <Input
              label={t('progress.form.thighsInLabel')}
              value={thighs}
              onChangeText={setThighs}
              keyboardType="decimal-pad"
              placeholder={t('progress.form.numericPlaceholder')}
            />

            <Input
              label={t('progress.form.notesLabel')}
              placeholder={t('progress.form.measurementNotesPlaceholder')}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              scrollEnabled={false}
            />

            <Button
              title={t('progress.form.saveEntry')}
              onPress={handleSave}
              icon={<Save size={20} color={colors.text} />}
              style={styles.saveButton}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
