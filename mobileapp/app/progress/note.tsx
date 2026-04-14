import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
    noteInput: {
      flex: 1,
    },
    footer: {
      marginTop: theme.spacing.md,
    },
  });
}

export default function AddNoteScreen() {
  const router = useRouter();
  const { addEntry } = useProgressStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!note.trim()) {
      Alert.alert(t('common.error'), t('progress.form.noteRequired'));
      return;
    }

    addEntry({
      clientId: 'user-1',
      type: 'note',
      date: new Date().toISOString(),
      notes: note,
    });

    Alert.alert(t('progress.form.photoSuccessTitle'), t('progress.form.noteSuccessMessage'), [
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
          <Text style={styles.title}>{t('progress.form.addNoteTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <Input
          label={t('progress.form.noteLabel')}
          placeholder={t('progress.form.notePlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={8}
          containerStyle={styles.noteInput}
          textAlignVertical="top"
        />

        <View style={styles.footer}>
          <Button title={t('progress.form.saveEntry')} onPress={handleSave} icon={<Save size={20} color={colors.text} />} />
        </View>
      </View>
    </SafeAreaView>
  );
}
