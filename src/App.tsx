import React, { useEffect, useMemo, useState } from 'react';
import type { SidecarRoadmap, Project, Roadmap, Item } from './types';
import { sampleData } from './sampleData';
import { fullData } from './fullData';
import { validateSidecarRoadmap, type ValidationResult } from './validation';
import { ProjectList } from './components/ProjectList';
import { RoadmapView } from './components/RoadmapView';
import { ErrorPanel } from './components/ErrorPanel';
import { ProgressBar } from './components/ProgressBar';
import { computeOverallProgress, findFirstIncompleteItem } from './utils';

export default function App() {
  const [data, setData] = useState<SidecarRoadmap>(sampleData);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [clientView, setClientView] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>(() => JSON.stringify(sampleData, null, 2));
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [forceExpandPhaseId, setForceExpandPhaseId] = useState<string | null>(null);

  const currentProject: Project | null = selectedProjectId
    ? data.projects.find((p) => p.project_id === selectedProjectId) || null
    : null;
  const currentRoadmap: Roadmap | null = currentProject && selectedRoadmapId
    ? currentProject.roadmaps.find((r) => r.roadmap_id === selectedRoadmapId) || null
    : null;

  function findUpNext(roadmap: Roadmap | null): { item: Item; phaseName: string; phaseId: string } | null {
    if (!roadmap) return null;
    for (const phase of roadmap.phases) {
      for (const item of phase.items) {
        if (clientView && !item.is_deliverable) continue;
        if (item.is_unlocked === false) continue;
        if (item.status === 'blocked') {
          return { item, phaseName: phase.phase_name, phaseId: phase.phase_id };
        }
      }
    }
    for (const phase of roadmap.phases) {
      for (const item of phase.items) {
        if (clientView && !item.is_deliverable) continue;
        if (item.is_unlocked === false) continue;
        if (item.status === 'in_progress') {
          return { item, phaseName: phase.phase_name, phaseId: phase.phase_id };
        }
      }
    }
    for (const phase of roadmap.phases) {
      for (const item of phase.items) {
        if (clientView && !item.is_deliverable) continue;
        if (item.is_unlocked === false) continue;
        if (item.status === 'not_started') {
          return { item, phaseName: phase.phase_name, phaseId: phase.phase_id };
        }
      }
    }
    return null;
  }
  const upNext = findUpNext(currentRoadmap);
  const upNextTitle = upNext ? upNext.item.title : 'Clear';
  const upNextDisplay = upNextTitle.length > 60 ? `${upNextTitle.slice(0, 60)}...` : upNextTitle;

  const heroEmoji = (() => {
    const title = currentRoadmap?.roadmap_name?.toLowerCase() ?? '';
    if (title.includes('search') || title.includes('discovery') || title.includes('intent')) return '🔍';
    if (title.includes('roadmap') || title.includes('plan')) return '🗺️';
    if (title.includes('progress') || title.includes('completion')) return '🧭';
    if (title.includes('import') || title.includes('inject')) return '🧩';
    if (title.includes('qa') || title.includes('verification')) return '🧪';
    if (title.includes('ship') || title.includes('release')) return '🚀';
    if (title.includes('ai-seo') || title.includes('seo')) return '🧠';
    if (title.includes('ops') || title.includes('governance')) return '🛡️';
    return '🛰️';
  })();

  const stats = useMemo(() => {
    if (!currentRoadmap) {
      return { total: 0, done: 0, blocked: 0, overall: 0 };
    }
    const total = currentRoadmap.phases.reduce((sum, p) => sum + p.items.length, 0);
    const done = currentRoadmap.phases.reduce((sum, p) => sum + p.items.filter((i) => i.status === 'done').length, 0);
    const blocked = currentRoadmap.phases.reduce((sum, p) => sum + p.items.filter((i) => i.status === 'blocked').length, 0);
    return {
      total,
      done,
      blocked,
      overall: computeOverallProgress(currentRoadmap)
    };
  }, [currentRoadmap]);

  const invalidData = { contract_version: 'wrong_contract', projects: [] };

  const handleImportClick = () => {
    setJsonInput(JSON.stringify(data, null, 2));
    setShowEditor(true);
  };

  const handleRenderCustom = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const result = validateSidecarRoadmap(parsed);
      setValidation(result);
      if (result.errors.length === 0) {
        setData(parsed);
        setSelectedProjectId(null);
        setSelectedRoadmapId(null);
        setFocusItemId(null);
        setForceExpandPhaseId(null);
        setShowEditor(false);
      }
    } catch (e) {
      setValidation({ errors: [{ path: '', message: 'Invalid JSON' }], warnings: [] });
    }
  };

  const handleLoadSample = () => {
    setData(sampleData);
    setSelectedProjectId(null);
    setSelectedRoadmapId(null);
    setFocusItemId(null);
    setForceExpandPhaseId(null);
    setShowEditor(false);
    setValidation(null);
  };

  const handleLoadFull = () => {
    setJsonInput(JSON.stringify(fullData, null, 2));
    const result = validateSidecarRoadmap(fullData);
    setValidation(result);
    if (result.errors.length === 0) {
      setData(fullData);
      setSelectedProjectId(null);
      setSelectedRoadmapId(null);
      setFocusItemId(null);
      setForceExpandPhaseId(null);
      setShowEditor(false);
    }
  };

  const handleLoadInvalid = () => {
    setJsonInput(JSON.stringify(invalidData, null, 2));
    const result = validateSidecarRoadmap(invalidData as unknown as SidecarRoadmap);
    setValidation(result);
    setShowEditor(true);
  };

  const handleCancelEditor = () => {
    setShowEditor(false);
  };

  const handlePrimaryAction = () => {
    if (!currentRoadmap) {
      handleImportClick();
      return;
    }
    const target = findUpNext(currentRoadmap);
    if (!target) {
      handleImportClick();
      return;
    }
    setForceExpandPhaseId(target.phaseId);
    setFocusItemId(target.item.item_id);
  };

  useEffect(() => {
    if (!focusItemId) return;
    const handle = window.setTimeout(() => {
      const el = document.getElementById(`item-${focusItemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
    return () => window.clearTimeout(handle);
  }, [focusItemId]);

  const primaryActionLabel = (() => {
    if (!currentRoadmap) return 'Import';
    if (stats.blocked > 0) return 'Resolve Blockers';
    const hasIncomplete = !!findFirstIncompleteItem(currentRoadmap);
    return hasIncomplete ? 'Resume' : 'Import';
  })();

  return (
    <div className="tf-app">
      {showEditor && (
        <div className="tf-overlay">
          <div className="tf-dialog tf-stack">
            <h2 className="tf-panel-title">Import roadmap JSON</h2>
            <textarea
              className="tf-textarea"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            {validation?.errors.length ? (
              <div className="tf-error-panel" style={{ padding: '12px' }}>
                <div className="tf-error-title">Quest Log: Import Errors</div>
                <ul className="tf-error-list">
                  {validation.errors.map((error, idx) => (
                    <li key={idx}>
                      <span>{error.path || 'root'}</span>: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="tf-stack" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <button className="tf-btn tf-btn-ghost" onClick={handleCancelEditor}>
                Cancel
              </button>
              <button className="tf-btn tf-btn-teal" onClick={handleRenderCustom}>
                Render
              </button>
              <button className="tf-btn" onClick={handleLoadSample}>
                Load Sample
              </button>
              <button className="tf-btn tf-btn-primary" onClick={handleLoadFull}>
                <span className="tf-glyph tf-glyph--focus" aria-hidden="true">⌖</span>
                Load Full Dataset
              </button>
              <button className="tf-btn" onClick={handleLoadInvalid}>
                <span className="tf-glyph tf-glyph--danger" aria-hidden="true">⊗</span>
                Load Invalid Dataset
              </button>
            </div>
          </div>
        </div>
      )}

      {validation?.errors.length && !showEditor ? (
        <ErrorPanel errors={validation.errors} warnings={validation.warnings} onEdit={() => setShowEditor(true)} />
      ) : null}

      {validation && validation.errors.length === 0 && validation.warnings && validation.warnings.length > 0 && !showEditor && (
        <div className="tf-warning-panel" style={{ margin: '16px auto', maxWidth: '720px', padding: '12px' }}>
          <div className="tf-warning-title">Rendered with warnings</div>
          <div className="tf-item-muted">See console or data for details.</div>
        </div>
      )}

      {currentProject && currentRoadmap ? (
        <>
          <header className="tf-header">
            <div className="tf-header-inner">
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setSelectedRoadmapId(null);
                  setFocusItemId(null);
                  setForceExpandPhaseId(null);
                }}
                className="tf-btn tf-btn-ghost"
              >
                ← Back
              </button>
              <h1 className="tf-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="tf-h1-emoji" aria-hidden="true">{heroEmoji}</span>
                <span className="tf-sr-only">Overview</span>
                {currentProject.project_name}
              </h1>
              <button className="tf-btn tf-btn-teal" onClick={handleImportClick}>
                Import
              </button>
            </div>
            <div className="tf-header-meta">
              {currentRoadmap.roadmap_name} {currentRoadmap.lock_label ? `• ${currentRoadmap.lock_label}` : ''}
            </div>
          </header>

          <main className="tf-wrap tf-stack">
            <section className="tf-hud tf-stack">
              <div className="tf-subtitle">IRONHUD OVERVIEW</div>
              <div className="tf-hero-title" style={{ fontSize: 'clamp(34px, 6vw, 56px)', lineHeight: 1.1, fontWeight: 700 }}>
                <span className="tf-h1-emoji" aria-hidden="true">{heroEmoji}</span>
                <span className="tf-sr-only">Overview</span>
                {currentRoadmap.roadmap_name}
              </div>
              {currentRoadmap.lock_label ? (
                <div className="tf-item-muted">{currentRoadmap.lock_label}</div>
              ) : null}
              {currentProject.project_desc ? (
                <div className="tf-item-muted">{currentProject.project_desc}</div>
              ) : null}
              <div className="tf-stack" style={{ gap: '8px' }}>
                <div className="tf-item-muted">Progress</div>
                <ProgressBar value={stats.overall} />
              </div>
              <div className="tf-hud-grid">
                <div className="tf-kpi">
                  <div className="tf-kpi-label">
                    <span className="tf-glyph tf-glyph--success" aria-hidden="true">✓</span>
                    DONE
                  </div>
                  <div className="tf-kpi-value">{stats.done}/{stats.total}</div>
                </div>
                <div className="tf-kpi">
                  <div className="tf-kpi-label">
                    <span className="tf-glyph tf-glyph--danger" aria-hidden="true">⊗</span>
                    BLOCKERS
                  </div>
                  <div className="tf-kpi-value">{stats.blocked}</div>
                </div>
                <div className="tf-kpi">
                  <div className="tf-kpi-label">
                    <span className="tf-glyph tf-glyph--focus" aria-hidden="true">▸</span>
                    UP NEXT
                  </div>
                  <div className="tf-kpi-value">{upNextDisplay}</div>
                </div>
              </div>
              <div className="tf-stack" style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="tf-btn tf-btn-primary" onClick={handlePrimaryAction}>
                  {primaryActionLabel}
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={clientView}
                    onChange={() => setClientView((v) => !v)}
                  />
                  <span className="tf-item-muted">Client View</span>
                </label>
                <span className="tf-item-muted">Client links disabled (R1.1).</span>
              </div>
            </section>

            <div className="tf-panel" style={{ padding: '16px' }}>
              <div className="tf-subtitle">WHAT'S UP NEXT</div>
              <div className="tf-panel-title">
                {upNext ? upNext.item.title : 'No active items. Import new data to continue.'}
              </div>
              {upNext ? <div className="tf-item-muted">Phase: {upNext.phaseName}</div> : null}
            </div>

            <div className="tf-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="tf-glyph tf-glyph--muted" aria-hidden="true">≡</span>
              AI-SEO OVERHAUL LEGEND
            </div>
            <div className="tf-legend">
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">☰</span>
                TASK LIST
              </div>
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">⌕</span>
                KEYWORDS / INTENT
              </div>
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">⌁</span>
                TECHNICAL / CRAWL
              </div>
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">Σ</span>
                SCHEMA
              </div>
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">≡</span>
                CONTENT / ON-PAGE
              </div>
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">⌂</span>
                LOCAL / GBP
              </div>
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">▤</span>
                GA4 / ANALYTICS
              </div>
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">⊕</span>
                COMPETITORS / SERP
              </div>
              <div className="tf-legend-item">
                <span className="tf-glyph tf-glyph--muted" aria-hidden="true">⟐</span>
                LINKS / CITATIONS
              </div>
            </div>

            <RoadmapView
              roadmap={currentRoadmap}
              currentItemId={focusItemId ?? upNext?.item.item_id}
              forceExpandPhaseId={forceExpandPhaseId}
              clientView={clientView}
            />
          </main>
        </>
      ) : (
        <>
          <header className="tf-header">
            <div className="tf-header-inner">
              <h1 className="tf-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="tf-h1-emoji" aria-hidden="true">🛰️</span>
                <span className="tf-sr-only">Overview</span>
                Side-Car Projects
              </h1>
              <button className="tf-btn tf-btn-teal" onClick={handleImportClick}>
                Import
              </button>
            </div>
          </header>
          <ProjectList
            projects={data.projects}
            tab={tab}
            onChangeTab={setTab}
            onSelect={(projectId) => {
              const project = data.projects.find((p) => p.project_id === projectId);
              if (!project) return;
              const firstRoadmapId = project.default_roadmap_id ?? project.roadmaps[0]?.roadmap_id;
              setSelectedProjectId(projectId);
              setSelectedRoadmapId(firstRoadmapId ?? null);
              setFocusItemId(null);
              setForceExpandPhaseId(null);
            }}
          />
        </>
      )}

      <div className="tf-bottom-bar">
        <div className="tf-bottom-inner">
          <button className="tf-btn tf-btn-teal" onClick={handleImportClick}>
            <span className="tf-glyph tf-glyph--focus" aria-hidden="true">⌖</span>
            Import
          </button>
          <button
            className={`tf-btn ${currentRoadmap ? '' : 'tf-btn-disabled'}`}
            onClick={() => currentRoadmap && setClientView((v) => !v)}
            disabled={!currentRoadmap}
          >
            <span className="tf-glyph tf-glyph--warning" aria-hidden="true">⧉</span>
            Filter
          </button>
          <button className="tf-btn tf-btn-ghost tf-btn-disabled" disabled>
            <span className="tf-glyph tf-glyph--muted" aria-hidden="true">⌕</span>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
