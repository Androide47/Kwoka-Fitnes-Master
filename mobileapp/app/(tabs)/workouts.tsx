import React, { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useWorkoutStore } from '@/store/workout-store';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { WorkoutCard } from '@/components/WorkoutCard';
import { formatDate } from '@/utils/date-utils';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    dateText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabsContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.text,
    },
    listContent: {
      paddingBottom: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
      marginTop: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const {
    getWorkouts,
    isWorkoutCompleted,
    isWorkoutFullyCompleted,
    isWorkoutMissed,
    repeatWorkout,
  } = useWorkoutStore();
  const completedWorkouts = useWorkoutStore(s => s.completedWorkouts);
  const workoutsRaw = useWorkoutStore(s => s.workouts);
  const scheduledWorkoutDates = useWorkoutStore(s => s.scheduledWorkoutDates);

  useFocusEffect(
    useCallback(() => {
      useWorkoutStore.getState().syncPastDueWorkouts();
    }, []),
  );
  const { isTrainer } = useAuthStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const workouts = useMemo(
    () => useWorkoutStore.getState().getWorkouts(),
    [completedWorkouts, workoutsRaw, scheduledWorkoutDates],
  );

  const filteredWorkouts = workouts.filter((workout) => {
    const isCompleted = isWorkoutCompleted(workout.id);
    if (activeTab === 'active') {
      return !isCompleted;
    }
    return isCompleted;
  });

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <Text style={styles.dateText}>{formatDate(new Date().toISOString())}</Text>
        <View style={styles.header}>
          <Text style={styles.title}>{t('workouts.myWorkoutsTitle')}</Text>
          {isTrainer && (
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/workouts/create')}>
              <Plus size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              {t('workouts.tabUpcoming')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              {t('workouts.tabPast')}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => router.push(`/workouts/${item.id}`)}
              onRepeat={
                activeTab === 'completed'
                  ? () => {
                      repeatWorkout(item.id);
                      router.push(`/workouts/${item.id}`);
                    }
                  : undefined
              }
              isCompleted={activeTab === 'completed'}
              isMissed={activeTab === 'completed' && isWorkoutMissed(item.id)}
              isUnfinished={
                activeTab === 'completed' &&
                !isWorkoutFullyCompleted(item.id) &&
                !isWorkoutMissed(item.id)
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'active' ? t('workouts.noUpcomingYet') : t('workouts.noPastYet')}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
