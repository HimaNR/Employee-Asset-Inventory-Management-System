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
