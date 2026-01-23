import React, { useState } from 'react';
import type { Project } from '../types';

export interface RoadmapSelectorProps {
  projects: Project[];
  /** Currently selected project id. */
  selectedProjectId: string;
  /** Currently selected roadmap id. */
  selectedRoadmapId: string;
  /** Called when the user selects a project and roadmap. */
  onSelect: (projectId: string, roadmapId: string) => void;
  /** Whether the selector is visible. */
  open: boolean;
  /** Called when the user closes the selector without changing selection. */
  onClose: () => void;
}

/**
 * Simple modal selector for choosing project and roadmap. This is a basic
 * implementation; in a real mobile environment you may want to implement
 * a true bottom sheet using a dialog or portal. This component stays in
 * scope by focusing purely on selecting among existing projects/roadmaps.
 */
export const RoadmapSelector: React.FC<RoadmapSelectorProps> = ({
  projects,
  selectedProjectId,
  selectedRoadmapId,
  onSelect,
  open,
  onClose,
}) => {
  if (!open) return null;
  // Local search state for filtering projects and roadmaps. Filtering is
  // case-insensitive and matches either the project name or any of its
  // roadmaps names.  This makes it easier for users to find the
  // appropriate selection when many projects exist.
  const [searchTerm, setSearchTerm] = useState('');

  const term = searchTerm.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => {
    if (!term) return true;
    const projectMatch = project.project_name.toLowerCase().includes(term);
    const roadmapMatch = project.roadmaps.some((r) => r.roadmap_name.toLowerCase().includes(term));
    return projectMatch || roadmapMatch;
  });

  return (
    <div className="tf-overlay" role="dialog" aria-modal="true">
      <div className="tf-dialog">
        <h3 className="tf-panel-title">Select Roadmap</h3>
        {/* Search input */}
        <div style={{ marginTop: '8px' }}>
          <label htmlFor="roadmap-search" className="tf-sr-only">
            Search projects or roadmaps
          </label>
          <input
            id="roadmap-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tf-input"
            placeholder="Search projects or roadmaps"
          />
        </div>
        <div className="tf-stack" style={{ marginTop: '12px', maxHeight: '320px', overflowY: 'auto' }}>
          {filteredProjects.length === 0 ? (
            <div className="tf-item-muted">No results</div>
          ) : (
            filteredProjects.map((project) => (
              <div key={project.project_id} className="tf-panel">
                <button
                  type="button"
                  role="button"
                  className="tf-btn tf-btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => {
                    // Placeholder for potential collapse logic
                  }}
                >
                  {project.project_name}
                </button>
                {/* Roadmaps list */}
                {project.roadmaps.map((roadmap) => (
                  <button
                    type="button"
                    role="button"
                    key={roadmap.roadmap_id}
                    className={`tf-btn tf-btn-ghost ${
                      project.project_id === selectedProjectId && roadmap.roadmap_id === selectedRoadmapId
                        ? 'tf-btn-teal'
                        : ''
                    }`}
                    style={{ width: '100%', justifyContent: 'flex-start', borderTop: '2px solid var(--tf-border)' }}
                    onClick={() => {
                      onSelect(project.project_id, roadmap.roadmap_id);
                      onClose();
                    }}
                  >
                    {roadmap.roadmap_name}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          role="button"
          className="tf-btn tf-btn-ghost"
          style={{ marginTop: '12px', width: '100%' }}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
