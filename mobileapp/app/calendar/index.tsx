import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Calendar as CalendarIcon, Plus, Clock, Ban } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { createCalendarScreenStyles } from '@/utils/calendar-screen-styles';
import { useAuthStore } from '@/store/auth-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useLanguageStore } from '@/store/language-store';
import { Appointment, BlockedTime } from '@/types';
import { Card } from '@/components/Card';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Button } from '@/components/Button';
import { formatDate, getDayName, isSameDay } from '@/utils/date-utils';

export default function CalendarScreen() {
  const router = useRouter();
  const { user, isTrainer } = useAuthStore();
  const { getAppointmentsByDate, getBlockedTimesByDate, isDayFullyBlocked, blockFullDay, unblockFullDay } = useCalendarStore();
  const { t } = useLanguageStore();
  const colors = useAppColors();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => createCalendarScreenStyles(colors), [colors]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability'>('schedule');
  
  useEffect(() => {
    if (user) {
      const dateStr = selectedDate.toISOString();
      setAppointments(getAppointmentsByDate(dateStr));
      setBlockedTimes(getBlockedTimesByDate(dateStr));
    }
  }, [selectedDate, user]);
  
  const generateCalendarDays = () => {
    const days = [];
    const currentDate = new Date();
    
    // Start from today and generate next 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleBlockDay = () => {
    blockFullDay(selectedDate.toISOString());
    setBlockedTimes(getBlockedTimesByDate(selectedDate.toISOString()));
  };
  
  const handleUnblockDay = () => {
    unblockFullDay(selectedDate.toISOString());
    setBlockedTimes(getBlockedTimesByDate(selectedDate.toISOString()));
  };
  
  const renderDayItem = ({ item }: { item: Date }) => {
    const isSelected = isSameDay(selectedDate.toISOString(), item.toISOString());
    const isToday = isSameDay(new Date().toISOString(), item.toISOString());
    const isBlocked = isDayFullyBlocked(item.toISOString());
    
    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.selectedDayItem,
          isBlocked && styles.blockedDayItem
        ]}
        onPress={() => handleDayPress(item)}
      >
        <Text style={[
          styles.dayName,
          isSelected && styles.selectedDayText,
          isBlocked && styles.blockedDayText
        ]}>
          {item.toLocaleDateString('en-US', { weekday: 'short' })}
        </Text>
        <Text style={[
          styles.dayNumber,
          isSelected && styles.selectedDayText,
          isToday && styles.todayText,
          isBlocked && styles.blockedDayText
        ]}>
          {item.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              showClientName={isTrainer}
              onPress={() => router.push(`/calendar/${item.id}` as Href)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Card>
          <Text style={styles.emptyText}>{t('calendar.noEvents')}</Text>
        </Card>
      )}
      
      {isTrainer && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/calendar/create')}
        >
          <Plus size={24} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
  
  const renderAvailabilityTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.availabilityCard}>
        <Text style={styles.availabilityTitle}>{t('calendar.manageAvailability')}</Text>
        <Text style={styles.availabilityDate}>
          {getDayName(selectedDate.toISOString())}, {formatDate(selectedDate.toISOString())}
        </Text>
        
        <View style={styles.availabilityActions}>
          {isDayFullyBlocked(selectedDate.toISOString()) ? (
            <Button
              title={t('calendar.unblockDay')}
              onPress={handleUnblockDay}
              icon={<Clock size={20} color={colors.text} />}
            />
          ) : (
            <Button
              title={t('calendar.blockDay')}
              onPress={handleBlockDay}
              icon={<Ban size={20} color={colors.text} />}
              variant="outline"
            />
          )}
        </View>
      </Card>
      
      <Card style={styles.blockedTimesCard}>
        <Text style={styles.blockedTimesTitle}>Blocked Times</Text>
        
        {blockedTimes.filter(time => !time.isFullDay).length > 0 ? (
          blockedTimes
            .filter(time => !time.isFullDay)
            .map(time => (
              <View key={time.id} style={styles.blockedTimeItem}>
                <View style={styles.blockedTimeInfo}>
                  <Text style={styles.blockedTimeHours}>
                    {new Date(time.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(time.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {time.reason && (
                    <Text style={styles.blockedTimeReason}>{time.reason}</Text>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.unblockButton}
                  onPress={() => {
                    // Implement unblock specific time
                  }}
                >
                  <Ban size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
        ) : (
          <Text style={styles.emptyText}>No blocked time slots</Text>
        )}
        
        <Button
          title={t('calendar.blockTime')}
          onPress={() => router.push('/calendar/block-time')}
          variant="outline"
          style={styles.blockTimeButton}
        />
      </Card>
    </View>
  );
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('nav.calendar')}</Text>
          <CalendarIcon size={24} color={colors.primary} />
        </View>
        
        <View style={styles.calendarContainer}>
          <FlatList
            data={calendarDays}
            keyExtractor={(item) => item.toISOString()}
            renderItem={renderDayItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarList}
          />
        </View>
        
        {isTrainer && (
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
              onPress={() => setActiveTab('schedule')}
            >
              <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
                {t('calendar.schedule')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'availability' && styles.activeTab]}
              onPress={() => setActiveTab('availability')}
            >
              <Text style={[styles.tabText, activeTab === 'availability' && styles.activeTabText]}>
                {t('calendar.availability')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {getDayName(selectedDate.toISOString())}, {formatDate(selectedDate.toISOString())}
          </Text>
        </View>
        
        {isTrainer && activeTab === 'availability' ? renderAvailabilityTab() : renderScheduleTab()}
      </View>
    </SafeAreaView>
  );
}
