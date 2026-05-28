// ============================================================
// PM System - Utility Functions
// ============================================================

import type { Task, TaskStatus } from '@/types/database';

// =========================
// Class Name Utility
// =========================

/**
 * Combines class names, filtering out falsy values.
 * A lightweight alternative to clsx/classnames.
 *
 * @example
 * cn('base', isActive && 'active', hasError && 'error')
 * // => 'base active' (if isActive is true, hasError is false)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// =========================
// Date Formatting
// =========================

/**
 * Formats a date string or Date object into Chinese locale format.
 *
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormat options override
 * @returns Formatted date string (e.g., "2026/05/28")
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  });
}

/**
 * Formats a date with time in Chinese locale.
 *
 * @param date - ISO date string or Date object
 * @returns Formatted datetime string (e.g., "2026/05/28 14:30")
 */
export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Formats a date as a relative time string (e.g., "3 天前", "剛剛").
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return '剛剛';
  if (diffMinutes < 60) return `${diffMinutes} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;

  return formatDate(d);
}

// =========================
// Currency Formatting
// =========================

/**
 * Formats a number as currency in Chinese locale (TWD by default).
 *
 * @param amount - The numeric amount
 * @param currency - Currency code (default: 'TWD')
 * @returns Formatted currency string (e.g., "NT$1,234,567")
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'TWD'
): string {
  if (amount == null) return '-';

  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a large number in a compact form (e.g., "123萬").
 */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value == null) return '-';

  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}億`;
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toFixed(1)}萬`;
  }
  return value.toLocaleString('zh-TW');
}

// =========================
// Avatar / Initials
// =========================

/**
 * Extracts initials from a full name for avatar fallback.
 * Handles both Chinese names and English names.
 *
 * @param name - Full name string
 * @returns 1-2 character initials
 *
 * @example
 * getInitials('張小明') // => '張'
 * getInitials('John Doe') // => 'JD'
 * getInitials('Alice') // => 'AL'
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || name.trim().length === 0) return '?';

  const trimmed = name.trim();

  // Check if the name contains CJK characters
  const isCJK = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(trimmed);

  if (isCJK) {
    // For CJK names, return the first character (typically the surname)
    return trimmed.charAt(0);
  }

  // For Western names, return first letters of first and last name
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// =========================
// Progress Calculation
// =========================

/**
 * Calculates project progress percentage based on task statuses.
 *
 * @param tasks - Array of tasks (or task-like objects with status)
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
  tasks: Pick<Task, 'status'>[] | null | undefined
): number {
  if (!tasks || tasks.length === 0) return 0;

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  return Math.round((completedCount / tasks.length) * 100);
}

/**
 * Returns a summary of task statuses for a project.
 */
export function getTaskStatusSummary(
  tasks: Pick<Task, 'status'>[] | null | undefined
): Record<TaskStatus, number> {
  const summary: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
    delayed: 0,
  };

  if (!tasks) return summary;

  for (const task of tasks) {
    summary[task.status]++;
  }

  return summary;
}

// =========================
// Due Date Utilities
// =========================

/**
 * Checks if a given date is overdue (past the current date).
 *
 * @param dueDate - ISO date string or Date object
 * @returns true if the date is in the past
 */
export function isOverdue(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false;

  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  if (isNaN(d.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  return d < today;
}

/**
 * Calculates the number of days until a due date.
 * Returns negative values for overdue dates.
 *
 * @param dueDate - ISO date string or Date object
 * @returns Number of days until due (negative if overdue), or null if no date
 */
export function getDaysUntilDue(
  dueDate: string | Date | null | undefined
): number | null {
  if (!dueDate) return null;

  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  if (isNaN(d.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffMs = d.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Returns a human-readable label for the due date urgency.
 */
export function getDueDateLabel(dueDate: string | Date | null | undefined): string {
  const days = getDaysUntilDue(dueDate);
  if (days === null) return '';

  if (days < 0) return `逾期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  if (days === 1) return '明天到期';
  if (days <= 3) return `${days} 天後到期`;
  if (days <= 7) return `${days} 天後到期`;

  return formatDate(dueDate);
}

// =========================
// Slack Integration
// =========================

/**
 * Generates a Slack mention string for a user ID.
 *
 * @param userId - Slack user ID
 * @returns Slack mention string (e.g., "<@U12345>")
 */
export function generateSlackMention(userId: string): string {
  if (!userId || userId.trim().length === 0) return '';
  return `<@${userId.trim()}>`;
}

// =========================
// Miscellaneous
// =========================

/**
 * Truncates a string to a maximum length with ellipsis.
 */
export function truncate(str: string | null | undefined, maxLength: number = 50): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Generates a deterministic color from a string (for avatars, tags, etc.).
 */
export function stringToColor(str: string): string {
  const colors = [
    '#6c5ce7', '#a29bfe', '#74b9ff', '#0984e3',
    '#00b894', '#00cec9', '#fdcb6e', '#e17055',
    '#d63031', '#e84393', '#fd79a8', '#636e72',
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Safely parses a JSON string, returning a default value on failure.
 */
export function safeJsonParse<T>(json: string | null | undefined, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}
