import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { MessageCircle, Calendar, BarChart, Edit, Trash, Plus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useGlobalStyles, useTypography } from '@/hooks/use-themed-styles';
import { createClientDetailStyles } from '@/utils/client-detail-styles';
import { useAuthStore } from '@/store/auth-store';
import { useProgressStore } from '@/store/progress-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useLanguageStore } from '@/store/language-store';
import { Client, ClientAnalytics, ProgressEntry, Appointment } from '@/types';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressCard } from '@/components/ProgressCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { WorkoutCard } from '@/components/WorkoutCard';
import { StreakCounter } from '@/components/StreakCounter';
import { formatDate } from '@/utils/date-utils';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { clients } = useAuthStore();
  const { getEntries, getLatestMeasurements } = useProgressStore();
  const { getWorkouts } = useWorkoutStore();
  const { getUserAppointments } = useCalendarStore();
  const { t } = useLanguageStore();
  const colors = useAppColors();
  const globalStyles = useGlobalStyles();
  const typography = useTypography();
  const styles = useMemo(() => createClientDetailStyles(colors), [colors]);

  const [client, setClient] = useState<Client | null>(null);
  const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null);
  const [recentProgress, setRecentProgress] = useState<ProgressEntry[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'workouts' | 'appointments'>('overview');
  
  useEffect(() => {
    if (id) {
      const foundClient = clients.find(c => c.id === id);
      if (foundClient) {
        setClient(foundClient);
        
        // Get client data
        const progressEntries = getEntries(id);
        const appointments = getUserAppointments(id);
        const workouts = getWorkouts();
        
        // Set recent progress
        setRecentProgress(progressEntries.slice(0, 3));
        
        // Set upcoming appointments
        setUpcomingAppointments(appointments.filter(a => 
          new Date(a.startTime) > new Date() && a.status !== 'cancelled'
        ).slice(0, 3));
        
        // Calculate analytics
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const latestMeasurements = getLatestMeasurements(id);
        const firstMeasurements = progressEntries
          .filter(entry => entry.type === 'measurement')
          .slice(-1)[0]?.measurements;
        
        setAnalytics({
          clientId: id,
          workoutsCompleted: Math.floor(Math.random() * 20), // Mock data
          appointmentsAttended: completedAppointments,
          streakHighest: foundClient.streakCount,
          progressEntries: progressEntries.length,
          lastActive: foundClient.lastCheckIn || new Date().toISOString(),
          weightChange: latestMeasurements && firstMeasurements ? 
            (latestMeasurements.weight || 0) - (firstMeasurements.weight || 0) : 
            undefined,
          bodyFatChange: latestMeasurements && firstMeasurements ? 
            (latestMeasurements.bodyFat || 0) - (firstMeasurements.bodyFat || 0) : 
            undefined,
        });
      }
    }
  }, [id, clients]);
  
  if (!client) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={globalStyles.center}>
          <Text style={typography.h2}>Client not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.analyticsCard}>
        <Text style={styles.cardTitle}>Client Analytics</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics?.workoutsCompleted || 0}</Text>
            <Text style={styles.analyticsLabel}>Workouts</Text>
          </View>
          
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics?.appointmentsAttended || 0}</Text>
            <Text style={styles.analyticsLabel}>Appointments</Text>
          </View>
          
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics?.streakHighest || 0}</Text>
            <Text style={styles.analyticsLabel}>Streak</Text>
          </View>
          
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics?.progressEntries || 0}</Text>
            <Text style={styles.analyticsLabel}>Entries</Text>
          </View>
        </View>
        
        {analytics?.lastActive && (
          <Text style={styles.lastActive}>
            Last active: {formatDate(analytics.lastActive)}
          </Text>
        )}
        
        {(analytics?.weightChange !== undefined || analytics?.bodyFatChange !== undefined) && (
          <View style={styles.progressSummary}>
            <Text style={styles.progressSummaryTitle}>Progress Summary</Text>
            
            {analytics.weightChange !== undefined && (
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Weight Change:</Text>
                <Text style={[
                  styles.progressValue,
                  analytics.weightChange < 0 ? styles.positiveChange : 
                  analytics.weightChange > 0 ? styles.negativeChange : null
                ]}>
                  {analytics.weightChange > 0 ? '+' : ''}{analytics.weightChange} kg
                </Text>
              </View>
            )}
            
            {analytics.bodyFatChange !== undefined && (
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Body Fat Change:</Text>
                <Text style={[
                  styles.progressValue,
                  analytics.bodyFatChange < 0 ? styles.positiveChange : 
                  analytics.bodyFatChange > 0 ? styles.negativeChange : null
                ]}>
                  {analytics.bodyFatChange > 0 ? '+' : ''}{analytics.bodyFatChange}%
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Progress</Text>
        <TouchableOpacity onPress={() => setActiveTab('progress')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {recentProgress.length > 0 ? (
        recentProgress.map(entry => (
          <ProgressCard
            key={entry.id}
            entry={entry}
            onPress={() => router.push(`/progress/${entry.id}` as Href)}
          />
        ))
      ) : (
        <Card>
          <Text style={styles.emptyText}>No progress entries yet</Text>
        </Card>
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <TouchableOpacity onPress={() => setActiveTab('appointments')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {upcomingAppointments.length > 0 ? (
        upcomingAppointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onPress={() => router.push(`/calendar/${appointment.id}` as Href)}
          />
        ))
      ) : (
        <Card>
          <Text style={styles.emptyText}>No upcoming appointments</Text>
        </Card>
      )}
      
      <View style={styles.goalsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Client Goals</Text>
          <TouchableOpacity>
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {client.goals && client.goals.length > 0 ? (
          <Card>
            {client.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View style={styles.goalBullet} />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </Card>
        ) : (
          <Card>
            <Text style={styles.emptyText}>No goals set yet</Text>
            <Button
              title="Add Goals"
              onPress={() => {}}
              variant="outline"
              style={styles.addButton}
              icon={<Plus size={20} color={colors.primary} />}
            />
          </Card>
        )}
      </View>
    </ScrollView>
  );
  
  const renderProgressTab = () => {
    const progressEntries = getEntries(client.id);
    
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tabActions}>
          <Button
            title="Add Measurement"
            onPress={() => router.push(`/progress/measurement?clientId=${client.id}`)}
            variant="outline"
            style={styles.tabPanelButton}
          />
          
          <Button
            title="Add Note"
            onPress={() => router.push(`/progress/note?clientId=${client.id}`)}
            variant="outline"
            style={styles.tabPanelButton}
          />
        </View>
        
        {progressEntries.length > 0 ? (
          progressEntries.map(entry => (
            <ProgressCard
              key={entry.id}
              entry={entry}
              onPress={() => router.push(`/progress/${entry.id}` as Href)}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>No progress entries yet</Text>
          </Card>
        )}
      </ScrollView>
    );
  };
  
  const renderWorkoutsTab = () => {
    const workouts = getWorkouts();
    
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tabActions}>
          <Button
            title="Assign Workout"
            onPress={() => {}}
            variant="outline"
            style={styles.tabPanelButton}
            icon={<Plus size={20} color={colors.primary} />}
          />
        </View>
        
        {workouts.length > 0 ? (
          workouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onPress={() => router.push(`/workouts/${workout.id}`)}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>No workouts assigned yet</Text>
          </Card>
        )}
      </ScrollView>
    );
  };
  
  const renderAppointmentsTab = () => {
    const appointments = getUserAppointments(client.id);
    
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tabActions}>
          <Button
            title="Schedule Appointment"
            onPress={() => router.push(`/calendar/create?clientId=${client.id}`)}
            variant="outline"
            style={styles.tabPanelButton}
            icon={<Plus size={20} color={colors.primary} />}
          />
        </View>
        
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
            <Text style={styles.emptyText}>No appointments scheduled</Text>
          </Card>
        )}
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <Avatar source={client.avatar} name={client.name} size={80} />
            
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{client.name}</Text>
              <Text style={styles.email}>{client.email}</Text>
              <View style={styles.streakContainer}>
                <Text style={styles.streakLabel}>{t('home.streak')}:</Text>
                <StreakCounter count={client.streakCount} size="small" />
              </View>
            </View>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.profileActionIcon}
              onPress={() => router.push(`/messages/${client.id}`)}
            >
              <MessageCircle size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileActionIcon}
              onPress={() => router.push(`/calendar/create?clientId=${client.id}`)}
            >
              <Calendar size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileActionIcon}
              onPress={() => router.push(`/progress?clientId=${client.id}`)}
            >
              <BarChart size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
            onPress={() => setActiveTab('progress')}
          >
            <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
              Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workouts' && styles.activeTab]}
            onPress={() => setActiveTab('workouts')}
          >
            <Text style={[styles.tabText, activeTab === 'workouts' && styles.activeTabText]}>
              Workouts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'appointments' && styles.activeTab]}
            onPress={() => setActiveTab('appointments')}
          >
            <Text style={[styles.tabText, activeTab === 'appointments' && styles.activeTabText]}>
              Appointments
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabContent}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'progress' && renderProgressTab()}
          {activeTab === 'workouts' && renderWorkoutsTab()}
          {activeTab === 'appointments' && renderAppointmentsTab()}
        </View>
      </View>
    </SafeAreaView>
  );
}
