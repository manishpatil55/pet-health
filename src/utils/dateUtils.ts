import {
  format,
  formatDistanceToNow,
  differenceInDays,
  differenceInYears,
  differenceInMonths,
  parseISO,
  isAfter,
  isBefore,
  isToday,
  addDays,
} from 'date-fns';

/**
 * Format a date string to a human-readable format
 * e.g. "Mar 15, 2025"
 */
export const formatDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'MMM d, yyyy');
};

/**
 * Format a date for short display
 * e.g. "Mar 15"
 */
export const formatDateShort = (dateStr: string): string => {
  return format(parseISO(dateStr), 'MMM d');
};

/**
 * Format a date for input fields
 * e.g. "2025-03-15"
 */
export const formatDateInput = (dateStr: string): string => {
  return format(parseISO(dateStr), 'yyyy-MM-dd');
};

/**
 * Get relative time distance
 * e.g. "3 days ago", "in 2 weeks"
 */
export const getRelativeTime = (dateStr: string): string => {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
};

/**
 * Calculate age from date of birth
 * Returns string like "2 years", "6 months", "14 days"
 */
export const calculateAge = (dateOfBirth: string): string => {
  const dob = parseISO(dateOfBirth);
  const now = new Date();

  const years = differenceInYears(now, dob);
  if (years >= 1) {
    const months = differenceInMonths(now, dob) % 12;
    return months > 0 ? `${years}y ${months}m` : `${years}y`;
  }

  const months = differenceInMonths(now, dob);
  if (months >= 1) {
    return `${months} month${months > 1 ? 's' : ''}`;
  }

  const days = differenceInDays(now, dob);
  return `${days} day${days !== 1 ? 's' : ''}`;
};

/**
 * Get days until a future date (positive) or days overdue (negative)
 */
export const getDaysUntil = (dateStr: string): number => {
  const date = parseISO(dateStr);
  return differenceInDays(date, new Date());
};

/**
 * Determine if a date is in the past
 */
export const isPastDate = (dateStr: string): boolean => {
  return isBefore(parseISO(dateStr), new Date());
};

/**
 * Determine if a date is in the future
 */
export const isFutureDate = (dateStr: string): boolean => {
  return isAfter(parseISO(dateStr), new Date());
};

/**
 * Determine if a date is today
 */
export const isDateToday = (dateStr: string): boolean => {
  return isToday(parseISO(dateStr));
};

/**
 * Check if a date is within the next N days
 */
export const isWithinDays = (dateStr: string, days: number): boolean => {
  const date = parseISO(dateStr);
  const now = new Date();
  const futureDate = addDays(now, days);
  return isAfter(date, now) && isBefore(date, futureDate);
};

/**
 * Format a countdown string
 * e.g. "5 days left", "3 days overdue"
 */
export const formatCountdown = (dateStr: string): string => {
  const days = getDaysUntil(dateStr);
  if (days === 0) return 'Today';
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
  return `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`;
};
