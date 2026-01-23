import type { Item, Phase, Roadmap } from './types';

/**
 * Compute the effective progress for an item. This collapses the status
 * enum and optional progress field into a single numeric 0–100 value.
 *
 * Rules:
 * - status `done` ⇒ 100 (progress ignored)
 * - status `not_started` ⇒ 0
 * - status `in_progress` or `blocked` ⇒ use `progress` (must exist)
 */
export function computeItemProgress(item: Item): number {
  switch (item.status) {
    case 'done':
      return 100;
    case 'not_started':
      return 0;
    case 'in_progress':
    case 'blocked':
      // If no progress provided, treat as 0 but this should be validated earlier.
      return typeof item.progress === 'number' ? clamp(item.progress, 0, 100) : 0;
    default:
      return 0;
  }
}

/**
 * Compute the progress of a phase by averaging item progress. If
 * compute_phase_progress is false, returns the override if provided.
 */
export function computePhaseProgress(phase: Phase): number {
  if (phase.compute_phase_progress === false && typeof phase.phase_progress_override === 'number') {
    return clamp(phase.phase_progress_override, 0, 100);
  }
  if (!phase.items || phase.items.length === 0) {
    return 0;
  }
  const total = phase.items.reduce((sum, item) => sum + computeItemProgress(item), 0);
  const avg = total / phase.items.length;
  return Math.round(avg);
}

/**
 * Compute the overall progress of a roadmap by averaging phase progress.
 * If compute_overall_progress is false, returns the override if provided.
 */
export function computeOverallProgress(roadmap: Roadmap): number {
  if (roadmap.compute_overall_progress === false && typeof roadmap.overall_progress_override === 'number') {
    return clamp(roadmap.overall_progress_override, 0, 100);
  }
  if (!roadmap.phases || roadmap.phases.length === 0) {
    return 0;
  }
  const total = roadmap.phases.reduce((sum, phase) => sum + computePhaseProgress(phase), 0);
  const avg = total / roadmap.phases.length;
  return Math.round(avg);
}

/**
 * Compute the deliverables progress for a roadmap. Counts only items
 * where `is_deliverable` is true. If none are flagged, falls back to
 * overall progress.
 */
export function computeMasterProgress(roadmap: Roadmap): number {
  const deliverableItems: Item[] = [];
  roadmap.phases.forEach((phase) => {
    phase.items.forEach((item) => {
      if (item.is_deliverable) {
        deliverableItems.push(item);
      }
    });
  });
  if (deliverableItems.length === 0) {
    return computeOverallProgress(roadmap);
  }
  const done = deliverableItems.filter((item) => item.status === 'done').length;
  const total = deliverableItems.length;
  return Math.round((done / total) * 100);
}

/**
 * Find the first item in the roadmap that is not done and is unlocked.
 * Returns an object containing the phaseId and itemId of the first
 * incomplete item, or null if all items are complete.  Items are
 * considered locked if `is_unlocked` is explicitly set to false.
 */
export function findFirstIncompleteItem(roadmap: Roadmap): { phaseId: string; itemId: string } | null {
  for (const phase of roadmap.phases) {
    for (const item of phase.items) {
      const unlocked = item.is_unlocked !== false;
      if (unlocked && item.status !== 'done') {
        return { phaseId: phase.phase_id, itemId: item.item_id };
      }
    }
  }
  return null;
}

/**
 * Utility to clamp a number between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}