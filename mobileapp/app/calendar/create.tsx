import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Video } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { AddressSelect } from '@/components/AddressSelect';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { formatDate } from '@/utils/date-utils';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    formContainer: {
      gap: theme.spacing.md,
    },
    inputGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    clientList: {
      marginBottom: theme.spacing.sm,
    },
    clientItem: {
      alignItems: 'center',
      marginRight: theme.spacing.md,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      width: 80,
    },
    selectedClientItem: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    clientName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    selectedClientName: {
      color: colors.text,
    },
    dateNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateNavBtn: {
      padding: theme.spacing.sm,
    },
    dateText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    slotList: {
      marginBottom: theme.spacing.sm,
    },
    slotItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    selectedSlotItem: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    slotText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    selectedSlotText: {
      color: colors.text,
    },
    noSlotsText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      gap: 6,
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
    remoteLegend: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: theme.spacing.sm,
      lineHeight: 20,
      textAlign: 'center',
      alignSelf: 'center',
      width: '100%',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
    },
  });
}

function parseDateParam(raw: string | string[] | undefined): Date | null {
  if (raw === undefined) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const d = new Date(decodeURIComponent(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function clampBookingDate(date: Date, min: Date, max: Date): Date {
  const t = date.getTime();
  if (t < min.getTime()) return new Date(min);
  if (t > max.getTime()) return new Date(max);
  return date;
}

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clientId?: string; date?: string }>();
  const { user, clients, isTrainer } = useAuthStore();
  const { addAppointment, getAvailableSlots } = useCalendarStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { minDate, maxDate } = useMemo(() => {
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    const max = new Date(min);
    max.setFullYear(max.getFullYear() + 1);
    return { minDate: min, maxDate: max };
  }, []);

  const prefClientId =
    typeof params.clientId === 'string' && params.clientId.length > 0
      ? params.clientId
      : clients[0]?.id || '';

  const [bookingDate, setBookingDate] = useState(() => {
    const fromParam = parseDateParam(params.date);
    const base = fromParam ?? new Date();
    base.setHours(0, 0, 0, 0);
    return clampBookingDate(base, minDate, maxDate);
  });
  const [selectedClient, setSelectedClient] = useState(prefClientId);
  const [title, setTitle] = useState('');
  const [sessionType, setSessionType] = useState<'presencial' | 'remote'>('presencial');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    if (
      typeof params.clientId === 'string' &&
      params.clientId.length > 0 &&
      clients.some(c => c.id === params.clientId)
    ) {
      setSelectedClient(params.clientId);
    }
  }, [params.clientId, clients]);

  useEffect(() => {
    if (!isTrainer) {
      router.replace('/(tabs)/calendar');
    }
  }, [isTrainer, router]);

  useEffect(() => {
    const fromParam = parseDateParam(params.date);
    if (fromParam) {
      const normalized = new Date(fromParam);
      normalized.setHours(0, 0, 0, 0);
      setBookingDate(clampBookingDate(normalized, minDate, maxDate));
    }
  }, [params.date, minDate, maxDate]);

  useEffect(() => {
    const slots = getAvailableSlots(bookingDate.toISOString(), 60);
    setAvailableSlots(slots);
    setSelectedSlot(null);
  }, [bookingDate, getAvailableSlots]);

  const shiftDay = (delta: number) => {
    setBookingDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      next.setHours(0, 0, 0, 0);
      return clampBookingDate(next, minDate, maxDate);
    });
  };

  const formatTimeSlot = (slot: { start: string; end: string }) => {
    const startTime = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  const handleCreateAppointment = () => {
    if (!user || !selectedClient || !selectedSlot) return;

    addAppointment({
      trainerId: user.id,
      clientId: selectedClient,
      title: title.trim() || t('calendar.bookSessionDefaultTitle'),
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      status: 'scheduled',
      location: sessionType === 'remote' ? 'remote' : location.trim() || 'presencial',
      notes: notes.trim() || undefined,
    });

    router.back();
  };

  if (!isTrainer) {
    return null;
  }

  const canGoBack = bookingDate.getTime() > minDate.getTime();
  const canGoForward = bookingDate.getTime() < maxDate.getTime();
  const scrollBottomPad = theme.spacing.xxl + insets.bottom + theme.spacing.md;

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: theme.spacing.md,
            flexGrow: 1,
            paddingBottom: scrollBottomPad,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('calendar.fieldClient')}</Text>
              {clients.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientList}>
                  {clients.map(client => (
                    <TouchableOpacity
                      key={client.id}
                      style={[styles.clientItem, selectedClient === client.id && styles.selectedClientItem]}
                      onPress={() => setSelectedClient(client.id)}
                    >
                      <Avatar source={client.avatar} name={client.name} size={40} />
                      <Text
                        style={[styles.clientName, selectedClient === client.id && styles.selectedClientName]}
                      >
                        {client.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noSlotsText}>{t('profile.noClients')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('calendar.sessionDate')}</Text>
              <View style={styles.dateNav}>
                <TouchableOpacity
                  style={styles.dateNavBtn}
                  onPress={() => shiftDay(-1)}
                  disabled={!canGoBack}
                  accessibilityRole="button"
                  accessibilityLabel={t('calendar.previousDay')}
                >
                  <ChevronLeft size={24} color={canGoBack ? colors.text : colors.inactive} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Calendar size={20} color={colors.primary} />
                  <Text style={styles.dateText}>{formatDate(bookingDate.toISOString())}</Text>
                </View>
                <TouchableOpacity
                  style={styles.dateNavBtn}
                  onPress={() => shiftDay(1)}
                  disabled={!canGoForward}
                  accessibilityRole="button"
                  accessibilityLabel={t('calendar.nextDay')}
                >
                  <ChevronRight size={24} color={canGoForward ? colors.text : colors.inactive} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('calendar.availableTimeSlots')}</Text>
              {availableSlots.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotList}>
                  {availableSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={`${slot.start}-${index}`}
                      style={[
                        styles.slotItem,
                        selectedSlot && selectedSlot.start === slot.start && styles.selectedSlotItem,
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Clock
                        size={16}
                        color={
                          selectedSlot && selectedSlot.start === slot.start
                            ? colors.text
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.slotText,
                          selectedSlot && selectedSlot.start === slot.start && styles.selectedSlotText,
                        ]}
                      >
                        {formatTimeSlot(slot)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noSlotsText}>{t('calendar.noSlotsThisDay')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('calendar.sessionTitleOptional')}</Text>
              <Input
                placeholder={t('calendar.bookSessionDefaultTitle')}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('calendar.sessionType')}</Text>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, sessionType === 'presencial' && styles.activeTab]}
                  onPress={() => setSessionType('presencial')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: sessionType === 'presencial' }}
                >
                  <MapPin
                    size={16}
                    color={sessionType === 'presencial' ? colors.text : colors.textSecondary}
                  />
                  <Text style={[styles.tabText, sessionType === 'presencial' && styles.activeTabText]}>
                    {t('calendar.sessionPresencial')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, sessionType === 'remote' && styles.activeTab]}
                  onPress={() => setSessionType('remote')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: sessionType === 'remote' }}
                >
                  <Video
                    size={16}
                    color={sessionType === 'remote' ? colors.text : colors.textSecondary}
                  />
                  <Text style={[styles.tabText, sessionType === 'remote' && styles.activeTabText]}>
                    {t('calendar.sessionRemote')}
                  </Text>
                </TouchableOpacity>
              </View>
              {sessionType === 'presencial' ? (
                <AddressSelect value={location} onChange={setLocation} />
              ) : (
                <Text style={styles.remoteLegend}>{t('calendar.remoteLinkLegendTrainer')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('calendar.notesOptional')}</Text>
              <Input
                placeholder={t('calendar.notesPlaceholderTrainer')}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button title={t('common.cancel')} onPress={() => router.back()} variant="outline" style={styles.button} />
              <Button
                title={t('calendar.createAppointmentTitle')}
                onPress={handleCreateAppointment}
                style={styles.button}
                disabled={!selectedClient || !selectedSlot}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
