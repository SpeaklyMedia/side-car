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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-md p-4 shadow-lg">
        <h3 className="font-semibold mb-2">Select Roadmap</h3>
        {/* Search input */}
        <div className="mb-3">
          <label htmlFor="roadmap-search" className="sr-only">
            Search projects or roadmaps
          </label>
          <input
            id="roadmap-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm"
            placeholder="Search projects or roadmaps"
          />
        </div>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="text-sm text-gray-500">No results</div>
          ) : (
            filteredProjects.map((project) => (
              <div key={project.project_id} className="border rounded-lg overflow-hidden">
                <button
                  type="button"
                  role="button"
                  className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 font-medium"
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
                    className={`w-full text-left px-6 py-2 border-t text-sm ${
                      project.project_id === selectedProjectId && roadmap.roadmap_id === selectedRoadmapId
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-white hover:bg-gray-50'
                    }`}
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
          className="mt-4 w-full text-center py-2 text-blue-600 font-medium"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};