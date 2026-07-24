import { DEMO_TRAINER_EMAIL } from "@/lib/api/sessionCreditsApi";
import type { Booking, BookingStatus } from "@/lib/api/types";
import { getOrCreateMonthRecord } from "@/lib/api/sessionCreditsApi";
import { readJson, writeJson } from "@/lib/api/storage";

const BOOKINGS_KEY = "kwoka_bookings";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readBookings(): Booking[] {
  return readJson<Booking[]>(BOOKINGS_KEY, []).filter(Boolean);
}

function writeBookings(list: Booking[]) {
  writeJson(BOOKINGS_KEY, list);
}

function sortByStart(list: Booking[]) {
  return [...list].sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
}

export function monthKeyFromISO(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function listAllIncludingCancelled(): Booking[] {
  return readBookings();
}

export function listForClient(clientEmail: string): Booking[] {
  const e = normalizeEmail(clientEmail);
  return sortByStart(readBookings().filter((b) => b.clientEmail === e && b.status !== "cancelled"));
}

export function listForTrainer(trainerEmail: string): Booking[] {
  const e = normalizeEmail(trainerEmail);
  return sortByStart(readBookings().filter((b) => b.trainerEmail === e && b.status !== "cancelled"));
}

export function listByDate(date: Date, opts?: { clientEmail?: string; trainerEmail?: string }): Booking[] {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const t0 = start.getTime();
  const t1 = end.getTime();
  const clientEmail = opts?.clientEmail ? normalizeEmail(opts.clientEmail) : null;
  const trainerEmail = opts?.trainerEmail ? normalizeEmail(opts.trainerEmail) : null;

  return readBookings().filter((b) => {
    if (b.status === "cancelled") return false;
    const t = new Date(b.startISO).getTime();
    if (t < t0 || t >= t1) return false;
    if (clientEmail && b.clientEmail !== clientEmail) return false;
    if (trainerEmail && b.trainerEmail !== trainerEmail) return false;
    return true;
  });
}

export function activeClientBookingsInMonth(clientEmail: string, monthKey = monthKeyFromISO(new Date().toISOString())): number {
  const e = normalizeEmail(clientEmail);
  return readBookings().filter((b) => {
    if (b.clientEmail !== e) return false;
    if (b.status !== "pending" && b.status !== "confirmed") return false;
    return monthKeyFromISO(b.startISO) === monthKey;
  }).length;
}

export function getSessionsLeftForClient(clientEmail: string, monthKey?: string): number {
  const key = monthKey ?? monthKeyFromISO(new Date().toISOString());
  const { allowance } = getOrCreateMonthRecord(clientEmail, key);
  const used = activeClientBookingsInMonth(clientEmail, key);
  return Math.max(0, allowance - used);
}

export function canClientCreatePendingBooking(clientEmail: string, monthKey?: string): boolean {
  return getSessionsLeftForClient(clientEmail, monthKey) > 0;
}

export function createBooking(input: Omit<Booking, "id" | "status"> & { status?: BookingStatus }): Booking {
  const list = readBookings();
  const booking: Booking = {
    ...input,
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: input.status ?? "pending",
    trainerEmail: normalizeEmail(input.trainerEmail || DEMO_TRAINER_EMAIL),
    clientEmail: normalizeEmail(input.clientEmail),
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

export function slotConflicts(startISO: string, endISO: string, trainerEmail: string, excludeId?: string): boolean {
  const t0 = new Date(startISO).getTime();
  const t1 = new Date(endISO).getTime();
  const te = normalizeEmail(trainerEmail);
  return readBookings().some((b) => {
    if (b.id === excludeId || b.status === "cancelled" || b.trainerEmail !== te) return false;
    const a0 = new Date(b.startISO).getTime();
    const a1 = new Date(b.endISO).getTime();
    return a0 < t1 && a1 > t0;
  });
}

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

export const bookingsApi = {
  listAllIncludingCancelled,
  listForClient,
  listForTrainer,
  listByDate,
  activeClientBookingsInMonth,
  getSessionsLeftForClient,
  canClientCreatePendingBooking,
  createBooking,
  updateBookingStatus,
  slotConflicts,
  slotStartsForDay,
};
