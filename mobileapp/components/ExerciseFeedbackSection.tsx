import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, ImagePlus, MessageSquare, Play, X } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useLanguageStore } from '@/store/language-store';
import { useWorkoutStore } from '@/store/workout-store';
import type { Attachment } from '@/types';

type Props = {
  workoutId: string;
  exerciseId: string;
  /** When true, comment/attachments cannot be edited (e.g. trainers). */
  readOnly?: boolean;
  onPlayVideo?: (uri: string) => void;
};

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: theme.spacing.sm,
    },
    headerText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    commentInput: {
      minHeight: 64,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.backgroundLight,
      color: colors.text,
      fontSize: 14,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      textAlignVertical: 'top',
      marginBottom: theme.spacing.sm,
    },
    commentReadonly: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    emptyComment: {
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: theme.spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundLight,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    attachments: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    thumbWrap: {
      width: 72,
      height: 72,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      backgroundColor: colors.background,
      position: 'relative',
    },
    thumb: {
      width: '100%',
      height: '100%',
    },
    videoPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
    },
    removeBtn: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function ExerciseFeedbackSection({
  workoutId,
  exerciseId,
  readOnly = false,
  onPlayVideo,
}: Props) {
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useLanguageStore();
  const feedback = useWorkoutStore(s => s.exerciseFeedback[`${workoutId}:${exerciseId}`]);
  const setExerciseComment = useWorkoutStore(s => s.setExerciseComment);
  const addExerciseAttachment = useWorkoutStore(s => s.addExerciseAttachment);
  const removeExerciseAttachment = useWorkoutStore(s => s.removeExerciseAttachment);
  const [commentDraft, setCommentDraft] = useState(feedback?.comment ?? '');

  // Keep local draft in sync if store changes externally (e.g. after hydrate)
  useEffect(() => {
    setCommentDraft(feedback?.comment ?? '');
  }, [feedback?.comment]);

  const persistComment = useCallback(
    (text: string) => {
      setExerciseComment(workoutId, exerciseId, text);
    },
    [workoutId, exerciseId, setExerciseComment],
  );

  const pickMedia = useCallback(
    async (mode: 'library' | 'camera') => {
      if (readOnly) return;

      try {
        if (mode === 'camera') {
          if (Platform.OS === 'web') {
            Alert.alert(t('common.error'), t('workouts.feedback.cameraUnavailableWeb'));
            return;
          }
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(t('common.error'), t('progress.form.cameraPermissionDenied'));
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images', 'videos'],
            quality: 0.85,
            videoMaxDuration: 60,
          });
          if (result.canceled || !result.assets[0]?.uri) return;
          const asset = result.assets[0];
          const attachment: Attachment = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: asset.type === 'video' ? 'video' : 'image',
            url: asset.uri,
            name: asset.fileName ?? (asset.type === 'video' ? 'video.mp4' : 'photo.jpg'),
            size: asset.fileSize,
          };
          addExerciseAttachment(workoutId, exerciseId, attachment);
          return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('common.error'), t('progress.form.photoLibraryPermissionDenied'));
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images', 'videos'],
          quality: 0.85,
          allowsMultipleSelection: false,
          videoMaxDuration: 120,
        });
        if (result.canceled || !result.assets[0]?.uri) return;
        const asset = result.assets[0];
        const attachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: asset.type === 'video' ? 'video' : 'image',
          url: asset.uri,
          name: asset.fileName ?? (asset.type === 'video' ? 'video.mp4' : 'photo.jpg'),
          size: asset.fileSize,
        };
        addExerciseAttachment(workoutId, exerciseId, attachment);
      } catch (e) {
        console.warn('Failed to pick exercise media', e);
        Alert.alert(t('common.error'), t('workouts.feedback.attachFailed'));
      }
    },
    [readOnly, t, workoutId, exerciseId, addExerciseAttachment],
  );

  const attachments = feedback?.attachments ?? [];
  const hasContent = !!commentDraft.trim() || attachments.length > 0;

  if (readOnly && !hasContent) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageSquare size={14} color={colors.textSecondary} />
        <Text style={styles.headerText}>{t('workouts.feedback.title')}</Text>
      </View>

      {readOnly ? (
        commentDraft.trim() ? (
          <Text style={styles.commentReadonly}>{commentDraft.trim()}</Text>
        ) : (
          <Text style={styles.emptyComment}>{t('workouts.feedback.noComment')}</Text>
        )
      ) : (
        <TextInput
          style={styles.commentInput}
          value={commentDraft}
          onChangeText={(text) => {
            setCommentDraft(text);
            persistComment(text);
          }}
          placeholder={t('workouts.feedback.commentPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          multiline
        />
      )}

      {!readOnly && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => pickMedia('library')} activeOpacity={0.8}>
            <ImagePlus size={16} color={colors.primary} />
            <Text style={styles.actionText}>{t('workouts.feedback.addMedia')}</Text>
          </TouchableOpacity>
          {Platform.OS !== 'web' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => pickMedia('camera')} activeOpacity={0.8}>
              <Camera size={16} color={colors.primary} />
              <Text style={styles.actionText}>{t('workouts.feedback.camera')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {attachments.length > 0 && (
        <View style={styles.attachments}>
          {attachments.map(att => (
            <TouchableOpacity
              key={att.id}
              style={styles.thumbWrap}
              activeOpacity={0.85}
              onPress={() => {
                if (att.type === 'video' && onPlayVideo) {
                  onPlayVideo(att.url);
                }
              }}
              disabled={att.type !== 'video'}
            >
              {att.type === 'video' ? (
                <View style={styles.videoPlaceholder}>
                  <Play size={22} color="#fff" fill="#fff" />
                </View>
              ) : (
                <Image source={{ uri: att.url }} style={styles.thumb} contentFit="cover" />
              )}
              {!readOnly && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeExerciseAttachment(workoutId, exerciseId, att.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
