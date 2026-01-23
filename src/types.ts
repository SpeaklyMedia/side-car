// Types for the Side‑Car MVP data contracts.

// The event contract is not included here since the MVP client only needs
// the rendered state. Events are processed server side to produce this
// structure.

/**
 * Status values for an item. The order here implicitly defines
 * hierarchy when computing progress. For example, `done` implies 100%.
 */
export type Status = 'done' | 'in_progress' | 'blocked' | 'not_started';

/** Item within a phase. */
export interface Item {
  /** Unique ID for the item. */
  item_id: string;
  /** Human‑readable title. */
  title: string;
  /** Status of the item. */
  status: Status;
  /** Optional progress value (0–100) for in_progress/blocked items. */
  progress?: number;
  /** Optional detail field for display. */
  detail?: string;
  /** Optional reason if the item is blocked. */
  blocker_reason?: string;
  /** Flag if this item unlocks other items when done. */
  is_unlocked?: boolean;
  /** Optional reason explaining why an item is locked. */
  locked_reason?: string;
  /** Whether this item counts as a deliverable for the master progress bar. */
  is_deliverable?: boolean;
}

/** Phase of work within a roadmap. */
export interface Phase {
  /** Unique ID for the phase. */
  phase_id: string;
  /** Human‑readable name for the phase. */
  phase_name: string;
  /** Optional description. */
  phase_desc?: string;
  /** List of items in this phase. */
  items: Item[];
  /** If true, phase progress is computed from item progress; otherwise the override applies. */
  compute_phase_progress?: boolean;
  /** Override progress (0–100) if compute_phase_progress is false. */
  phase_progress_override?: number;
}

/** Roadmap grouping phases. */
export interface Roadmap {
  /** Unique ID for the roadmap. */
  roadmap_id: string;
  /** Human‑readable name. */
  roadmap_name: string;
  /** Optional label indicating locked scope. */
  lock_label?: string;
  /** Phases contained in this roadmap. */
  phases: Phase[];
  /** If true, overall progress is computed from phases; otherwise override applies. */
  compute_overall_progress?: boolean;
  /** Override progress (0–100) if compute_overall_progress is false. */
  overall_progress_override?: number;
  /** Whether this roadmap is treated as the master roadmap for deliverable progress. */
  is_master?: boolean;
}

/** Project grouping roadmaps. */
export interface Project {
  /** Unique ID for the project. */
  project_id: string;
  /** Human‑readable name. */
  project_name: string;
  /** Optional description. */
  project_desc?: string;
  /** List of roadmaps in this project. */
  roadmaps: Roadmap[];
  /** Optionally specify the default roadmap to open when selecting this project. */
  default_roadmap_id?: string;
}

/** Top level structure for the render contract. */
export interface SidecarRoadmap {
  /** Contract version identifier. */
  contract_version: 'sidecar_roadmap_v1';
  /** Projects contained in this payload. */
  projects: Project[];
}