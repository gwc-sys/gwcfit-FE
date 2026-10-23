/** Ignore taps and vertical scrolling; a left swipe advances the date. */
export function activitySwipeDirection(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}

export function shiftActivityDate(selected: string, amount: number, today: string): string {
  const date = new Date(`${selected}T12:00:00`);
  date.setDate(date.getDate() + amount);
  const next = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  return next > today ? today : next;
}
