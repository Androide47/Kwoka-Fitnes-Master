import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationsApi } from '@/utils/api';

export interface NotificationPreferencesState {
  workoutReminders: boolean;
  messageAlerts: boolean;
  announcements: boolean;
  setWorkoutReminders: (value: boolean) => void;
  setMessageAlerts: (value: boolean) => void;
  setAnnouncements: (value: boolean) => void;
}

export const useNotificationPreferencesStore = create<NotificationPreferencesState>()(
  persist(
    (set) => ({
      workoutReminders: true,
      messageAlerts: true,
      announcements: true,
      setWorkoutReminders: (workoutReminders) => {
        set({ workoutReminders });
        const { messageAlerts, announcements } = useNotificationPreferencesStore.getState();
        void notificationsApi.savePreferences({ workoutReminders, messageAlerts, announcements });
      },
      setMessageAlerts: (messageAlerts) => {
        set({ messageAlerts });
        const { workoutReminders, announcements } = useNotificationPreferencesStore.getState();
        void notificationsApi.savePreferences({ workoutReminders, messageAlerts, announcements });
      },
      setAnnouncements: (announcements) => {
        set({ announcements });
        const { workoutReminders, messageAlerts } = useNotificationPreferencesStore.getState();
        void notificationsApi.savePreferences({ workoutReminders, messageAlerts, announcements });
      },
    }),
    {
      name: 'kwoka-notification-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
