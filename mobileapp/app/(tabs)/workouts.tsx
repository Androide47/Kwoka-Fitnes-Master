import React, { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { ClipboardList, Plus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useWorkoutStore } from '@/store/workout-store';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { WorkoutCard } from '@/components/WorkoutCard';
import { formatDate, ymdToNoonIso } from '@/utils/date-utils';

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
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    assignButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondary,
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
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activeTabText: {
      color: '#fff',
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
    assignmentCard: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.small,
    },
    assignmentTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    assignmentMeta: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const {
    getWorkouts,
    getLibraryWorkouts,
    getRoutineAssignments,
    isWorkoutCompleted,
    isWorkoutFullyCompleted,
    isWorkoutMissed,
    repeatWorkout,
  } = useWorkoutStore();
  const completedWorkouts = useWorkoutStore(s => s.completedWorkouts);
  const workoutsRaw = useWorkoutStore(s => s.workouts);
  const scheduledWorkoutDates = useWorkoutStore(s => s.scheduledWorkoutDates);
  const routineAssignments = useWorkoutStore(s => s.routineAssignments);
  const { isTrainer, clients } = useAuthStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'library' | 'assigned'>(
    isTrainer ? 'library' : 'active',
  );

  useFocusEffect(
    useCallback(() => {
      useWorkoutStore.getState().syncPastDueWorkouts();
    }, []),
  );

  const workouts = useMemo(
    () => {
      const all = getWorkouts();
      if (isTrainer) return all;
      const uid = useAuthStore.getState().user?.id;
      return all.filter(w => !w.clientId || w.clientId === uid);
    },
    [completedWorkouts, workoutsRaw, scheduledWorkoutDates, getWorkouts, isTrainer],
  );

  const library = useMemo(
    () => getLibraryWorkouts(),
    [workoutsRaw, scheduledWorkoutDates, getLibraryWorkouts],
  );

  const assignments = useMemo(
    () => getRoutineAssignments(),
    [routineAssignments, getRoutineAssignments],
  );

  const filteredWorkouts = workouts.filter((workout) => {
    if (isTrainer) return false;
    const isCompleted = isWorkoutCompleted(workout.id);
    if (activeTab === 'active') return !isCompleted;
    if (activeTab === 'completed') return isCompleted;
    return false;
  });

  const clientName = (clientId: string) =>
    clients.find(c => c.id === clientId)?.name ?? t('coach.unknownClient');

  if (isTrainer) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.container}>
          <Text style={styles.dateText}>{formatDate(new Date().toISOString())}</Text>
          <View style={styles.header}>
            <Text style={styles.title}>{t('coach.routinesTitle')}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.assignButton}
                onPress={() => router.push('/workouts/assign' as Href)}
              >
                <ClipboardList size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/workouts/create')}
              >
                <Plus size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'library' && styles.activeTab]}
              onPress={() => setActiveTab('library')}
            >
              <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>
                {t('coach.tabLibrary')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
              onPress={() => setActiveTab('assigned')}
            >
              <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
                {t('coach.tabAssigned')}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'library' ? (
            <FlatList
              data={library}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WorkoutCard
                  workout={item}
                  onPress={() => router.push(`/workouts/${item.id}`)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t('coach.emptyLibrary')}</Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={assignments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.assignmentCard}
                  onPress={() => router.push(`/workouts/${item.workoutId}`)}
                >
                  <Text style={styles.assignmentTitle}>{item.name}</Text>
                  <Text style={styles.assignmentMeta}>
                    {clientName(item.clientId)} · {formatDate(ymdToNoonIso(item.date))}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t('coach.noAssignmentsYet')}</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <Text style={styles.dateText}>{formatDate(new Date().toISOString())}</Text>
        <View style={styles.header}>
          <Text style={styles.title}>{t('workouts.myWorkoutsTitle')}</Text>
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
