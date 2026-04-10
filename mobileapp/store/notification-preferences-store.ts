import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      setWorkoutReminders: (workoutReminders) => set({ workoutReminders }),
      setMessageAlerts: (messageAlerts) => set({ messageAlerts }),
      setAnnouncements: (announcements) => set({ announcements }),
    }),
    {
      name: 'kwoka-notification-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
