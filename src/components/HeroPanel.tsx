import React from 'react';
import type { Item } from '../types';

/**
 * Props for the HeroPanel component.  The panel displays the current
 * task the user should focus on based on the hero selection rules:
 * the first in‑progress item, otherwise the first not‑started item.
 * If no items qualify, a completion message is shown.
 */
export interface HeroPanelProps {
  /**
   * When defined, contains the item and its phase name for the current
   * focus.  When null, indicates that all tasks are complete or
   * filtered out.
   */
  heroItem: { item: Item; phaseName: string } | null;
}

export const HeroPanel: React.FC<HeroPanelProps> = ({ heroItem }) => {
  if (!heroItem) {
    return (
      <div className="tf-panel tf-stack" style={{ padding: '12px' }}>
        <h3 className="tf-panel-title">All tasks completed!</h3>
        <p className="tf-item-muted">There are no incomplete tasks in this view.</p>
      </div>
    );
  }
  const { item, phaseName } = heroItem;
  return (
    <div className="tf-panel tf-stack" style={{ padding: '12px' }}>
      <div className="tf-subtitle">Current Focus</div>
      <div className="tf-panel-title">{item.title}</div>
      <div className="tf-item-muted">Phase: {phaseName}</div>
      {item.detail && <div className="tf-item-muted">{item.detail.split('\n')[0]}</div>}
    </div>
  );
};
