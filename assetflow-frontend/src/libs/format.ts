const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const AMOUNT_FORMAT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "2026-09-30T04:06:15.189Z" or "2026-09-30" -> "30 Sept 2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '–';
  return DATE_FORMAT.format(new Date(value));
}

/** "2026-09-30T04:06:15.189Z" -> "30 Sept 2026, 09:36" (local time) */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '–';
  return DATE_TIME_FORMAT.format(new Date(value));
}

/** "1250.5" -> "1,250.50" */
export function formatAmount(value: string | null | undefined): string {
  if (!value) return '–';
  return AMOUNT_FORMAT.format(Number(value));
}

/** Whole days from today until a "YYYY-MM-DD" date (negative = in the past) */
export function daysUntil(dateOnly: string): number {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${dateOnly}T00:00:00.000Z`).getTime();
  return Math.round((target - todayUtc) / 86_400_000);
}

/** Human length of time between two moments: "5 days", "3 months", "1 year 2 months" */
export function formatDuration(fromIso: string, toIso?: string | null): string {
  const from = new Date(fromIso);
  const to = toIso ? new Date(toIso) : new Date();
  const days = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000));
  if (days < 1) return 'Today';
  if (days < 31) return `${days} day${days === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return `${years} year${years === 1 ? '' : 's'}${rest ? ` ${rest} month${rest === 1 ? '' : 's'}` : ''}`;
}

/** "just now", "5 min ago", "3 h ago", "2 days ago", then a normal date */
export function formatRelative(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(iso);
}
