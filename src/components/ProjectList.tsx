import React from 'react';
import type { Project } from '../types';

/**
 * Project list component for the Side‑Car R1 implementation.  Displays a
 * tabbed view of active and archived projects.  When a project is
 * selected, the onSelect callback is invoked with the project_id.
 */
export interface ProjectListProps {
  /** All projects from the loaded roadmap data. */
  projects: Project[];
  /** Handler when the user selects a project. */
  onSelect: (projectId: string) => void;
  /** Currently selected tab (active or archived). */
  tab: 'active' | 'archived';
  /** Called when the user switches tabs. */
  onChangeTab: (tab: 'active' | 'archived') => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelect, tab, onChangeTab }) => {
  // R1 does not yet distinguish between active and archived projects; all
  // projects are treated as active.  In future iterations, archived
  // projects would be filtered based on lock_state/ship_state.
  const activeProjects = projects;
  const archivedProjects: Project[] = [];
  const list = tab === 'active' ? activeProjects : archivedProjects;

  const emojiForProject = (project: Project): string => {
    const text = `${project.project_name} ${project.project_desc ?? ''}`.toLowerCase();
    if (text.includes('roadmap') || text.includes('plan')) return '🗺️';
    if (text.includes('progress') || text.includes('completion')) return '🧭';
    if (text.includes('search') || text.includes('discovery') || text.includes('intent')) return '🔍';
    if (text.includes('import') || text.includes('inject')) return '🧩';
    if (text.includes('qa') || text.includes('verification')) return '🧪';
    if (text.includes('ship') || text.includes('release')) return '🚀';
    if (text.includes('ai-seo') || text.includes('seo')) return '🧠';
    if (text.includes('ops') || text.includes('governance')) return '🛡️';
    return '🛰️';
  };

  return (
    <div className="tf-wrap tf-stack">
      {/* Tab controls */}
      <div className="tf-stack" style={{ flexDirection: 'row', gap: '8px' }}>
        <button className={`tf-btn ${tab === 'active' ? 'tf-btn-primary' : ''}`} onClick={() => onChangeTab('active')}>
          Active
        </button>
        <button className={`tf-btn ${tab === 'archived' ? 'tf-btn-primary' : ''}`} onClick={() => onChangeTab('archived')}>
          Archived
        </button>
      </div>
      {/* Project cards */}
      {list.length === 0 && <p className="tf-item-muted">No projects in this category.</p>}
      <div className="tf-stack">
        {list.map((project) => (
          <div
            key={project.project_id}
            className="tf-panel"
            style={{ padding: '12px', cursor: 'pointer' }}
            onClick={() => onSelect(project.project_id)}
          >
            <div className="tf-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tf-header-emoji" aria-hidden="true">{emojiForProject(project)}</span>
              <span className="tf-sr-only">Project</span>
              {project.project_name}
            </div>
            {project.project_desc && <p className="tf-item-muted">{project.project_desc}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
