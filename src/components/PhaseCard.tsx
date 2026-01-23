import React from 'react';
import type { Phase, Item } from '../types';
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
  /**
   * Whether the UI is in Client View mode.  When true, only items with
   * `is_deliverable === true` will be displayed; others are hidden.
   */
  clientView?: boolean;
}

/**
 * Component for rendering a phase and its items. Provides a header with
 * progress summary and a collapsible body containing items.
 */
export const PhaseCard: React.FC<PhaseCardProps> = ({ phase, expanded, onToggle, currentItemId, clientView }) => {
  const phaseProgress = computePhaseProgress(phase);
  const visibleItems = clientView ? phase.items.filter((item) => item.is_deliverable) : phase.items;
  const doneItems = visibleItems.filter((item) => item.status === 'done').length;
  const blockedItems = visibleItems.filter((item) => item.status === 'blocked').length;

  const glyphForText = (text: string): { glyph: string; label: string } => {
    const lower = text.toLowerCase();
    if (lower.includes('schema')) return { glyph: 'Σ', label: 'Schema' };
    if (lower.includes('local') || lower.includes('gbp')) return { glyph: '⌂', label: 'Local' };
    if (lower.includes('ga4') || lower.includes('analytics')) return { glyph: '▤', label: 'Analytics' };
    if (lower.includes('competitor') || lower.includes('serp')) return { glyph: '⊕', label: 'Competitors' };
    if (lower.includes('content') || lower.includes('on-page')) return { glyph: '≡', label: 'Content' };
    if (lower.includes('technical') || lower.includes('crawl')) return { glyph: '⌁', label: 'Technical' };
    if (lower.includes('keyword') || lower.includes('intent') || lower.includes('search')) return { glyph: '⌕', label: 'Keywords' };
    if (lower.includes('links') || lower.includes('citations')) return { glyph: '⟐', label: 'Links' };
    return { glyph: '☰', label: 'Tasks' };
  };

  const emojiForText = (text: string): { emoji: string; label: string } => {
    const lower = text.toLowerCase();
    if (lower.includes('search') || lower.includes('discovery') || lower.includes('intent')) return { emoji: '🔍', label: 'Search' };
    if (lower.includes('roadmap') || lower.includes('plan')) return { emoji: '🗺️', label: 'Roadmap' };
    if (lower.includes('progress') || lower.includes('completion')) return { emoji: '🧭', label: 'Progress' };
    if (lower.includes('import') || lower.includes('inject')) return { emoji: '🧩', label: 'Import' };
    if (lower.includes('qa') || lower.includes('verification')) return { emoji: '🧪', label: 'QA' };
    if (lower.includes('ship') || lower.includes('release')) return { emoji: '🚀', label: 'Ship' };
    if (lower.includes('ai-seo') || lower.includes('seo')) return { emoji: '🧠', label: 'AI-SEO' };
    if (lower.includes('ops') || lower.includes('governance')) return { emoji: '🛡️', label: 'Governance' };
    return { emoji: '🛰️', label: 'Overview' };
  };

  const glyphForItem = (item: Item): { glyph: string; label: string } => {
    const base = `${item.title} ${item.detail ?? ''} ${item.blocker_reason ?? ''}`;
    return glyphForText(base);
  };

  // Track which items are expanded to reveal their nested details.
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  function parseDetails(detail?: string): { level: number; text: string }[] {
    if (!detail) return [];
    return detail
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const match = line.match(/^(\s*)([-*•])\s+(.*)$/);
        if (match) {
          const indent = match[1].length;
          const level = Math.floor(indent / 2);
          return { level, text: match[3].trim() };
        }
        return { level: 0, text: line.trim() };
      });
  }

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const statusBadge = (item: Item): { label: string; className: string } => {
    switch (item.status) {
      case 'done':
        return { label: 'Done', className: 'tf-badge tf-badge--done' };
      case 'in_progress':
        return { label: `${item.progress ?? 0}%`, className: 'tf-badge tf-badge--progress' };
      case 'blocked':
        return { label: `${item.progress ?? 0}%`, className: 'tf-badge tf-badge--blocked' };
      case 'not_started':
      default:
        return { label: 'Queued', className: 'tf-badge tf-badge--idle' };
    }
  };

  return (
    <section className="tf-panel">
      <header className="tf-panel-header" onClick={onToggle} aria-expanded={expanded}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="tf-header-emoji" aria-hidden="true">
            {emojiForText(`${phase.phase_name} ${phase.phase_desc ?? ''}`).emoji}
          </span>
          <span className="tf-sr-only">
            {emojiForText(`${phase.phase_name} ${phase.phase_desc ?? ''}`).label}
          </span>
          <span className="tf-glyph tf-glyph--accent" aria-hidden="true">
            {glyphForText(`${phase.phase_name} ${phase.phase_desc ?? ''}`).glyph}
          </span>
          <span className="tf-sr-only">
            Category {glyphForText(`${phase.phase_name} ${phase.phase_desc ?? ''}`).label}
          </span>
          <div>
            <div className="tf-panel-title">{phase.phase_name}</div>
            {phase.phase_desc && <div className="tf-panel-desc">{phase.phase_desc}</div>}
          </div>
        </div>
        <div className="tf-stack" style={{ alignItems: 'flex-end', gap: '6px' }}>
          <div className="tf-item-muted">{doneItems}/{visibleItems.length} done</div>
          {blockedItems > 0 && <span className="tf-badge tf-badge--blocked">{blockedItems} blockers</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '120px' }}>
            <ProgressBar value={phaseProgress} className="tf-progress-compact" />
            <span className="tf-item-muted">{phaseProgress}%</span>
            <span className="tf-item-muted">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </header>
      {expanded && (
        <div className="tf-panel-body">
          <ul>
            {visibleItems.map((item, idx) => {
              const highlight = currentItemId && item.item_id === currentItemId;
              const hasBullets = item.detail && parseDetails(item.detail).length > 0;
              const isOpen = expandedItems[item.item_id] === true;
              const badge = statusBadge(item);
              return (
                <li key={item.item_id} className={idx === 0 ? '' : 'tf-item-divider'}>
                  <div
                    className={`tf-item-row ${highlight ? 'tf-item-highlight' : ''}`.trim()}
                    onClick={() => (hasBullets ? toggleItem(item.item_id) : undefined)}
                  >
                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                      <span className={`tf-glyph ${item.status === 'done' ? 'tf-glyph--success' : item.status === 'blocked' ? 'tf-glyph--danger' : item.status === 'in_progress' ? 'tf-glyph--focus' : 'tf-glyph--warning'}`} aria-hidden="true">
                        {glyphForItem(item).glyph}
                      </span>
                      <span className="tf-sr-only">Category {glyphForItem(item).label}</span>
                      <div>
                        <div className="tf-item-title">{item.title}</div>
                        {item.status === 'blocked' && item.blocker_reason && (
                          <div className="tf-item-blocker">{item.blocker_reason}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={badge.className}>{badge.label}</span>
                      {hasBullets && <span className="tf-item-muted">{isOpen ? '▲' : '▼'}</span>}
                    </div>
                  </div>
                  {hasBullets && isOpen && (
                    <ul style={{ padding: '0 12px 12px', marginTop: '4px' }}>
                      {parseDetails(item.detail).map((entry, entryIdx) => (
                        <li key={entryIdx} className="tf-item-muted" style={{ marginLeft: `${entry.level * 1.25}rem` }}>
                          • {entry.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
};
