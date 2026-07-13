export type TrainerClient = {
  id: string;
  name: string;
  email: string;
  goal: string;
  lastSession: string;
  status: "active" | "new" | "paused";
  joinedAt: string;
};

export const mockClients: TrainerClient[] = [
  {
    id: "c1",
    name: "Alex Morgan",
    email: "alex@example.com",
    goal: "Half marathon",
    lastSession: "2026-07-08",
    status: "active",
    joinedAt: "2026-01-12",
  },
  {
    id: "c2",
    name: "Sam Lee",
    email: "sam@example.com",
    goal: "Hypertrophy block",
    lastSession: "2026-07-09",
    status: "active",
    joinedAt: "2026-02-03",
  },
  {
    id: "c3",
    name: "Riley Chen",
    email: "riley@example.com",
    goal: "Fat loss + strength",
    lastSession: "2026-07-07",
    status: "active",
    joinedAt: "2026-03-18",
  },
  {
    id: "c4",
    name: "Jordan Blake",
    email: "jordan@example.com",
    goal: "Return to sport",
    lastSession: "—",
    status: "new",
    joinedAt: "2026-07-05",
  },
  {
    id: "c5",
    name: "Casey Nguyen",
    email: "casey@example.com",
    goal: "Mobility & posture",
    lastSession: "—",
    status: "new",
    joinedAt: "2026-07-08",
  },
];

export type ScheduleSlot = {
  id: string;
  day: string;
  time: string;
  client: string;
  type: string;
};

export const mockSchedule: ScheduleSlot[] = [
  { id: "s1", day: "Mon", time: "07:00", client: "Alex Morgan", type: "Run technique" },
  { id: "s2", day: "Mon", time: "18:00", client: "Sam Lee", type: "Upper push" },
  { id: "s3", day: "Wed", time: "12:00", client: "Riley Chen", type: "Full body" },
  { id: "s4", day: "Fri", time: "17:30", client: "Alex Morgan", type: "Long run prep" },
];

export type TrainerNotification = {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
};

export const mockNotifications: TrainerNotification[] = [
  {
    id: "n1",
    title: "New booking request",
    body: "Jordan Blake requested a session for Jul 12 at 10:00.",
    at: "2026-07-10T08:12:00",
    read: false,
  },
  {
    id: "n2",
    title: "Workout completed",
    body: "Sam Lee finished Upper Push — logged 4/4 sets.",
    at: "2026-07-09T19:40:00",
    read: false,
  },
  {
    id: "n3",
    title: "Message from client",
    body: "Alex Morgan asked about taper week volume.",
    at: "2026-07-09T14:05:00",
    read: true,
  },
  {
    id: "n4",
    title: "New client joined",
    body: "Casey Nguyen signed up and is waiting for onboarding.",
    at: "2026-07-08T11:20:00",
    read: true,
  },
];

export type TrainerStat = {
  label: string;
  value: string;
  hint: string;
};

export const mockStatistics: TrainerStat[] = [
  { label: "Active clients", value: "5", hint: "+2 this month" },
  { label: "Sessions this week", value: "12", hint: "4 remaining" },
  { label: "Completion rate", value: "91%", hint: "Workouts logged" },
  { label: "Avg. response time", value: "2.4h", hint: "Chat replies" },
];

export type ComingSession = {
  id: string;
  client: string;
  title: string;
  startISO: string;
  status: "confirmed" | "pending";
};

export const mockComingSessions: ComingSession[] = [
  {
    id: "cs1",
    client: "Alex Morgan",
    title: "Run technique",
    startISO: "2026-07-11T07:00:00",
    status: "confirmed",
  },
  {
    id: "cs2",
    client: "Sam Lee",
    title: "Upper push",
    startISO: "2026-07-11T18:00:00",
    status: "confirmed",
  },
  {
    id: "cs3",
    client: "Jordan Blake",
    title: "Intro assessment",
    startISO: "2026-07-12T10:00:00",
    status: "pending",
  },
  {
    id: "cs4",
    client: "Riley Chen",
    title: "Full body",
    startISO: "2026-07-13T12:00:00",
    status: "confirmed",
  },
];

export type BookingRequest = {
  id: string;
  client: string;
  title: string;
  startISO: string;
  note: string;
};

export const mockBookingRequests: BookingRequest[] = [
  {
    id: "br1",
    client: "Jordan Blake",
    title: "Intro assessment",
    startISO: "2026-07-12T10:00:00",
    note: "First session — focus on movement screen.",
  },
  {
    id: "br2",
    client: "Casey Nguyen",
    title: "Mobility consult",
    startISO: "2026-07-14T16:30:00",
    note: "Prefers evenings after work.",
  },
];

export type ExerciseItem = {
  id: string;
  name: string;
  youtubeUrl: string;
  instructions: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  description: string;
  exercises: ExerciseItem[];
};

export const mockWorkoutLibrary: WorkoutTemplate[] = [
  {
    id: "w1",
    name: "Full Body Strength",
    description: "Compound lifts for overall strength.",
    exercises: [
      {
        id: "e1",
        name: "Back squat",
        youtubeUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
        instructions: "Brace core, sit between hips, drive through mid-foot.",
      },
      {
        id: "e2",
        name: "Bench press",
        youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
        instructions: "Retract scapula, controlled eccentric, lockout without bounce.",
      },
      {
        id: "e3",
        name: "Romanian deadlift",
        youtubeUrl: "https://www.youtube.com/watch?v=jEy_czb3RKA",
        instructions: "Soft knees, hinge at hips, feel hamstrings stretch.",
      },
    ],
  },
  {
    id: "w2",
    name: "HIIT Cardio Blast",
    description: "Short intervals for conditioning.",
    exercises: [
      {
        id: "e4",
        name: "Bike sprints",
        youtubeUrl: "https://www.youtube.com/watch?v=1V3V-9z5q0Y",
        instructions: "40s hard / 20s easy × 8. Stay seated on recoveries.",
      },
      {
        id: "e5",
        name: "Burpees",
        youtubeUrl: "https://www.youtube.com/watch?v=auBLPXO8Fww",
        instructions: "Chest to floor optional. Keep cadence steady.",
      },
    ],
  },
  {
    id: "w3",
    name: "Upper Push",
    description: "Chest, shoulders, triceps focus.",
    exercises: [
      {
        id: "e6",
        name: "Overhead press",
        youtubeUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
        instructions: "Glutes tight, press bar over mid-foot, lock elbows.",
      },
      {
        id: "e7",
        name: "Incline DB press",
        youtubeUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
        instructions: "30–45° bench. Soft lockout at top.",
      },
    ],
  },
];

export type SavedRoutine = {
  id: string;
  clientId: string;
  clientName: string;
  workoutIds: string[];
  name: string;
  savedAt: string;
};

export const mockSavedRoutines: SavedRoutine[] = [
  {
    id: "r1",
    clientId: "c1",
    clientName: "Alex Morgan",
    workoutIds: ["w2"],
    name: "Race prep week",
    savedAt: "2026-07-01",
  },
  {
    id: "r2",
    clientId: "c2",
    clientName: "Sam Lee",
    workoutIds: ["w1", "w3"],
    name: "Hypertrophy A/B",
    savedAt: "2026-06-28",
  },
];

export type ChatThread = {
  id: string;
  clientId: string;
  clientName: string;
  lastPreview: string;
  updatedAt: string;
  unread: number;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  from: "coach" | "client";
  body: string;
  at: string;
};

export const mockChatThreads: ChatThread[] = [
  {
    id: "t1",
    clientId: "c1",
    clientName: "Alex Morgan",
    lastPreview: "Any tips for taper week volume?",
    updatedAt: "2026-07-09T14:05:00",
    unread: 1,
  },
  {
    id: "t2",
    clientId: "c2",
    clientName: "Sam Lee",
    lastPreview: "Logged all sets — felt strong on bench.",
    updatedAt: "2026-07-09T19:42:00",
    unread: 0,
  },
  {
    id: "t3",
    clientId: "c3",
    clientName: "Riley Chen",
    lastPreview: "Can we move Wednesday to Thursday?",
    updatedAt: "2026-07-08T09:10:00",
    unread: 2,
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "m1",
    threadId: "t1",
    from: "client",
    body: "Hey coach — any tips for taper week volume?",
    at: "2026-07-09T14:05:00",
  },
  {
    id: "m2",
    threadId: "t1",
    from: "coach",
    body: "Drop intensity ~20% and keep one quality session. Sleep is the priority.",
    at: "2026-07-09T14:20:00",
  },
  {
    id: "m3",
    threadId: "t2",
    from: "client",
    body: "Logged all sets — felt strong on bench.",
    at: "2026-07-09T19:42:00",
  },
  {
    id: "m4",
    threadId: "t2",
    from: "coach",
    body: "Nice work. Next session we add a pause on the first set.",
    at: "2026-07-09T20:01:00",
  },
  {
    id: "m5",
    threadId: "t3",
    from: "client",
    body: "Can we move Wednesday to Thursday?",
    at: "2026-07-08T09:10:00",
  },
  {
    id: "m6",
    threadId: "t3",
    from: "client",
    body: "Also running late on recovery this week.",
    at: "2026-07-08T09:11:00",
  },
];
