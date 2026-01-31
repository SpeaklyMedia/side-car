import React, { useState } from 'react';
import type { Phase } from '../types';
import { computePhaseProgress } from '../utils';
import { ProgressBar } from './ProgressBar';

export interface PhaseCardProps {
  phase: Phase;
  /** Called when the user toggles the expand/collapse state of this phase. */
  onToggle?: () => void;
  /** Whether this phase is currently expanded. */
  expanded: boolean;
  /** ID of the current item (for highlighting), if any. */
  currentItemId?: string;
}

/**
 * Component for rendering a phase and its items. Provides a header with
 * progress and an optional collapsible body containing items.
 */
export const PhaseCard: React.FC<PhaseCardProps> = ({ phase, expanded, onToggle, currentItemId }) => {
  const phaseProgress = computePhaseProgress(phase);
  return (
    <section id={`phase-${phase.phase_id}`} className="rounded-xl bg-white/80 backdrop-blur shadow">
      {/* Phase header */}
      <header
        className="flex justify-between items-center p-3 cursor-pointer"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="flex flex-col">
          <h2 className="font-medium text-sm sm:text-base">{phase.phase_name}</h2>
          {phase.phase_desc && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{phase.phase_desc}</p>}
        </div>
        <div className="flex items-center gap-2">
          {/* Display progress as number */}
          <span className="text-sm text-gray-600">{phaseProgress}%</span>
          {/* Expand/collapse indicator */}
          <span className="text-gray-500">{expanded ? '▲' : '▼'}</span>
        </div>
      </header>
      {/* Phase items */}
      {expanded && (
        <ul className="divide-y text-sm">
          {phase.items.map((item) => {
            // Determine styling based on status
            let statusClass = '';
            let statusLabel: React.ReactNode;
            let statusIcon: React.ReactNode;
            switch (item.status) {
              case 'done':
                statusClass = 'text-green-600';
                statusLabel = 'Done';
                statusIcon = '✅';
                break;
              case 'in_progress':
                statusClass = 'text-orange-600';
                statusLabel = `${item.progress ?? 0}%`;
                statusIcon = '⏳';
                break;
              case 'blocked':
                statusClass = 'text-red-600';
                statusLabel = `${item.progress ?? 0}%`;
                statusIcon = '⛔';
                break;
              case 'not_started':
              default:
                statusClass = 'text-gray-500';
                statusLabel = 'Not started';
                statusIcon = '⭕';
            }
            // Highlight the current item, if provided
            const highlight = currentItemId && item.item_id === currentItemId;
            return (
              <li
                key={item.item_id}
                id={`item-${item.item_id}`}
                className={`p-3 flex justify-between items-center ${highlight ? 'bg-blue-50' : ''}`.trim()}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 truncate max-w-xs sm:max-w-md md:max-w-lg">{item.title}</span>
                  {/* Show detail/blocker_reason when provided */}
                  {item.detail && (
                    <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.detail}</span>
                  )}
                  {item.status === 'blocked' && item.blocker_reason && (
                    <span className="text-xs text-red-500 mt-0.5 line-clamp-1">{item.blocker_reason}</span>
                  )}
                </div>
                <span className={`font-medium ${statusClass}`}>
                  <span className="mr-1">{statusIcon}</span>
                  {statusLabel}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
