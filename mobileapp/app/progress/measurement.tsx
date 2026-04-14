import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    closeButton: {
      padding: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    saveButton: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
  });
}

export default function AddMeasurementScreen() {
  const router = useRouter();
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

  const handleSave = () => {
    addEntry({
      clientId: 'user-1',
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

    Alert.alert(t('progress.form.photoSuccessTitle'), t('progress.form.measurementSuccessMessage'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('progress.form.addMeasurementsTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Input
            label={t('progress.form.weightKgLabel')}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder={t('progress.form.numericPlaceholder')}
          />

          <Input
            label={t('progress.form.chestCm')}
            value={chest}
            onChangeText={setChest}
            keyboardType="numeric"
            placeholder={t('progress.form.numericPlaceholder')}
          />

          <Input
            label={t('progress.form.waistCm')}
            value={waist}
            onChangeText={setWaist}
            keyboardType="numeric"
            placeholder={t('progress.form.numericPlaceholder')}
          />

          <Input
            label={t('progress.form.hipsCm')}
            value={hips}
            onChangeText={setHips}
            keyboardType="numeric"
            placeholder={t('progress.form.numericPlaceholder')}
          />

          <Input
            label={t('progress.form.armsCm')}
            value={arms}
            onChangeText={setArms}
            keyboardType="numeric"
            placeholder={t('progress.form.numericPlaceholder')}
          />

          <Input
            label={t('progress.form.thighsCm')}
            value={thighs}
            onChangeText={setThighs}
            keyboardType="numeric"
            placeholder={t('progress.form.numericPlaceholder')}
          />

          <Input
            label={t('progress.form.notesLabel')}
            placeholder={t('progress.form.measurementNotesPlaceholder')}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />

          <Button
            title={t('progress.form.saveEntry')}
            onPress={handleSave}
            icon={<Save size={20} color={colors.text} />}
            style={styles.saveButton}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
