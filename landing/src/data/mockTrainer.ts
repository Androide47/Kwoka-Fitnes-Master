export type TrainerClient = {
  id: string;
  name: string;
  goal: string;
  lastSession: string;
};

export const mockClients: TrainerClient[] = [
  { id: "c1", name: "Alex Morgan", goal: "Half marathon", lastSession: "2026-04-08" },
  { id: "c2", name: "Sam Lee", goal: "Hypertrophy block", lastSession: "2026-04-09" },
  { id: "c3", name: "Riley Chen", goal: "Fat loss + strength", lastSession: "2026-04-07" },
];

export type ScheduleSlot = { id: string; day: string; time: string; client: string; type: string };

export const mockSchedule: ScheduleSlot[] = [
  { id: "s1", day: "Mon", time: "07:00", client: "Alex Morgan", type: "Run technique" },
  { id: "s2", day: "Mon", time: "18:00", client: "Sam Lee", type: "Upper push" },
  { id: "s3", day: "Wed", time: "12:00", client: "Riley Chen", type: "Full body" },
  { id: "s4", day: "Fri", time: "17:30", client: "Alex Morgan", type: "Long run prep" },
];
