import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Calendar, Dumbbell, MessageCircle, Camera, BarChart, User, Megaphone, Award, CheckCircle, Info } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useGlobalStyles, useTypography } from '@/hooks/use-themed-styles';
import { createHomeScreenStyles } from '@/utils/home-screen-styles';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useStreakStore } from '@/store/streak-store';
import { useLanguageStore } from '@/store/language-store';
import { Card } from '@/components/Card';
import { WorkoutCard } from '@/components/WorkoutCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { StreakCounter } from '@/components/StreakCounter';
import { formatDate } from '@/utils/date-utils';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollContentBottomPad = insets.bottom + theme.spacing.xl + theme.spacing.md;
  const { user, isTrainer, clients } = useAuthStore();
  const {
    getWorkouts,
    getWorkoutCompletionCount,
    getRecentCompletedWorkouts,
    repeatWorkout,
    isWorkoutCompleted,
  } = useWorkoutStore();
  const { getUserAppointments } = useCalendarStore();
  const { checkIn, hasCheckedInToday } = useStreakStore();
  const { t } = useLanguageStore();
  const colors = useAppColors();
  const globalStyles = useGlobalStyles();
  const typography = useTypography();
  const styles = useMemo(() => createHomeScreenStyles(colors), [colors]);

  const [showWelcome, setShowWelcome] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  const workouts = getWorkouts().slice(0, 2);
  const appointments = user ? getUserAppointments(user.id).slice(0, 2) : [];
  const completedWorkoutsCount = getWorkoutCompletionCount();
  const recentCompletedWorkouts = getRecentCompletedWorkouts(3);
  
  useEffect(() => {
    // Auto check-in when opening the app
    if (user && !isTrainer && !hasCheckedInToday(user.id)) {
      checkIn(user.id);
    }
    
    // Show welcome message for new users
    if (user && user.isNew) {
      setShowWelcome(true);
      
      // Animate welcome card
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
      // Hide welcome message after 5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowWelcome(false);
        });
      }, 5000);
    }
  }, [user, isTrainer]);
  
  const renderWelcomeCard = () => (
    <Animated.View style={[styles.welcomeCard, { opacity: fadeAnim }]}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>{t('home.welcomeTitle')}</Text>
        <Text style={styles.welcomeText}>{t('home.welcomeMessage')}</Text>
        
        <View style={styles.welcomeTips}>
          <View style={styles.welcomeTip}>
            <CheckCircle size={20} color={colors.success} style={styles.welcomeTipIcon} />
            <Text style={styles.welcomeTipText}>{t('home.welcomeTip1')}</Text>
          </View>
          
          <View style={styles.welcomeTip}>
            <CheckCircle size={20} color={colors.success} style={styles.welcomeTipIcon} />
            <Text style={styles.welcomeTipText}>{t('home.welcomeTip2')}</Text>
          </View>
          
          <View style={styles.welcomeTip}>
            <CheckCircle size={20} color={colors.success} style={styles.welcomeTipIcon} />
            <Text style={styles.welcomeTipText}>{t('home.welcomeTip3')}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.welcomeButton}
          onPress={() => {
            setShowWelcome(false);
            router.push('/workouts');
          }}
        >
          <Text style={styles.welcomeButtonText}>{t('home.getStarted')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  
  const renderClientDashboard = () => {
    const clientUser = user as any;
    const today = new Date();
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const currentDay = today.getDay();
    
    // Mock data for weekly activity - in a real app this would come from the store
    // 1 = workout done, 0 = no workout
    const weeklyActivity = [1, 0, 1, 1, 0, 0, 0]; 
    
    // Get today's workout
    const todaysWorkout = workouts.find((w) => !isWorkoutCompleted(w.id));

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: scrollContentBottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.hello')}, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
          </View>
          <StreakCounter count={clientUser?.streakCount || 0} />
        </View>
        
        {/* 7-Day Streak View */}
        <View style={styles.weekContainer}>
          {days.map((day, index) => {
            const isToday = index === currentDay;
            const hasWorkout = weeklyActivity[index] === 1;
            
            return (
              <View key={index} style={styles.dayColumn}>
                <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
                <View style={[
                  styles.dayCircle, 
                  hasWorkout && styles.dayCircleActive,
                  isToday && !hasWorkout && styles.dayCircleToday
                ]}>
                  {hasWorkout && <CheckCircle size={12} color="#fff" />}
                  {isToday && !hasWorkout && <Text style={styles.todayIndicator}>•</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>{t('home.upcomingAppointments')}</Text>
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onPress={() => router.push(`/calendar/${appointment.id}` as Href)}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>{t('home.noAppointments')}</Text>
          </Card>
        )}
        
        {/* Today's Workout */}
        {todaysWorkout && (
           <View style={styles.todayWorkoutContainer}>
             <Text style={styles.sectionTitle}>Today's Workout</Text>
             <WorkoutCard
                workout={todaysWorkout}
                onPress={() => router.push(`/workouts/${todaysWorkout.id}`)}
              />
           </View>
        )}
        
        {completedWorkoutsCount > 0 && (
          <Card style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Award size={24} color={colors.primary} />
              <Text style={styles.achievementTitle}>{t('home.achievements')}</Text>
            </View>
            
            <View style={styles.achievementContent}>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementValue}>{completedWorkoutsCount}</Text>
                <Text style={styles.achievementLabel}>{t('home.workoutsCompleted')}</Text>
              </View>
              
              <View style={styles.achievementItem}>
                <Text style={styles.achievementValue}>{clientUser?.streakCount || 0}</Text>
                <Text style={styles.achievementLabel}>{t('home.currentStreak')}</Text>
              </View>
            </View>
          </Card>
        )}
        
        {recentCompletedWorkouts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('home.recentCompletions')}</Text>
            {recentCompletedWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onPress={() => router.push(`/workouts/${workout.id}`)}
                onRepeat={() => { repeatWorkout(workout.id); router.push(`/workouts/${workout.id}`); }}
                isCompleted={true}
              />
            ))}
          </>
        )}
        
        <Text style={styles.sectionTitle}>{t('home.upcomingWorkouts')}</Text>
        {workouts.length > 0 ? (
          <View style={styles.upcomingList}>
            {workouts.slice(0, 3).map((workout, index) => {
               // Fake future dates for demo
               const date = new Date();
               date.setDate(date.getDate() + index + 1);
               const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
               const dayNum = date.getDate();

               return (
                <TouchableOpacity 
                  key={workout.id} 
                  style={styles.upcomingItem}
                  onPress={() => router.push(`/workouts/${workout.id}`)}
                >
                  <View style={styles.upcomingDate}>
                    <Text style={styles.upcomingDayName}>{dayName}</Text>
                    <Text style={styles.upcomingDayNum}>{dayNum}</Text>
                  </View>
                  <View style={styles.upcomingContent}>
                    <Text style={styles.upcomingTitle}>{workout.name}</Text>
                    <Text style={styles.upcomingSubtitle}>{workout.duration} min • {workout.difficulty}</Text>
                  </View>
                  <Dumbbell size={20} color={colors.primary} />
                </TouchableOpacity>
               );
            })}
          </View>
        ) : (
          <Card>
            <Text style={styles.emptyText}>{t('home.noWorkouts')}</Text>
          </Card>
        )}
        
        {user?.isNew && (
          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Info size={24} color={colors.primary} />
              <Text style={styles.tipsTitle}>{t('home.tipsTitle')}</Text>
            </View>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{t('home.tip1')}</Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{t('home.tip2')}</Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{t('home.tip3')}</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    );
  };
  
  const renderTrainerDashboard = () => {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: scrollContentBottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.hello')}, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
          </View>
        </View>
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t('home.dashboard')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{clients.length}</Text>
              <Text style={styles.statLabel}>{t('nav.clients')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{appointments.length}</Text>
              <Text style={styles.statLabel}>{t('calendar.appointment')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workouts.length}</Text>
              <Text style={styles.statLabel}>{t('nav.workouts')}</Text>
            </View>
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>{t('home.upcomingAppointments')}</Text>
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              showClientName
              onPress={() => router.push(`/calendar/${appointment.id}` as Href)}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>{t('home.noAppointments')}</Text>
          </Card>
        )}
      </ScrollView>
    );
  };
  
  if (!user) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={globalStyles.center}>
          <Text style={typography.h2}>Please log in</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={globalStyles.container}>
      {isTrainer ? renderTrainerDashboard() : renderClientDashboard()}
      {showWelcome && renderWelcomeCard()}
    </SafeAreaView>
  );
}
