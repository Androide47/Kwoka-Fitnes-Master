import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { LogOut, Settings, Calendar, BarChart, Camera, FileText } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { createProfileScreenStyles } from '@/utils/profile-screen-styles';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useProgressStore } from '@/store/progress-store';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ClientCard } from '@/components/ClientCard';
import { StreakCounter } from '@/components/StreakCounter';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isTrainer, clients, logout } = useAuthStore();
  const { getLatestMeasurements } = useProgressStore();
  const { t } = useLanguageStore();
  const colors = useAppColors();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => createProfileScreenStyles(colors), [colors]);

  if (!user) return null;
  
  const renderClientProfile = () => {
    const clientUser = user as any;
    const latestMeasurements = getLatestMeasurements(user.id);
    
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar source={user.avatar} name={user.name} size={80} />
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.streakContainer}>
              <Text style={styles.streakLabel}>{t('profile.currentStreakColon')}</Text>
              <StreakCounter count={clientUser?.streakCount || 0} size="small" />
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <Button
            title={t('profile.myCalendar')}
            onPress={() => router.push('/calendar')}
            icon={<Calendar size={20} color={colors.text} />}
            style={styles.calendarButton}
          />
        </View>
        
        {latestMeasurements && (
          <Card style={styles.measurementsCard}>
            <Text style={styles.cardTitle}>{t('profile.latestMeasurementsCard')}</Text>
            <View style={styles.measurementsGrid}>
              {latestMeasurements.weight ? (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{t('progress.weight')}</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurements.weight} {t('common.unitLbs')}
                  </Text>
                </View>
              ) : null}
              
              {latestMeasurements.bodyFat && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{t('progress.bodyFat')}</Text>
                  <Text style={styles.measurementValue}>{latestMeasurements.bodyFat}%</Text>
                </View>
              )}
              
              {latestMeasurements.chest ? (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{t('progress.chest')}</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurements.chest} {t('common.unitIn')}
                  </Text>
                </View>
              ) : null}
              
              {latestMeasurements.waist ? (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{t('progress.waist')}</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurements.waist} {t('common.unitIn')}
                  </Text>
                </View>
              ) : null}
              
              {latestMeasurements.hips ? (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{t('progress.hips')}</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurements.hips} {t('common.unitIn')}
                  </Text>
                </View>
              ) : null}
              
              {latestMeasurements.arms ? (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{t('progress.arms')}</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurements.arms} {t('common.unitIn')}
                  </Text>
                </View>
              ) : null}
              
              {latestMeasurements.thighs ? (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{t('progress.thighs')}</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurements.thighs} {t('common.unitIn')}
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>
        )}
        
        <Card style={styles.goalsCard}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>{t('profile.myGoals')}</Text>
             <TouchableOpacity onPress={() => router.push('/settings/goals')}>
               <Text style={styles.editButtonText}>{t('profile.edit')}</Text>
             </TouchableOpacity>
          </View>
          {clientUser?.goals && clientUser.goals.length > 0 ? (
            <View style={styles.goalsList}>
              {clientUser.goals.map((goal: string, index: number) => (
                <View key={index} style={styles.goalItem}>
                  <View style={styles.goalBullet} />
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t('profile.noGoals')}</Text>
          )}
        </Card>
        
        <View style={styles.settingsButtons}>
          <Button
            title={t('nav.settings')}
            onPress={() => router.push('/settings')}
            variant="outline"
            icon={<Settings size={20} color={colors.primary} />}
            style={styles.settingsButton}
          />
          
          <Button
            title={t('profile.logout')}
            onPress={logout}
            variant="outline"
            icon={<LogOut size={20} color={colors.error} />}
            style={{ ...styles.settingsButton, ...styles.logoutButton }}
            textStyle={{ color: colors.error }}
          />
        </View>
      </ScrollView>
    );
  };
  
  const renderTrainerProfile = () => {
    return (
      <View style={styles.container}>
        <View style={styles.trainerHeader}>
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerTitle}>{t('profile.myClients')}</Text>
            <Text style={styles.trainerSubtitle}>
              {clients.length} {t('profile.activeClients')}
            </Text>
          </View>
          
          <View style={styles.trainerActions}>
            <TouchableOpacity 
              style={styles.trainerAction}
              onPress={() => router.push('/settings')}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.trainerAction}
              onPress={logout}
            >
              <LogOut size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              onPress={() => router.push(`/clients/${item.id}`)}
              onMessagePress={() => router.push(`/messages/${item.id}`)}
              onSchedulePress={() => router.push(`/calendar/client/${item.id}` as Href)}
              onProgressPress={() => router.push(`/progress/client/${item.id}` as Href)}
            />
          )}
          contentContainerStyle={styles.clientsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('profile.noClients')}</Text>
            </View>
          }
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      {isTrainer ? renderTrainerProfile() : renderClientProfile()}
    </SafeAreaView>
  );
}
