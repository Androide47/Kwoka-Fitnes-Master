import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter, type Href } from 'expo-router';
import { Plus, Clock, Ban, MapPin, Video, FileText, ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react-native';
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
import { Avatar } from '@/components/Avatar';
import { formatDate, formatTime, getDayName, isSameDay, toLocalYmd } from '@/utils/date-utils';
import { getAppointmentLocationParts, isActiveBooking } from '@/utils/appointment-utils';
import { appointmentToCalendarEvent, addToDeviceCalendar, openAddressInMaps } from '@/utils/add-to-calendar';
import { mockTrainer } from '@/mocks/users';

export default function CalendarTabScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { user, isTrainer } = useAuthStore();
  const calendarAppointments = useCalendarStore(s => s.appointments);
  const calendarBlockedTimes = useCalendarStore(s => s.blockedTimes);
  const { getAppointmentsByDate, getBlockedTimesByDate, isDayFullyBlocked, blockFullDay, unblockFullDay } =
    useCalendarStore();
  const { t } = useLanguageStore();
  const language = useLanguageStore(s => s.language);
  const colors = useAppColors();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => createCalendarScreenStyles(colors), [colors]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability'>('schedule');
  const dayListRef = useRef<FlatList<Date>>(null);
  const dayItemWidth = 60 + theme.spacing.sm;

  useEffect(() => {
    if (user) {
      const dateStr = selectedDate.toISOString();
      const dayAppointments = getAppointmentsByDate(dateStr);
      setAppointments(
        isTrainer
          ? dayAppointments
          : dayAppointments.filter(appointment => appointment.clientId === user.id && isActiveBooking(appointment)),
      );
      setBlockedTimes(getBlockedTimesByDate(dateStr));
    }
  }, [selectedDate, user, isTrainer, calendarAppointments, calendarBlockedTimes, getAppointmentsByDate, getBlockedTimesByDate]);

  const visibleYear = selectedDate.getFullYear();
  const visibleMonth = selectedDate.getMonth();

  const calendarDays = useMemo(() => {
    const dayCount = new Date(visibleYear, visibleMonth + 1, 0).getDate();
    const days: Date[] = [];
    for (let day = 1; day <= dayCount; day++) {
      const date = new Date(visibleYear, visibleMonth, day);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  }, [visibleYear, visibleMonth]);

  const bookedDayKeys = useMemo(() => {
    const keys = new Set<string>();
    calendarAppointments.forEach(appointment => {
      if (!isActiveBooking(appointment)) return;
      if (!isTrainer && user && appointment.clientId !== user.id) return;
      keys.add(toLocalYmd(new Date(appointment.startTime)));
    });
    return keys;
  }, [calendarAppointments, isTrainer, user]);

  useEffect(() => {
    const index = Math.max(0, selectedDate.getDate() - 1);
    const frame = requestAnimationFrame(() => {
      dayListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.35,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [visibleYear, visibleMonth]);

  const shiftMonth = (delta: number) => {
    setSelectedDate(prev => {
      const year = prev.getFullYear();
      const month = prev.getMonth() + delta;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const next = new Date(year, month, Math.min(prev.getDate(), lastDay));
      next.setHours(0, 0, 0, 0);
      return next;
    });
  };

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

  const dayLocale = language === 'es' ? 'es-ES' : 'en-US';

  const renderDayItem = ({ item }: { item: Date }) => {
    const isSelected = isSameDay(selectedDate.toISOString(), item.toISOString());
    const isToday = isSameDay(new Date().toISOString(), item.toISOString());
    const isBlocked = isDayFullyBlocked(item.toISOString());
    const hasSession = bookedDayKeys.has(toLocalYmd(item));

    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.selectedDayItem,
          isBlocked && styles.blockedDayItem,
        ]}
        onPress={() => handleDayPress(item)}
        accessibilityState={{ selected: isSelected }}
        accessibilityHint={hasSession ? t('calendar.dayHasSession') : undefined}
      >
        <Text
          style={[
            styles.dayName,
            isSelected && styles.selectedDayText,
            isBlocked && styles.blockedDayText,
          ]}
        >
          {item.toLocaleDateString(dayLocale, { weekday: 'short' })}
        </Text>
        <Text
          style={[
            styles.dayNumber,
            isToday && !isSelected && styles.todayText,
            isSelected && styles.selectedDayText,
            isBlocked && !isSelected && styles.blockedDayText,
          ]}
        >
          {item.getDate()}
        </Text>
        <View
          style={[
            styles.sessionDot,
            hasSession && styles.sessionDotVisible,
            hasSession && isSelected && styles.sessionDotSelected,
          ]}
        />
      </TouchableOpacity>
    );
  };

  const handleAddPress = () => {
    if (isTrainer) {
      router.push('/calendar/create');
      return;
    }
    if (appointments.length > 0) return;
    router.push(
      `/calendar/book?date=${encodeURIComponent(selectedDate.toISOString())}` as Href,
    );
  };

  const showAddButton = Boolean(user) && (isTrainer || appointments.length === 0);

  const addButton = showAddButton ? (
    <TouchableOpacity
      style={styles.addButton}
      onPress={handleAddPress}
      accessibilityRole="button"
      accessibilityLabel={isTrainer ? t('calendar.createAppointment') : t('calendar.bookSession')}
    >
      <Plus size={24} color={colors.text} />
    </TouchableOpacity>
  ) : null;

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderClientBooking = (appointment: Appointment) => {
    const locationParts = getAppointmentLocationParts(appointment.location, t);
    const statusColor = getStatusColor(appointment.status);
    const trainerName =
      appointment.trainerId === mockTrainer.id ? mockTrainer.name : t('calendar.yourTrainer');
    const mapAddress = locationParts.address;

    return (
      <Card style={styles.bookingDetailCard}>
        <View style={styles.bookingDetailHeader}>
          <Text style={styles.bookingDetailTitle}>{appointment.title}</Text>
          <View style={[styles.bookingStatusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.bookingStatusText}>{t(`calendar.${appointment.status}`)}</Text>
          </View>
        </View>

        <View style={styles.bookingDetailBody}>
          <View style={styles.bookingDetailRow}>
            <Avatar source={mockTrainer.avatar} name={trainerName} size={40} />
            <View style={styles.bookingDetailCopy}>
              <Text style={styles.bookingDetailLabel}>{t('calendar.sessionWith')}</Text>
              <Text style={styles.bookingDetailValue}>{trainerName}</Text>
            </View>
          </View>

          <View style={styles.bookingDetailRow}>
            <Clock size={20} color={colors.primary} />
            <View style={styles.bookingDetailCopy}>
              <Text style={styles.bookingDetailLabel}>{t('calendar.sessionDate')}</Text>
              <Text style={styles.bookingDetailValue}>
                {formatDate(appointment.startTime)} • {formatTime(appointment.startTime)} -{' '}
                {formatTime(appointment.endTime)}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDetailRow}>
            {locationParts.isRemote ? (
              <Video size={20} color={colors.primary} />
            ) : (
              <MapPin size={20} color={colors.primary} />
            )}
            <View style={styles.bookingDetailCopy}>
              <Text style={styles.bookingDetailLabel}>{t('calendar.sessionType')}</Text>
              <Text style={styles.bookingDetailValue}>{locationParts.sessionType}</Text>
              {locationParts.address ? (
                <Text style={styles.bookingDetailHint}>{locationParts.address}</Text>
              ) : locationParts.isRemote ? (
                <Text style={styles.bookingDetailHint}>{t('calendar.remoteLinkLegend')}</Text>
              ) : null}
            </View>
          </View>

          {appointment.description ? (
            <View style={styles.bookingDetailRow}>
              <FileText size={20} color={colors.primary} />
              <View style={styles.bookingDetailCopy}>
                <Text style={styles.bookingDetailLabel}>{t('calendar.description')}</Text>
                <Text style={styles.bookingDetailValue}>{appointment.description}</Text>
              </View>
            </View>
          ) : null}

          {appointment.notes ? (
            <View style={styles.bookingDetailRow}>
              <FileText size={20} color={colors.primary} />
              <View style={styles.bookingDetailCopy}>
                <Text style={styles.bookingDetailLabel}>{t('calendar.notesOptional')}</Text>
                <Text style={styles.bookingDetailValue}>{appointment.notes}</Text>
              </View>
            </View>
          ) : null}

          {appointment.status !== 'cancelled' ? (
            <View style={styles.calendarActions}>
              <Button
                title={t('calendar.addToCalendar')}
                onPress={() => void addToDeviceCalendar(appointmentToCalendarEvent(appointment, t))}
                variant="outline"
                icon={<CalendarPlus size={18} color={colors.primary} />}
              />
              {mapAddress ? (
                <Button
                  title={t('calendar.openInMaps')}
                  onPress={() => void openAddressInMaps(mapAddress)}
                  variant="outline"
                  icon={<MapPin size={18} color={colors.primary} />}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </Card>
    );
  };

  const renderScheduleTab = () => {
    if (!isTrainer) {
      const booking = appointments[0];
      if (booking) {
        return (
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight + theme.spacing.md }}
            showsVerticalScrollIndicator={false}
          >
            {renderClientBooking(booking)}
          </ScrollView>
        );
      }

      return (
        <View style={[styles.emptyBookingWrap, { paddingBottom: tabBarHeight + theme.spacing.md }]}>
          <Text style={styles.emptyText}>{t('calendar.noSessionThisDay')}</Text>
          {addButton}
        </View>
      );
    }

    return (
    <View style={styles.tabContent}>
      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              showClientName={isTrainer}
              onPress={() => router.push(`/calendar/${item.id}` as Href)}
            />
          )}
          ListFooterComponent={addButton}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + theme.spacing.xl }}
        />
      ) : (
        <View>
          <Card>
            <Text style={styles.emptyText}>{t('calendar.noEvents')}</Text>
          </Card>
          {addButton}
        </View>
      )}
    </View>
    );
  };

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
        <Text style={styles.blockedTimesTitle}>{t('calendar.blockedTimesSection')}</Text>

        {blockedTimes.filter(time => !time.isFullDay).length > 0 ? (
          blockedTimes
            .filter(time => !time.isFullDay)
            .map(time => (
              <View key={time.id} style={styles.blockedTimeItem}>
                <View style={styles.blockedTimeInfo}>
                  <Text style={styles.blockedTimeHours}>
                    {new Date(time.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(time.endTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {time.reason && <Text style={styles.blockedTimeReason}>{time.reason}</Text>}
                </View>

                <TouchableOpacity style={styles.unblockButton} onPress={() => {}}>
                  <Ban size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
        ) : (
          <Text style={styles.emptyText}>{t('calendar.noBlockedSlots')}</Text>
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
    <SafeAreaView style={globalStyles.container} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('nav.calendar')}</Text>

        <View style={styles.calendarContainer}>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => shiftMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel={t('calendar.previousMonth')}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {selectedDate.toLocaleDateString(dayLocale, { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => shiftMonth(1)}
              accessibilityRole="button"
              accessibilityLabel={t('calendar.nextMonth')}
            >
              <ChevronRight size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            ref={dayListRef}
            data={calendarDays}
            extraData={`${toLocalYmd(selectedDate)}:${[...bookedDayKeys].join(',')}`}
            keyExtractor={item => `${item.getFullYear()}-${item.getMonth()}-${item.getDate()}`}
            renderItem={renderDayItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarList}
            getItemLayout={(_, index) => ({
              length: dayItemWidth,
              offset: dayItemWidth * index,
              index,
            })}
            onScrollToIndexFailed={({ index }) => {
              dayListRef.current?.scrollToOffset({
                offset: dayItemWidth * index,
                animated: true,
              });
            }}
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
