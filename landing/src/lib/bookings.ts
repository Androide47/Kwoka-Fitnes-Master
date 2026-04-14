/**
 * Demo-only bookings (localStorage).
 * Production would sync with a backend.
 */

import { currentMonthKey, DEMO_TRAINER_EMAIL, getOrCreateMonthRecord } from "@/lib/sessionCredits";

const STORAGE_KEY = "kwoka_bookings";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  startISO: string;
  endISO: string;
  clientEmail: string;
  trainerEmail: string;
  status: BookingStatus;
  title: string;
};

function readBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Booking[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeBookings(list: Booking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function monthKeyFromISO(iso: string) {
  return currentMonthKey(new Date(iso));
}

export function listAllIncludingCancelled(): Booking[] {
  return readBookings();
}

export function listForClient(clientEmail: string): Booking[] {
  const e = clientEmail.trim().toLowerCase();
  return readBookings()
    .filter((b) => b.clientEmail.toLowerCase() === e && b.status !== "cancelled")
    .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
}

export function listForTrainer(trainerEmail: string): Booking[] {
  const e = trainerEmail.trim().toLowerCase();
  return readBookings()
    .filter((b) => b.trainerEmail.toLowerCase() === e && b.status !== "cancelled")
    .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
}

export function listByDate(date: Date, opts?: { clientEmail?: string; trainerEmail?: string }): Booking[] {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const t0 = start.getTime();
  const t1 = end.getTime();
  return readBookings().filter((b) => {
    if (b.status === "cancelled") return false;
    const t = new Date(b.startISO).getTime();
    if (t < t0 || t >= t1) return false;
    if (opts?.clientEmail && b.clientEmail.toLowerCase() !== opts.clientEmail.trim().toLowerCase()) return false;
    if (opts?.trainerEmail && b.trainerEmail.toLowerCase() !== opts.trainerEmail.trim().toLowerCase()) return false;
    return true;
  });
}

/** Pending + confirmed for client in calendar month (each booking counts one slot). */
export function activeClientBookingsInMonth(clientEmail: string, monthKey = currentMonthKey()): number {
  const e = clientEmail.trim().toLowerCase();
  return readBookings().filter((b) => {
    if (b.clientEmail.toLowerCase() !== e) return false;
    if (b.status !== "pending" && b.status !== "confirmed") return false;
    return monthKeyFromISO(b.startISO) === monthKey;
  }).length;
}

export function getSessionsLeftForClient(clientEmail: string, monthKey = currentMonthKey()): number {
  const { allowance } = getOrCreateMonthRecord(clientEmail, monthKey);
  const used = activeClientBookingsInMonth(clientEmail, monthKey);
  return Math.max(0, allowance - used);
}

export function canClientCreatePendingBooking(clientEmail: string, monthKey = currentMonthKey()): boolean {
  return getSessionsLeftForClient(clientEmail, monthKey) > 0;
}

export function createBooking(input: Omit<Booking, "id" | "status"> & { status?: BookingStatus }): Booking {
  const list = readBookings();
  const booking: Booking = {
    ...input,
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: input.status ?? "pending",
    trainerEmail: (input.trainerEmail || DEMO_TRAINER_EMAIL).trim().toLowerCase(),
    clientEmail: input.clientEmail.trim().toLowerCase(),
  };
  list.push(booking);
  writeBookings(list);
  return booking;
}

export function updateBookingStatus(id: string, status: BookingStatus): Booking | null {
  const list = readBookings();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status };
  writeBookings(list);
  return list[idx];
}

/** True if slot overlaps any non-cancelled booking for this trainer. */
export function slotConflicts(startISO: string, endISO: string, trainerEmail: string, excludeId?: string): boolean {
  const t0 = new Date(startISO).getTime();
  const t1 = new Date(endISO).getTime();
  const te = trainerEmail.trim().toLowerCase();
  return readBookings().some((b) => {
    if (b.id === excludeId) return false;
    if (b.status === "cancelled") return false;
    if (b.trainerEmail.toLowerCase() !== te) return false;
    const a0 = new Date(b.startISO).getTime();
    const a1 = new Date(b.endISO).getTime();
    return a0 < t1 && a1 > t0;
  });
}

/** Generate 60-minute slot starts 9:00–16:00 local (end 17:00). Skips past days; on today skips past slots. */
export function slotStartsForDay(day: Date): Date[] {
  const startOfSel = new Date(day);
  startOfSel.setHours(0, 0, 0, 0);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (startOfSel < startOfToday) return [];

  const isToday = startOfSel.getTime() === startOfToday.getTime();
  const now = new Date();
  const out: Date[] = [];
  for (let h = 9; h <= 16; h++) {
    const slotStart = new Date(day);
    slotStart.setHours(h, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(h + 1, 0, 0, 0);
    if (isToday && slotEnd <= now) continue;
    out.push(slotStart);
  }
  return out;
}
