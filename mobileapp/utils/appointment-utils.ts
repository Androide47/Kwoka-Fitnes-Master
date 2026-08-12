import type { Appointment } from '@/types';

export function isActiveBooking(appointment: Appointment): boolean {
  return appointment.status !== 'cancelled';
}

export function getAppointmentLocationParts(
  location: string | undefined,
  t: (key: string) => string,
): { sessionType: string; address?: string; isRemote: boolean } {
  if (location === 'remote') {
    return { sessionType: t('calendar.sessionRemote'), isRemote: true };
  }
  if (!location || location === 'presencial') {
    return { sessionType: t('calendar.sessionPresencial'), isRemote: false };
  }
  return { sessionType: t('calendar.sessionPresencial'), address: location, isRemote: false };
}
