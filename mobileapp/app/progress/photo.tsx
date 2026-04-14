import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, Save, X } from 'lucide-react-native';
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
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
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
    photoTouch: {
      height: 300,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    photoTouchFilled: {
      borderStyle: 'solid',
    },
    placeholderInner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    preview: {
      width: '100%',
      height: '100%',
    },
    placeholderText: {
      marginTop: theme.spacing.md,
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    footer: {
      marginTop: 'auto',
    },
  });
}

export default function AddPhotoScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addEntry } = useProgressStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const openCameraOrPicker = useCallback(async () => {
    Keyboard.dismiss();
    const useLibrary = Platform.OS === 'web';

    if (useLibrary) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('progress.form.photoLibraryPermissionDenied'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsMultipleSelection: false,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('progress.form.cameraPermissionDenied'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }, [t]);

  const handleSave = () => {
    Keyboard.dismiss();

    const showAlert = (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => {
      setTimeout(() => {
        Alert.alert(title, message, buttons);
      }, 80);
    };

    if (!photoUri) {
      showAlert(t('common.error'), t('progress.form.takePhotoFirst'));
      return;
    }

    const clientId = user?.id ?? 'user-1';

    addEntry({
      clientId,
      type: 'photo',
      date: new Date().toISOString(),
      photos: [photoUri],
      notes: note,
    });

    showAlert(t('progress.form.photoSuccessTitle'), t('progress.form.photoSuccessMessage'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.title}>{t('progress.form.addPhotoTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <TouchableOpacity
          style={[styles.photoTouch, photoUri && styles.photoTouchFilled]}
          onPress={openCameraOrPicker}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={photoUri ? t('progress.form.retakePhotoHint') : t('progress.form.tapPhotoHint')}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
          ) : (
            <View style={styles.placeholderInner}>
              <Camera size={48} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>{t('progress.form.tapPhotoHint')}</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input
          label={t('progress.form.notesLabel')}
          placeholder={t('progress.form.photoNotesPlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          scrollEnabled={false}
        />

        <View style={styles.footer}>
          <Button title={t('progress.form.saveEntry')} onPress={handleSave} icon={<Save size={20} color={colors.text} />} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
