import React, { useEffect, useState } from 'react';
import type { Roadmap } from '../types';
import { computePhaseProgress } from '../utils';
import { PhaseCard } from './PhaseCard';

export interface RoadmapViewProps {
  roadmap: Roadmap;
  /** Callback when the user wants to focus on a specific item, e.g. scroll to current. */
  onFocus?: () => void;
  /** ID of the current item for highlighting. */
  currentItemId?: string;
  /** When provided, ensure the matching phase is expanded. */
  forceExpandPhaseId?: string | null;
  /** Whether the view is in Client View mode (deliverable filtering). */
  clientView?: boolean;
}

/**
 * View for a roadmap. Displays a summary bar and a list of phases with
 * collapsible items.
 */
export const RoadmapView: React.FC<RoadmapViewProps> = ({
  roadmap,
  onFocus,
  currentItemId,
  forceExpandPhaseId,
  clientView
}) => {
  // Track which phases are expanded. Default: first incomplete phase expanded.
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    let firstIncompleteFound = false;
    roadmap.phases.forEach((phase) => {
      const progress = computePhaseProgress(phase);
      if (!firstIncompleteFound && progress < 100) {
        map[phase.phase_id] = true;
        firstIncompleteFound = true;
      } else {
        map[phase.phase_id] = false;
      }
    });
    return map;
  });

  useEffect(() => {
    if (!forceExpandPhaseId) return;
    setExpandedPhases((prev) => ({ ...prev, [forceExpandPhaseId]: true }));
  }, [forceExpandPhaseId]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  return (
    <div className="tf-stack">
      {roadmap.phases.map((phase) => (
        <PhaseCard
          key={phase.phase_id}
          phase={phase}
          expanded={!!expandedPhases[phase.phase_id]}
          onToggle={() => togglePhase(phase.phase_id)}
          currentItemId={currentItemId}
          clientView={clientView}
        />
      ))}
    </div>
  );
};
