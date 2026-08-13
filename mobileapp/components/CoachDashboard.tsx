import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
  CalendarPlus,
  ClipboardList,
  Dumbbell,
  Library,
  MessageCircle,
  Calendar,
  Lock,
  ChevronRight,
  Layers,
  Activity,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { createCoachHomeStyles } from '@/utils/coach-home-styles';
import { useAuthStore } from '@/store/auth-store';
import { useMessageStore } from '@/store/message-store';
import { useProgressStore } from '@/store/progress-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Avatar } from '@/components/Avatar';
import { formatDate } from '@/utils/date-utils';

type CoachDashboardProps = {
  bottomPad: number;
};

type MediaItem = {
  id: string;
  uri: string;
  clientId: string;
  clientName: string;
  date: string;
};

export function CoachDashboard({ bottomPad }: CoachDashboardProps) {
  const router = useRouter();
  const { user, clients } = useAuthStore();
  const messages = useMessageStore(s => s.messages);
  const getUnreadCount = useMessageStore(s => s.getUnreadCount);
  const entries = useProgressStore(s => s.entries);
  const { getUserAppointments } = useCalendarStore();
  const libraryWorkouts = useWorkoutStore(s => s.workouts);
  const routines = useWorkoutStore(s => s.routines);
  const assignments = useWorkoutStore(s => s.routineAssignments);
  const { t } = useLanguageStore();
  const colors = useAppColors();
  const styles = useMemo(() => createCoachHomeStyles(colors), [colors]);

  const unreadTotal = user ? getUnreadCount(user.id) : 0;

  const unreadThreads = useMemo(() => {
    if (!user) return [];
    const byClient = new Map<string, { preview: string; count: number; at: string }>();
    messages
      .filter(m => m.receiverId === user.id && !m.read)
      .forEach(m => {
        const prev = byClient.get(m.senderId);
        if (!prev || new Date(m.timestamp) > new Date(prev.at)) {
          byClient.set(m.senderId, {
            preview: m.content,
            count: (prev?.count ?? 0) + 1,
            at: m.timestamp,
          });
        } else {
          byClient.set(m.senderId, { ...prev, count: prev.count + 1 });
        }
      });
    return Array.from(byClient.entries())
      .map(([clientId, data]) => {
        const client = clients.find(c => c.id === clientId);
        return {
          clientId,
          clientName: client?.name ?? t('coach.unknownClient'),
          avatar: client?.avatar,
          ...data,
        };
      })
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 4);
  }, [messages, user, clients, t]);

  const recentMedia = useMemo(() => {
    const items: MediaItem[] = [];
    entries
      .filter(e => e.type === 'photo' && e.photos?.length)
      .forEach(e => {
        const client = clients.find(c => c.id === e.clientId);
        e.photos!.forEach((uri, idx) => {
          items.push({
            id: `${e.id}-${idx}`,
            uri,
            clientId: e.clientId,
            clientName: client?.name?.split(' ')[0] ?? t('coach.unknownClient'),
            date: e.date,
          });
        });
      });
    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12);
  }, [entries, clients, t]);

  const upcomingSessions = useMemo(() => {
    if (!user) return [];
    return getUserAppointments(user.id)
      .filter(a => new Date(a.startTime) >= new Date() && a.status !== 'cancelled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 4);
  }, [user, getUserAppointments]);

  const libraryCount = libraryWorkouts.filter(w => !w.clientId).length;
  const routineCount = (routines ?? []).length;
  const assignmentCount = (assignments ?? []).length;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('coach.panelEyebrow')}</Text>
        <Text style={styles.greeting}>
          {t('home.hello')}, {user?.name?.split(' ')[0]}
        </Text>
        <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{clients.length}</Text>
          <Text style={styles.statLabel}>{t('nav.clients')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingSessions.length}</Text>
          <Text style={styles.statLabel}>{t('coach.statSessions')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{unreadTotal}</Text>
          <Text style={styles.statLabel}>{t('coach.statUnread')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{assignmentCount || routineCount || libraryCount}</Text>
          <Text style={styles.statLabel}>{t('coach.statRoutines')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('coach.manageTitle')}</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionTile, styles.actionTilePrimary]}
          onPress={() => router.push('/workouts/assign' as Href)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconWrap, styles.actionIconWrapOnPrimary]}>
            <ClipboardList size={20} color="#fff" />
          </View>
          <Text style={[styles.actionLabel, styles.actionLabelOnPrimary]}>
            {t('coach.assignRoutine')}
          </Text>
          <Text style={[styles.actionHint, styles.actionHintOnPrimary]}>
            {t('coach.assignRoutineHint')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/workouts/library' as Href)}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <Library size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>{t('coach.library')}</Text>
          <Text style={styles.actionHint}>{t('coach.libraryHint')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/workouts/create-exercise' as Href)}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <Activity size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>{t('coach.createExercise')}</Text>
          <Text style={styles.actionHint}>{t('coach.createExerciseHint')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/workouts/create')}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <Dumbbell size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>{t('coach.createWorkout')}</Text>
          <Text style={styles.actionHint}>{t('coach.createWorkoutHint')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/workouts/create-routine' as Href)}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <Layers size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>{t('coach.createRoutine')}</Text>
          <Text style={styles.actionHint}>{t('coach.createRoutineHint')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/calendar/create' as Href)}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <CalendarPlus size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>{t('coach.scheduleSession')}</Text>
          <Text style={styles.actionHint}>{t('coach.scheduleSessionHint')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('coach.newMessages')}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/messages' as Href)}>
          <Text style={styles.sectionLink}>{t('coach.openInbox')}</Text>
        </TouchableOpacity>
      </View>
      {unreadThreads.length > 0 ? (
        <View style={styles.listCard}>
          {unreadThreads.map((thread, index) => (
            <TouchableOpacity
              key={thread.clientId}
              style={[styles.listRow, index === unreadThreads.length - 1 && styles.listRowLast]}
              onPress={() => router.push(`/messages/${thread.clientId}`)}
            >
              <Avatar source={thread.avatar} name={thread.clientName} size={40} />
              <View style={styles.listBody}>
                <Text style={styles.listTitle}>{thread.clientName}</Text>
                <Text style={styles.listSubtitle} numberOfLines={1}>
                  {thread.preview}
                </Text>
              </View>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{thread.count}</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <MessageCircle size={22} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { marginTop: theme.spacing.sm }]}>
            {t('coach.inboxClear')}
          </Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('coach.recentMedia')}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/progress' as Href)}>
          <Text style={styles.sectionLink}>{t('clients.seeAll')}</Text>
        </TouchableOpacity>
      </View>
      {recentMedia.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaStrip}
        >
          {recentMedia.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.mediaThumb}
              onPress={() => router.push(`/(tabs)/progress` as Href)}
            >
              <Image source={{ uri: item.uri }} style={styles.mediaImage} />
              <View style={styles.mediaCaption}>
                <Text style={styles.mediaCaptionText} numberOfLines={1}>
                  {item.clientName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{t('coach.noMediaYet')}</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('coach.personalizedSessions')}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/calendar' as Href)}>
          <Text style={styles.sectionLink}>{t('nav.calendar')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionActions}>
        <TouchableOpacity
          style={styles.sessionChip}
          onPress={() => router.push('/calendar/create' as Href)}
        >
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.sessionChipText}>{t('coach.newSession')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sessionChip}
          onPress={() => router.push('/calendar/block-time' as Href)}
        >
          <Lock size={16} color={colors.primary} />
          <Text style={styles.sessionChipText}>{t('coach.blockTime')}</Text>
        </TouchableOpacity>
      </View>

      {upcomingSessions.length > 0 ? (
        upcomingSessions.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            showClientName
            collapsible
          />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{t('home.noAppointments')}</Text>
        </View>
      )}
    </ScrollView>
  );
}
