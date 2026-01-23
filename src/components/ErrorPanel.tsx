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
    <div className="tf-panel tf-error-panel" style={{ margin: '16px auto', maxWidth: '720px', padding: '16px' }}>
      <h2 className="tf-error-title">Quest Log: Import Errors</h2>
      <p className="tf-item-muted">Repair the payload to continue the run.</p>
      <ul className="tf-error-list">
        {errors.map((err, idx) => (
          <li key={idx}>
            <span>{err.path || 'root'}</span>: {err.message}
          </li>
        ))}
      </ul>
      {warnings.length > 0 && (
        <div className="tf-warning-panel" style={{ marginTop: '12px', padding: '12px' }}>
          <p className="tf-warning-title">Warnings</p>
          <ul className="tf-item-muted" style={{ marginTop: '8px', paddingLeft: '16px' }}>
            {warnings.map((warn, idx) => (
              <li key={idx}>
                <span>{warn.path || 'root'}</span>: {warn.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button className="tf-btn tf-btn-primary" style={{ marginTop: '12px', width: '100%' }} onClick={onEdit}>
        Edit Data
      </button>
    </div>
  );
};
