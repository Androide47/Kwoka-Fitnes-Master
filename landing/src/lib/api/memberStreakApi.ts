import { readJson, writeJson } from "@/lib/api/storage";

const KEY = "kwoka_member_streak";

export type MemberStreak = {
  count: number;
  lastCheckIn: string | null; // YYYY-MM-DD
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function read(): MemberStreak {
  return readJson<MemberStreak>(KEY, { count: 0, lastCheckIn: null });
}

export const memberStreakApi = {
  get(): MemberStreak {
    return read();
  },

  /** Idempotent daily check-in — call on dashboard load. */
  checkIn(): MemberStreak {
    const current = read();
    const today = todayKey();
    if (current.lastCheckIn === today) return current;

    const next: MemberStreak =
      current.lastCheckIn === yesterdayKey()
        ? { count: current.count + 1, lastCheckIn: today }
        : { count: 1, lastCheckIn: today };

    writeJson(KEY, next);
    return next;
  },
};
