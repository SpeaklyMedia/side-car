import React from 'react';

export interface ProgressBarProps {
  /**
   * Progress value between 0 and 100. Values outside this range are
   * clamped.
   */
  value: number;
  /** Optional label shown over the bar (e.g. "62%"). */
  label?: string;
  /** Additional CSS classes for the wrapper. */
  className?: string;
}

/**
 * Simple progress bar component used throughout Side‑Car. The bar uses
 * relative width based on the value prop and always shows a text
 * representation of the progress on top for accessibility.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, className }) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  const displayLabel = label ?? `${clamped}%`;
  return (
    <div className={`w-full h-2 bg-gray-200 rounded overflow-hidden ${className ?? ''}`.trim()} aria-label={`Progress ${clamped}%`}>
      <div className="h-2 bg-green-500 rounded" style={{ width: `${clamped}%` }} />
      {/* Text label on top of the bar */}
      <span className="sr-only">{displayLabel}</span>
    </div>
  );
};