// Validation logic for the Side‑Car MVP.
//
// This module exports a single function `validateSidecarRoadmap` which
// checks that a JavaScript object conforms to the `sidecar_roadmap_v1`
// contract.  It performs structural validation (required fields,
// correct types), semantic validation (unique IDs, correct status
// values, valid progress ranges), and returns a result object
// containing arrays of errors and warnings.  If any error is
// detected, the caller should not attempt to render the roadmap.

import type { SidecarRoadmap, Project, Roadmap, Phase, Item } from './types';

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate a raw object against the sidecar_roadmap_v1 contract.  This
 * function is deliberately strict: any unknown fields are ignored, but
 * missing required fields or invalid values produce errors.  Warnings
 * are produced for non‑fatal issues such as blocked items without
 * blocker_reason.
 */
export function validateSidecarRoadmap(obj: any): ValidationResult {
  const result: ValidationResult = { errors: [], warnings: [] };
  // Root must be an object and contract_version must match exactly.
  if (typeof obj !== 'object' || obj === null) {
    result.errors.push({ path: '', message: 'Payload must be an object' });
    return result;
  }
  if (obj.contract_version !== 'sidecar_roadmap_v1') {
    result.errors.push({ path: 'contract_version', message: 'contract_version must be sidecar_roadmap_v1' });
  }
  // projects array.
  if (!Array.isArray(obj.projects) || obj.projects.length === 0) {
    result.errors.push({ path: 'projects', message: 'projects must be a non‑empty array' });
    return result;
  }
  // Keep track of unique IDs at each level.
  const projectIds = new Set<string>();
  obj.projects.forEach((p: any, pIdx: number) => {
    const pPath = `projects[${pIdx}]`;
    if (typeof p.project_id !== 'string' || p.project_id.trim() === '') {
      result.errors.push({ path: `${pPath}.project_id`, message: 'project_id is required' });
    } else {
      if (projectIds.has(p.project_id)) {
        result.errors.push({ path: `${pPath}.project_id`, message: 'project_id must be unique' });
      }
      projectIds.add(p.project_id);
    }
    if (typeof p.project_name !== 'string' || p.project_name.trim() === '') {
      result.errors.push({ path: `${pPath}.project_name`, message: 'project_name is required' });
    }
    if (!Array.isArray(p.roadmaps) || p.roadmaps.length === 0) {
      result.errors.push({ path: `${pPath}.roadmaps`, message: 'roadmaps must be a non‑empty array' });
      return;
    }
    const roadmapIds = new Set<string>();
    p.roadmaps.forEach((r: any, rIdx: number) => {
      const rPath = `${pPath}.roadmaps[${rIdx}]`;
      if (typeof r.roadmap_id !== 'string' || r.roadmap_id.trim() === '') {
        result.errors.push({ path: `${rPath}.roadmap_id`, message: 'roadmap_id is required' });
      } else {
        if (roadmapIds.has(r.roadmap_id)) {
          result.errors.push({ path: `${rPath}.roadmap_id`, message: 'roadmap_id must be unique within project' });
        }
        roadmapIds.add(r.roadmap_id);
      }
      if (typeof r.roadmap_name !== 'string' || r.roadmap_name.trim() === '') {
        result.errors.push({ path: `${rPath}.roadmap_name`, message: 'roadmap_name is required' });
      }
      if (!Array.isArray(r.phases) || r.phases.length === 0) {
        result.errors.push({ path: `${rPath}.phases`, message: 'phases must be a non‑empty array' });
        return;
      }
      const phaseIds = new Set<string>();
      r.phases.forEach((ph: any, phIdx: number) => {
        const phPath = `${rPath}.phases[${phIdx}]`;
        if (typeof ph.phase_id !== 'string' || ph.phase_id.trim() === '') {
          result.errors.push({ path: `${phPath}.phase_id`, message: 'phase_id is required' });
        } else {
          if (phaseIds.has(ph.phase_id)) {
            result.errors.push({ path: `${phPath}.phase_id`, message: 'phase_id must be unique within roadmap' });
          }
          phaseIds.add(ph.phase_id);
        }
        if (typeof ph.phase_name !== 'string' || ph.phase_name.trim() === '') {
          result.errors.push({ path: `${phPath}.phase_name`, message: 'phase_name is required' });
        }
        if (!Array.isArray(ph.items) || ph.items.length === 0) {
          result.errors.push({ path: `${phPath}.items`, message: 'items must be a non‑empty array' });
          return;
        }
        const itemIds = new Set<string>();
        ph.items.forEach((it: any, itIdx: number) => {
          const itPath = `${phPath}.items[${itIdx}]`;
          if (typeof it.item_id !== 'string' || it.item_id.trim() === '') {
            result.errors.push({ path: `${itPath}.item_id`, message: 'item_id is required' });
          } else {
            if (itemIds.has(it.item_id)) {
              result.errors.push({ path: `${itPath}.item_id`, message: 'item_id must be unique within phase' });
            }
            itemIds.add(it.item_id);
          }
          if (typeof it.title !== 'string' || it.title.trim() === '') {
            result.errors.push({ path: `${itPath}.title`, message: 'title is required' });
          }
          // Validate status
          if (!['done', 'in_progress', 'blocked', 'not_started'].includes(it.status)) {
            result.errors.push({ path: `${itPath}.status`, message: 'status must be done, in_progress, blocked or not_started' });
          }
          // Validate progress for in_progress/blocked
          if (it.status === 'in_progress' || it.status === 'blocked') {
            if (typeof it.progress !== 'number') {
              result.errors.push({ path: `${itPath}.progress`, message: 'progress is required when status is in_progress or blocked' });
            } else if (it.progress < 0 || it.progress > 100) {
              result.errors.push({ path: `${itPath}.progress`, message: 'progress must be between 0 and 100' });
            }
            if (it.status === 'blocked' && !it.blocker_reason) {
              result.warnings.push({ path: `${itPath}.blocker_reason`, message: 'blocker_reason is recommended for blocked items' });
            }
          }
        });
      });
    });
  });
  return result;
}