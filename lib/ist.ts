export const IST_TIME_ZONE = "Asia/Kolkata" as const;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Returns weekday index in IST: 0=Sun ... 6=Sat
export function getISTDayOfWeek(date: Date = new Date()): number {
  return new Date(date.getTime() + IST_OFFSET_MS).getUTCDay();
}

// Returns a locale-formatted date string, but forced to IST.
export function formatISTDate(date: Date = new Date(), locales?: string | string[]): string {
  return date.toLocaleDateString(locales, { timeZone: IST_TIME_ZONE });
}
