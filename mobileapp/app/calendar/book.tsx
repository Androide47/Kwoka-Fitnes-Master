import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useLanguageStore } from '@/store/language-store';
import { mockTrainer } from '@/mocks/users';
import type { Client } from '@/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { formatDate } from '@/utils/date-utils';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.lg,
    },
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
    trainerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    trainerMeta: {
      flex: 1,
    },
    trainerName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    trainerHint: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
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

export default function BookSessionScreen() {
  const router = useRouter();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const { user, isTrainer } = useAuthStore();
  const { addAppointment, getAvailableSlots } = useCalendarStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const client = user?.role === 'client' ? (user as Client) : null;

  const { minDate, maxDate } = useMemo(() => {
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    const max = new Date(min);
    max.setDate(max.getDate() + 13);
    return { minDate: min, maxDate: max };
  }, []);

  const [bookingDate, setBookingDate] = useState(() => {
    const fromParam = parseDateParam(dateParam);
    const base = fromParam ?? new Date();
    base.setHours(0, 0, 0, 0);
    return clampBookingDate(base, minDate, maxDate);
  });

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    if (isTrainer || !client) {
      router.replace('/calendar');
    }
  }, [isTrainer, client, router]);

  useEffect(() => {
    const fromParam = parseDateParam(dateParam);
    if (fromParam) {
      const normalized = new Date(fromParam);
      normalized.setHours(0, 0, 0, 0);
      setBookingDate(clampBookingDate(normalized, minDate, maxDate));
    }
  }, [dateParam, minDate, maxDate]);

  useEffect(() => {
    const slots = getAvailableSlots(bookingDate.toISOString(), 60);
    setAvailableSlots(slots);
    setSelectedSlot(null);
  }, [bookingDate, getAvailableSlots]);

  const trainerName =
    client && client.trainerId === mockTrainer.id ? mockTrainer.name : t('calendar.yourTrainer');

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

  const handleBook = () => {
    if (!client?.trainerId || !selectedSlot) return;

    addAppointment({
      trainerId: client.trainerId,
      clientId: client.id,
      title: title.trim() || t('calendar.bookSessionDefaultTitle'),
      description: undefined,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      status: 'scheduled',
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    router.back();
  };

  if (!client || isTrainer) {
    return null;
  }

  if (!client.trainerId) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.container}>
          <Text style={styles.noSlotsText}>{t('calendar.noTrainerAssigned')}</Text>
          <Button title={t('common.cancel')} onPress={() => router.back()} variant="outline" style={{ marginTop: theme.spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const canGoBack = bookingDate.getTime() > minDate.getTime();
  const canGoForward = bookingDate.getTime() < maxDate.getTime();

  const scrollBottomPad = theme.spacing.xxl + insets.bottom + theme.spacing.md;

  return (
    <SafeAreaView style={globalStyles.container} edges={['top', 'left', 'right']}>
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
            <Text style={styles.label}>{t('calendar.sessionWith')}</Text>
            <View style={styles.trainerRow}>
              <Avatar source={mockTrainer.avatar} name={trainerName} size={48} />
              <View style={styles.trainerMeta}>
                <Text style={styles.trainerName}>{trainerName}</Text>
                <Text style={styles.trainerHint}>{t('calendar.bookSessionTrainerHint')}</Text>
              </View>
            </View>
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
                        selectedSlot && selectedSlot.start === slot.start ? colors.text : colors.textSecondary
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
            <Text style={styles.label}>{t('calendar.locationOptional')}</Text>
            <Input
              placeholder={t('calendar.locationPlaceholder')}
              value={location}
              onChangeText={setLocation}
              leftIcon={<MapPin size={20} color={colors.textSecondary} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('calendar.notesOptional')}</Text>
            <Input
              placeholder={t('calendar.notesPlaceholder')}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button title={t('common.cancel')} onPress={() => router.back()} variant="outline" style={styles.button} />
            <Button
              title={t('calendar.confirmBookSession')}
              onPress={handleBook}
              style={styles.button}
              disabled={!selectedSlot}
            />
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
