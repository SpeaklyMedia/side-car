import React from 'react';
import type { ValidationError } from '../validation';

export interface ErrorPanelProps {
  errors: ValidationError[];
  warnings?: ValidationError[];
  /** Called when the user wants to edit the data again. */
  onEdit: () => void;
}

/**
 * Panel to display validation errors and warnings.  Errors are
 * highlighted in red and block rendering; warnings are yellow but do
 * not block rendering.  A button is provided to return to the
 * editor to fix issues.
 */
export const ErrorPanel: React.FC<ErrorPanelProps> = ({ errors, warnings = [], onEdit }) => {
  return (
    <div className="max-w-md mx-auto p-4 mt-4 bg-red-100 border border-red-200 rounded-lg">
      <h2 className="font-semibold text-red-700 mb-2">Cannot render roadmap</h2>
      <p className="text-sm text-red-700 mb-2">Please fix the following errors in your JSON payload:</p>
      <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
        {errors.map((err, idx) => (
          <li key={idx}>
            <span className="font-mono">{err.path}</span>: {err.message}
          </li>
        ))}
      </ul>
      {warnings.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded">
          <p className="text-sm font-semibold text-yellow-700 mb-1">Warnings</p>
          <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
            {warnings.map((warn, idx) => (
              <li key={idx}>
                <span className="font-mono">{warn.path}</span>: {warn.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        className="mt-4 block w-full bg-red-600 text-white py-2 px-4 rounded shadow hover:bg-red-700 text-sm"
        onClick={onEdit}
      >
        Edit Data
      </button>
    </div>
  );
};