import { addMonths, parseISO } from 'date-fns';
import { getDaysUntil } from './dateUtils';
import type { DewormingStatus } from '@/types';

// Helper to compute next due date
export const calculateNextDue = (lastDateStr: string, frequency: string): string => {
  if (!lastDateStr) return new Date().toISOString();
  const date = parseISO(lastDateStr);
  if (isNaN(date.getTime())) return new Date().toISOString();
  
  const f = (frequency || '').toLowerCase();
  
  if (f === 'monthly') return addMonths(date, 1).toISOString();
  if (f === 'bi-monthly') return addMonths(date, 2).toISOString();
  if (f === 'quarterly') return addMonths(date, 3).toISOString();
  if (f === 'yearly' || f === 'annually') return addMonths(date, 12).toISOString();
  
  // Custom or unhandled string? Fallback to monthly
  return addMonths(date, 1).toISOString();
};

export const getComputedStatus = (dateStr: string): DewormingStatus => {
  const days = getDaysUntil(dateStr);
  if (days < 0) return 'overdue';
  return 'upcoming';
};
