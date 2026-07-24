import { readJson, writeJson } from "@/lib/api/storage";

const LOCKED_DAYS_KEY = "kwoka_locked_days";

// Map of trainer email -> list of locked day keys ("yyyy-MM-dd").
type LockedDaysMap = Record<string, string[]>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readMap(): LockedDaysMap {
  return readJson<LockedDaysMap>(LOCKED_DAYS_KEY, {});
}

export function listLockedDays(trainerEmail: string): string[] {
  return readMap()[normalizeEmail(trainerEmail)] ?? [];
}

export function isDayLocked(trainerEmail: string, dayKey: string): boolean {
  return listLockedDays(trainerEmail).includes(dayKey);
}

export function setDayLocked(trainerEmail: string, dayKey: string, locked: boolean) {
  const email = normalizeEmail(trainerEmail);
  const map = readMap();
  const days = new Set(map[email] ?? []);
  if (locked) {
    days.add(dayKey);
  } else {
    days.delete(dayKey);
  }
  map[email] = [...days].sort();
  writeJson(LOCKED_DAYS_KEY, map);
}

export const lockedDaysApi = {
  listLockedDays,
  isDayLocked,
  setDayLocked,
};
