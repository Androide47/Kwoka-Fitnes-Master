import { readJson, writeJson } from "@/lib/api/storage";

export const DEMO_TRAINER_EMAIL = "coach@kwoka.fit";

const STORAGE_KEY = "kwoka_session_credits";

export type MonthCredits = { allowance: number };
type CreditsStore = Record<string, Record<string, MonthCredits>>;

function readStore(): CreditsStore {
  return readJson<CreditsStore>(STORAGE_KEY, {});
}

function writeStore(store: CreditsStore) {
  writeJson(STORAGE_KEY, store);
}

export function currentMonthKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function prevMonthKey(monthKey: string): string | null {
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return null;
  const d = new Date(y, m - 2, 1);
  return currentMonthKey(d);
}

function inheritedAllowance(email: string, monthKey: string): number {
  let key: string | null = prevMonthKey(monthKey);
  const store = readStore();
  const byEmail = store[email.toLowerCase()] ?? {};
  for (let scanned = 0; key && scanned < 24; scanned += 1) {
    const rec = byEmail[key];
    if (rec && typeof rec.allowance === "number") return rec.allowance;
    key = prevMonthKey(key);
  }
  return 0;
}

export function getOrCreateMonthRecord(email: string, monthKey = currentMonthKey()): MonthCredits {
  const e = email.trim().toLowerCase();
  const store = readStore();
  if (!store[e]) store[e] = {};
  let rec = store[e][monthKey];
  if (!rec) {
    rec = { allowance: inheritedAllowance(email, monthKey) };
    store[e][monthKey] = rec;
    writeStore(store);
  }
  return rec;
}

export function addAllowance(email: string, add: number, monthKey = currentMonthKey()) {
  const e = email.trim().toLowerCase();
  const store = readStore();
  if (!store[e]) store[e] = {};
  const cur = store[e][monthKey] ?? { allowance: inheritedAllowance(email, monthKey) };
  cur.allowance = Math.max(0, cur.allowance + add);
  store[e][monthKey] = cur;
  writeStore(store);
}

export const addSessionAllowance = addAllowance;

export function setAllowanceForMonth(email: string, allowance: number, monthKey = currentMonthKey()) {
  const e = email.trim().toLowerCase();
  const store = readStore();
  if (!store[e]) store[e] = {};
  const prev = store[e][monthKey];
  const base = prev?.allowance ?? inheritedAllowance(email, monthKey);
  store[e][monthKey] = { allowance: Math.max(base, allowance) };
  writeStore(store);
}

export const sessionCreditsApi = {
  currentMonthKey,
  getMonthRecord: getOrCreateMonthRecord,
  addAllowance,
  addSessionAllowance,
  setAllowanceForMonth,
};
