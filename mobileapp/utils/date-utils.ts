/** Local calendar day as YYYY-MM-DD (for scheduling / comparisons). */
export const toLocalYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Add calendar days to a YYYY-MM-DD string, returning YYYY-MM-DD in local time. */
export const addDaysToYmd = (ymd: string, days: number): string => {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toLocalYmd(date);
};

/** Stable noon-local ISO string for formatting a calendar day without UTC shift. */
export const ymdToNoonIso = (ymd: string): string => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // If the message is from today, just show the time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  
  // If the message is from yesterday, show "Yesterday" and the time
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`;
  }
  
  // If the message is from this year, show the month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  
  // Otherwise, show the full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const getWeekDates = (dateString: string): string[] => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate the start of the week (Sunday)
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - day);
  
  // Generate an array of dates for the week
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    weekDates.push(currentDate.toISOString());
  }
  
  return weekDates;
};