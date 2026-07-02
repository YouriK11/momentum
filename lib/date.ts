// Timezone-safe date helpers
// Server-side uses Europe/Brussels; client-side uses browser's local timezone.

const TZ  = "Europe/Brussels";
const FMT = "fr-CA"; // produces YYYY-MM-DD (ISO 8601)

/** Today's date in Brussels timezone — use in server-side RSC and Server Actions */
export function todayBrussels(): string {
  return new Intl.DateTimeFormat(FMT, { timeZone: TZ }).format(new Date());
}

/** N days ago in Brussels timezone */
export function daysAgoBrussels(n: number): string {
  return new Intl.DateTimeFormat(FMT, { timeZone: TZ }).format(
    new Date(Date.now() - n * 86_400_000)
  );
}

/** Today's date in the browser's local timezone — use in Client Components */
export function todayLocal(): string {
  return new Intl.DateTimeFormat(FMT).format(new Date());
}

/** N days ago in the browser's local timezone — use in Client Components */
export function daysAgoLocal(n: number): string {
  return new Intl.DateTimeFormat(FMT).format(
    new Date(Date.now() - n * 86_400_000)
  );
}

/** Subtract one day from a YYYY-MM-DD string safely (UTC arithmetic) */
export function prevDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}
