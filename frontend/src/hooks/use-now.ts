import { useEffect, useState } from 'react';

/** Ticking clock for live elapsed-time labels (HU-35 "há 6 min"). */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** "agora mesmo" | "há N min" — shared by order cards and kitchen lists. */
export function elapsedMinutes(fromIso: string | null | undefined, now: Date): number {
  if (!fromIso) {
    return 0;
  }
  const from = new Date(fromIso).getTime();
  return Math.max(0, Math.floor((now.getTime() - from) / 60_000));
}
