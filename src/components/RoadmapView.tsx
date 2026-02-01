import React, { useMemo, useState } from 'react';
import type { Roadmap, Item } from '../types';
import { computeMasterProgress, computeOverallProgress, computePhaseProgress } from '../utils';
import { PhaseCard } from './PhaseCard';
import { ProgressBar } from './ProgressBar';
import { Card } from '../ui/Card';
import { ContentScrim } from '../ui/ContentScrim';
import { Button } from '../ui/Button';
import { cn } from '../ui/cn';

type FilterKey = 'all' | 'blocked' | 'in_progress' | 'done';

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'in_progress', label: 'In‑Progress' },
  { key: 'done', label: 'Done' }
];

export interface RoadmapViewProps {
  roadmap: Roadmap;
  /** Callback when the user wants to focus on a specific item, e.g. scroll to current. */
  onFocus?: () => void;
  /** ID of the current item for highlighting. */
  currentItemId?: string;
}

/**
 * View for a roadmap. Displays a summary bar and a list of phases with
 * collapsible items.
 */
export const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmap, onFocus, currentItemId }) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
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
  // Compute counts for summary strip.
  const totalItems = roadmap.phases.reduce((sum, p) => sum + p.items.length, 0);
  const doneItems = roadmap.phases.reduce((sum, p) => sum + p.items.filter((i) => i.status === 'done').length, 0);
  const blockedItems = roadmap.phases.reduce((sum, p) => sum + p.items.filter((i) => i.status === 'blocked').length, 0);
  const overallProgress = computeOverallProgress(roadmap);
  const masterProgress = computeMasterProgress(roadmap);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const matchesFilter = (item: Item) =>
    activeFilter === 'all' ? true : item.status === activeFilter;

  const filteredPhases = useMemo(() => {
    return roadmap.phases
      .map((phase) => ({
        ...phase,
        items: phase.items.filter(matchesFilter)
      }))
      .filter((phase) => phase.items.length > 0 || activeFilter === 'all');
  }, [roadmap.phases, activeFilter]);

  return (
    <div>
      {/* Summary strip for the roadmap */}
      <Card className="p-0 mb-4">
        <ContentScrim className="space-y-3 p-3">
          {/* Master progress bar */}
          <div className="flex flex-col gap-1">
            <ProgressBar value={masterProgress} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Overall: {overallProgress}%</span>
              <span>Deliverables: {masterProgress}%</span>
              <span>Items: {totalItems}</span>
              <span>Done: {doneItems}</span>
              <span>Blocked: {blockedItems}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((opt) => (
              <Button
                key={opt.key}
                size="xs"
                variant={activeFilter === opt.key ? 'primary' : 'secondary'}
                className={cn(activeFilter === opt.key ? '' : 'text-gray-700')}
                onClick={() => setActiveFilter(opt.key)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </ContentScrim>
      </Card>
      {/* Phase cards */}
      <div className="space-y-4">
        {filteredPhases.map((phase) => (
          <PhaseCard
            key={phase.phase_id}
            phase={phase}
            expanded={!!expandedPhases[phase.phase_id]}
            onToggle={() => togglePhase(phase.phase_id)}
            currentItemId={currentItemId}
          />
        ))}
      </div>
    </div>
  );
};
