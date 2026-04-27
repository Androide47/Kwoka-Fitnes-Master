export type TrainerClient = {
  id: string;
  name: string;
  email: string;
  goal: string;
  lastSession: string;
  sessionsCompleted: number;
  progressSummary: string;
};

export const mockClients: TrainerClient[] = [
  {
    id: "c1",
    name: "Alex Morgan",
    email: "alex@example.com",
    goal: "Half marathon",
    lastSession: "2026-04-08",
    sessionsCompleted: 18,
    progressSummary: "Improved weekly mileage consistency and needs continued mobility work.",
  },
  {
    id: "c2",
    name: "Sam Lee",
    email: "sam@example.com",
    goal: "Hypertrophy block",
    lastSession: "2026-04-09",
    sessionsCompleted: 12,
    progressSummary: "Progressive overload is on track; next review should adjust upper push volume.",
  },
  {
    id: "c3",
    name: "Riley Chen",
    email: "riley@example.com",
    goal: "Fat loss + strength",
    lastSession: "2026-04-07",
    sessionsCompleted: 9,
    progressSummary: "Body composition trend is positive with stable strength numbers.",
  },
];

export type ScheduleSlot = { id: string; day: string; time: string; client: string; type: string };

export const mockSchedule: ScheduleSlot[] = [
  { id: "s1", day: "Mon", time: "07:00", client: "Alex Morgan", type: "Run technique" },
  { id: "s2", day: "Mon", time: "18:00", client: "Sam Lee", type: "Upper push" },
  { id: "s3", day: "Wed", time: "12:00", client: "Riley Chen", type: "Full body" },
  { id: "s4", day: "Fri", time: "17:30", client: "Alex Morgan", type: "Long run prep" },
];
