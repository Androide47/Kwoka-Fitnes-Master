/**
 * Demo-only monthly session allowance (localStorage).
 * "Sessions left" is derived from bookings — see getSessionsLeftForClient in bookings.ts.
 * Production would load/save via API.
 */

const STORAGE_KEY = "kwoka_session_credits";

export const DEMO_TRAINER_EMAIL = "coach@kwoka.fit";

export type MonthCredits = { allowance: number };

/** email -> YYYY-MM -> { allowance } */
type CreditsStore = Record<string, Record<string, MonthCredits>>;

function readStore(): CreditsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as CreditsStore;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writeStore(store: CreditsStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
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
  while (key) {
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

/** Add to monthly allowance (e.g. after purchasing a package). */
export function addAllowance(email: string, add: number, monthKey = currentMonthKey()) {
  const e = email.trim().toLowerCase();
  const store = readStore();
  if (!store[e]) store[e] = {};
  const cur = store[e][monthKey] ?? { allowance: inheritedAllowance(email, monthKey) };
  cur.allowance = Math.max(0, cur.allowance + add);
  store[e][monthKey] = cur;
  writeStore(store);
}

/** Set absolute minimum allowance for the month (e.g. premium tier). */
export function setAllowanceForMonth(email: string, allowance: number, monthKey = currentMonthKey()) {
  const e = email.trim().toLowerCase();
  const store = readStore();
  if (!store[e]) store[e] = {};
  const prev = store[e][monthKey];
  const base = prev?.allowance ?? inheritedAllowance(email, monthKey);
  store[e][monthKey] = { allowance: Math.max(base, allowance) };
  writeStore(store);
}
