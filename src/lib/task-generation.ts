// ============================================================
// PM System - Task Generation from Quotation Items
// ============================================================

import { addDays } from 'date-fns';
import { REFERENCE_POINT_PROJECT_FIELDS } from './constants';

export interface ProjectDates {
  start_date: string | null;
  event_online_date: string | null;
  event_end_date: string | null;
  material_confirm_date: string | null;
  physical_event_date: string | null;
  system_online_date: string | null;
  monthly_settle_date: string | null;
}

export interface TemplateRow {
  item_name: string;
  task_category: string;
  task_name: string;
  reference_point: string;
  offset_days: number;
  duration_days: number;
  sort_order: number;
}

export interface GeneratedTask {
  title: string;
  source_item: string;
  task_category: string;
  reference_point: string;
  offset_days: number;
  duration_days: number;
  start_date: string | null;
  due_date: string | null;
  sort_order: number;
  status: 'todo';
  priority: 'medium';
}

/**
 * Resolves a reference point name to an actual date from project dates.
 */
export function resolveReferenceDate(
  refPoint: string,
  projectDates: ProjectDates
): Date | null {
  const fieldName = REFERENCE_POINT_PROJECT_FIELDS[refPoint];
  if (!fieldName) return null;

  const dateStr = (projectDates as any)[fieldName];
  if (!dateStr) return null;

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Calculates the start and due dates for a task based on reference date, offset, and duration.
 */
export function calculateTaskDates(
  refDate: Date | null,
  offsetDays: number,
  durationDays: number
): { startDate: string | null; dueDate: string | null } {
  if (!refDate) {
    return { startDate: null, dueDate: null };
  }

  const start = addDays(refDate, offsetDays);
  const due = addDays(start, Math.max(durationDays - 1, 0));

  return {
    startDate: start.toISOString().split('T')[0],
    dueDate: due.toISOString().split('T')[0],
  };
}

/**
 * Generates tasks from matched quotation item templates.
 */
export function generateTasksFromTemplates(
  templates: TemplateRow[],
  projectDates: ProjectDates
): GeneratedTask[] {
  let globalSort = 0;

  return templates.map((t) => {
    globalSort++;
    const refDate = resolveReferenceDate(t.reference_point, projectDates);
    const { startDate, dueDate } = calculateTaskDates(
      refDate,
      t.offset_days,
      t.duration_days
    );

    return {
      title: t.task_name,
      source_item: t.item_name,
      task_category: t.task_category,
      reference_point: t.reference_point,
      offset_days: t.offset_days,
      duration_days: t.duration_days,
      start_date: startDate,
      due_date: dueDate,
      sort_order: globalSort,
      status: 'todo' as const,
      priority: 'medium' as const,
    };
  });
}

/**
 * Recalculates task dates when a project reference date changes.
 * Returns the updated task data for batch update.
 */
export function recalculateTaskDates(
  tasks: { id: string; reference_point: string | null; offset_days?: number; duration_days?: number }[],
  projectDates: ProjectDates
): { id: string; start_date: string | null; due_date: string | null }[] {
  return tasks
    .filter((t) => t.reference_point)
    .map((t) => {
      const refDate = resolveReferenceDate(t.reference_point!, projectDates);
      const { startDate, dueDate } = calculateTaskDates(
        refDate,
        t.offset_days || 0,
        t.duration_days || 1
      );
      return { id: t.id, start_date: startDate, due_date: dueDate };
    });
}

/**
 * Fuzzy matches an item name from AI-parsed results against template item names.
 * Returns matched template item names.
 */
export function fuzzyMatchItems(
  parsedItemName: string,
  templateItemNames: string[]
): string[] {
  const normalized = parsedItemName.trim().toLowerCase();

  // 1. Exact match
  const exact = templateItemNames.find(
    (t) => t.trim().toLowerCase() === normalized
  );
  if (exact) return [exact];

  // 2. Contains match — template name contains the parsed name or vice versa
  const containsMatches = templateItemNames.filter((t) => {
    const tNorm = t.trim().toLowerCase();
    return tNorm.includes(normalized) || normalized.includes(tNorm);
  });
  if (containsMatches.length > 0) return containsMatches;

  // 3. Token overlap — at least 60% of tokens match
  const parsedTokens = normalized.split(/[\s/()（）、,，]+/).filter(Boolean);
  const tokenMatches = templateItemNames.filter((t) => {
    const tTokens = t.trim().toLowerCase().split(/[\s/()（）、,，]+/).filter(Boolean);
    const overlap = parsedTokens.filter((pt) =>
      tTokens.some((tt) => tt.includes(pt) || pt.includes(tt))
    );
    return overlap.length >= Math.ceil(parsedTokens.length * 0.6);
  });

  return tokenMatches;
}
