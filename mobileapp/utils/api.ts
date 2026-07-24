import { API_BASE_URL } from '@/constants/config';
import { mockAppointments } from '@/mocks/appointments';
import { mockExercises } from '@/mocks/exercises';
import { mockMessages } from '@/mocks/messages';
import { mockProgressEntries } from '@/mocks/progress';
import { mockTrainer, mockClients } from '@/mocks/users';
import { mockWorkouts } from '@/mocks/workouts';
import { Appointment, Attachment, Client, Exercise, Message, ProgressEntry, Trainer, User, Workout } from '@/types';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function delay(ms = 500) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Dummy request function that logs and returns empty promises.
async function request(path: string, options: RequestInit = {}) {
  console.log(`[Mock API:${API_BASE_URL}] Request to ${path}`, { ...options, authToken });
  return Promise.resolve({});
}

export const api = {
  postForm: async (path: string, form: FormData) => {
    console.log(`[Mock API] POST Form to ${path}`);
    return Promise.resolve({});
  },
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};

export const authApi = {
  async login(email: string, _password: string): Promise<{ user: User; clients: Client[]; token: string } | null> {
    await delay(800);
    if (email === 'trainer@example.com' || email === mockTrainer.email) {
      return { user: mockTrainer, clients: mockClients, token: `demo-token-${mockTrainer.id}` };
    }

    const client = mockClients.find(c => c.email === email) || (email === 'client@example.com' ? mockClients[0] : null);
    if (!client) return null;
    return { user: client, clients: [], token: `demo-token-${client.id}` };
  },

  async signUp(userData: Partial<User>, isTrainer: boolean): Promise<{ user: User; clients: Client[]; token: string }> {
    await delay(1000);
    if (isTrainer) {
      const newTrainer: Trainer = {
        id: `trainer-${Date.now()}`,
        name: userData.name || 'New Trainer',
        email: userData.email || 'new.trainer@example.com',
        avatar: mockTrainer.avatar,
        bio: 'New trainer bio',
        specialties: ['General Fitness'],
        experience: '1 year',
        certifications: [],
        availability: mockTrainer.availability,
        clients: [],
        role: 'trainer',
        joinedAt: new Date().toISOString(),
      };
      return { user: newTrainer, clients: [], token: `demo-token-${newTrainer.id}` };
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: userData.name || 'New Client',
      email: userData.email || 'new.client@example.com',
      avatar: mockClients[0].avatar,
      goals: [],
      height: 0,
      weight: 0,
      fitnessLevel: 'beginner',
      medicalConditions: [],
      role: 'client',
      trainerId: 'trainer-1',
      streakCount: 0,
      lastCheckIn: null,
      measurements: {
        date: new Date().toISOString(),
        weight: 0,
      },
      joinedAt: new Date().toISOString(),
    };
    return { user: newClient, clients: [], token: `demo-token-${newClient.id}` };
  },
};

export const workoutsApi = {
  async listWorkouts(): Promise<{ workouts: Workout[]; exercises: Exercise[] }> {
    await delay();
    return { workouts: mockWorkouts, exercises: mockExercises };
  },
};

export const calendarApi = {
  async listAppointments(userId?: string): Promise<Appointment[]> {
    await delay();
    if (!userId) return mockAppointments;
    return mockAppointments.filter(app => app.clientId === userId || app.trainerId === userId);
  },
};

export const messagesApi = {
  async listMessages(userId?: string, otherUserId?: string): Promise<Message[]> {
    await delay();
    if (userId && otherUserId) {
      return mockMessages.filter(
        message =>
          (message.senderId === userId && message.receiverId === otherUserId) ||
          (message.senderId === otherUserId && message.receiverId === userId)
      );
    }
    if (userId) {
      return mockMessages.filter(message => message.senderId === userId || message.receiverId === userId);
    }
    return mockMessages;
  },

  async sendMessage(senderId: string, content: string, receiverId: string, attachments?: Attachment[]): Promise<Message> {
    await delay(200);
    return {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      attachments,
    };
  },
};

export const progressApi = {
  async listProgressEntries(clientId: string): Promise<ProgressEntry[]> {
    await delay();
    return mockProgressEntries.filter(entry => entry.clientId === clientId);
  },

  async uploadProgressPhoto(clientId: string, localUri: string): Promise<string> {
    await delay(300);
    return localUri || `mock-upload://${clientId}/${Date.now()}.jpg`;
  },
};

export type NotificationPreferencesPayload = {
  workoutReminders: boolean;
  messageAlerts: boolean;
  announcements: boolean;
};

export const notificationsApi = {
  async savePreferences(preferences: NotificationPreferencesPayload): Promise<NotificationPreferencesPayload> {
    await delay(150);
    return preferences;
  },

  async registerPushToken(userId: string, token: string): Promise<{ userId: string; token: string }> {
    await delay(150);
    return { userId, token };
  },
};

