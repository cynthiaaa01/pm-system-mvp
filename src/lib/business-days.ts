import { addDays, isWeekend, isSameDay } from 'date-fns';

/**
 * Checks if a given date is a holiday based on a provided list of holidays.
 */
export function isHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some(holiday => isSameDay(date, holiday));
}

/**
 * Checks if a given date is a business day (not a weekend and not a holiday).
 */
export function isBusinessDay(date: Date, holidays: Date[]): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays);
}

/**
 * Adds a specified number of business days to a given start date.
 */
export function addBusinessDays(startDate: Date, days: number, holidays: Date[] = []): Date {
  let currentDate = new Date(startDate);
  let daysAdded = 0;

  // Handle negative days if needed, but usually we just add forward
  const direction = days > 0 ? 1 : -1;
  const targetDays = Math.abs(days);

  while (daysAdded < targetDays) {
    currentDate = addDays(currentDate, direction);
    if (isBusinessDay(currentDate, holidays)) {
      daysAdded++;
    }
  }

  return currentDate;
}

/**
 * Counts the number of business days between two dates.
 * Returns positive if toDate is after fromDate, negative otherwise.
 */
export function countBusinessDays(fromDate: Date, toDate: Date, holidays: Date[] = []): number {
  if (isSameDay(fromDate, toDate)) return 0;

  const direction = fromDate < toDate ? 1 : -1;
  let currentDate = new Date(fromDate);
  let count = 0;

  while (!isSameDay(currentDate, toDate)) {
    currentDate = addDays(currentDate, direction);
    if (isBusinessDay(currentDate, holidays)) {
      count += direction;
    }
  }

  return count;
}
