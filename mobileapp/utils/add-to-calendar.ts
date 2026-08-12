import { Linking, Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { Appointment } from '@/types';
import { getAppointmentLocationParts } from '@/utils/appointment-utils';

export type CalendarEventInput = {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
};

function toUtcStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function icsFilename(title: string): string {
  const safe = title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `${safe || 'session'}.ics`;
}

export function appointmentToCalendarEvent(
  appointment: Appointment,
  t: (key: string) => string,
): CalendarEventInput {
  const parts = getAppointmentLocationParts(appointment.location, t);
  const location = parts.address ?? parts.sessionType;
  const description = [
    `${t('calendar.sessionType')}: ${parts.sessionType}`,
    parts.isRemote ? t('calendar.remoteLinkLegend') : undefined,
    appointment.description,
    appointment.notes ? `${t('calendar.notesOptional')}: ${appointment.notes}` : undefined,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n\n');

  return {
    title: appointment.title,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    location,
    description,
  };
}

export function buildIcs(event: CalendarEventInput): string {
  const uid = `${toUtcStamp(event.startTime)}-${encodeURIComponent(event.title)}@kwoka-fitness`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kwoka Fitness//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    `DTSTART:${toUtcStamp(event.startTime)}`,
    `DTEND:${toUtcStamp(event.endTime)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadIcsOnWeb(ics: string, filename: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function shareIcsOnWeb(ics: string, filename: string, title: string) {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  if (nav && typeof nav.share === 'function') {
    try {
      const file = new File([ics], filename, { type: 'text/calendar' });
      const payload: ShareData = { title, text: title };
      if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
        payload.files = [file];
      }
      await nav.share(payload);
      return;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
  }
  downloadIcsOnWeb(ics, filename);
}

export async function addToDeviceCalendar(event: CalendarEventInput): Promise<void> {
  const ics = buildIcs(event);
  const filename = icsFilename(event.title);

  if (Platform.OS === 'web') {
    await shareIcsOnWeb(ics, filename, event.title);
    return;
  }

  const dir = FileSystem.cacheDirectory;
  if (!dir) {
    await Share.share({ title: event.title, message: ics });
    return;
  }

  const fileUri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, ics);

  if (Platform.OS === 'ios') {
    await Share.share({ url: fileUri });
    return;
  }

  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  try {
    await Linking.openURL(contentUri);
  } catch {
    await Share.share({ title: event.title, message: event.title, url: contentUri });
  }
}

export async function openAddressInMaps(address: string): Promise<void> {
  const trimmed = address.trim();
  if (!trimmed) return;

  const query = encodeURIComponent(trimmed);
  const webUrl = `https://maps.google.com/?q=${query}`;

  if (Platform.OS === 'web') {
    const nav = typeof navigator === 'undefined' ? undefined : navigator;
    if (nav && typeof nav.share === 'function') {
      try {
        await nav.share({ title: trimmed, text: trimmed, url: webUrl });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    window.open(webUrl, '_blank', 'noopener');
    return;
  }

  if (Platform.OS === 'android') {
    await Linking.openURL(`geo:0,0?q=${query}`);
    return;
  }

  await Share.share({
    title: trimmed,
    url: `http://maps.apple.com/?q=${query}`,
    message: trimmed,
  });
}
