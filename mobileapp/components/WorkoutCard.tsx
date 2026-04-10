import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Clock,
  Dumbbell,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Calendar,
  RotateCcw,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { Workout } from '@/types';
import { formatDate } from '@/utils/date-utils';
import { useWorkoutStore } from '@/store/workout-store';
import { groupExercises } from '@/utils/workout-utils';
import { Button } from './Button';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small,
      overflow: 'hidden',
    },
    mainContent: {},
    completedContainer: {
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    dateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.backgroundLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      gap: 4,
    },
    completedText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    expandedContent: {
      marginTop: theme.spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: theme.spacing.md,
    },
    exercisesTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      paddingLeft: 8,
    },
    exerciseBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginRight: 8,
    },
    exerciseText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    exerciseSets: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    groupLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
      marginTop: theme.spacing.sm,
      marginBottom: 4,
      paddingLeft: 8,
    },
    startButton: {
      marginTop: theme.spacing.md,
    },
  });
}

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onRepeat?: () => void;
  isCompleted?: boolean;
  showDate?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  onRepeat,
  isCompleted = false,
  showDate = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const getExerciseById = useWorkoutStore((s) => s.getExerciseById);
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return colors.success;
      case 'intermediate':
        return colors.warning;
      case 'advanced':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const scheduledDate = new Date();

  return (
    <View style={[styles.container, isCompleted && styles.completedContainer]}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8} style={styles.mainContent}>
        <View style={styles.header}>
          {showDate && (
            <View style={styles.dateBadge}>
              <Calendar size={12} color={colors.textSecondary} />
              <Text style={styles.dateText}>{formatDate(scheduledDate.toISOString())}</Text>
            </View>
          )}

          {isCompleted ? (
            <View style={styles.completedBadge}>
              <CheckCircle size={16} color={colors.text} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          ) : (
            <View
              style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) }]}
            >
              <Text style={styles.difficultyText}>
                {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{workout.name}</Text>
          {expanded ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </View>

        <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
          {workout.description}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{workout.duration} min</Text>
          </View>

          <View style={styles.stat}>
            <Dumbbell size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{workout.exercises.length} exercises</Text>
          </View>

          <View style={styles.stat}>
            <BarChart3 size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {workout.exercises.reduce((total, ex) => total + (ex.sets || 0), 0)} sets
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <Text style={styles.exercisesTitle}>Exercises:</Text>

          {groupExercises(workout.exercises).map((group) => (
            <View key={group.label}>
              <Text style={styles.groupLabel}>Group {group.label}</Text>
              {group.exercises.map((we, index) => {
                const exercise = getExerciseById(we.exerciseId);
                const label = exercise?.name ?? `Exercise ${index + 1}`;
                return (
                  <View key={we.exerciseId} style={styles.exerciseItem}>
                    <View style={styles.exerciseBullet} />
                    <Text style={styles.exerciseText} numberOfLines={2}>
                      {label}
                    </Text>
                    <Text style={styles.exerciseSets}>
                      {we.sets && we.reps
                        ? `${we.sets} sets x ${we.reps} reps`
                        : we.duration
                          ? `${we.sets ?? 1} sets x ${Math.floor(we.duration / 60)}:${String(we.duration % 60).padStart(2, '0')}`
                          : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}

          {isCompleted && onRepeat ? (
            <Button
              title="Repeat"
              onPress={onRepeat}
              variant="outline"
              style={styles.startButton}
              icon={<RotateCcw size={16} color={colors.primary} />}
            />
          ) : !isCompleted ? (
            <Button
              title="Review Workout"
              onPress={onPress}
              style={styles.startButton}
              icon={<Play size={16} color={colors.text} />}
            />
          ) : null}
        </View>
      )}
    </View>
  );
};
