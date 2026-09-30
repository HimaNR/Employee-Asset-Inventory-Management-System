/** Date column -> "YYYY-MM-DD" (or null) for API responses */
export function toDateOnly(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

/**
 * "YYYY-MM-DD" from a request -> Date for Prisma.
 * undefined = "not sent" (leave unchanged), null = "clear the value".
 */
export function parseDateOnly(value: string | null | undefined): Date | null | undefined {
  if (value === undefined || value === null) return value;
  return new Date(`${value}T00:00:00.000Z`);
}
