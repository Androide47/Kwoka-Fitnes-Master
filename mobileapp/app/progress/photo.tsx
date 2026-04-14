import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Save, X } from 'lucide-react-native';
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
    placeholderContainer: {
      height: 300,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    placeholderText: {
      marginTop: theme.spacing.md,
      color: colors.textSecondary,
      fontSize: 16,
    },
    footer: {
      marginTop: 'auto',
    },
  });
}

export default function AddPhotoScreen() {
  const router = useRouter();
  const { addEntry } = useProgressStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [note, setNote] = useState('');

  const handleSave = () => {
    addEntry({
      clientId: 'user-1',
      type: 'photo',
      date: new Date().toISOString(),
      photos: [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      ],
      notes: note,
    });

    Alert.alert(t('progress.form.photoSuccessTitle'), t('progress.form.photoSuccessMessage'), [
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
          <Text style={styles.title}>{t('progress.form.addPhotoTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.placeholderContainer}>
          <Camera size={48} color={colors.textSecondary} />
          <Text style={styles.placeholderText}>{t('progress.form.tapPhotoHint')}</Text>
        </View>

        <Input
          label={t('progress.form.notesLabel')}
          placeholder={t('progress.form.photoNotesPlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
        />

        <View style={styles.footer}>
          <Button title={t('progress.form.saveEntry')} onPress={handleSave} icon={<Save size={20} color={colors.text} />} />
        </View>
      </View>
    </SafeAreaView>
  );
}
