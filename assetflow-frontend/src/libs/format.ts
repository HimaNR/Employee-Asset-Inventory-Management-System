const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "2026-09-30T04:06:15.189Z" -> "30 Sept 2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '–';
  return DATE_FORMAT.format(new Date(value));
}
