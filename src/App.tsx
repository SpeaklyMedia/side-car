import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { SidecarRoadmap, Project, Roadmap } from './types';
import { sampleData } from './sampleData';
import { validateSidecarRoadmap, type ValidationResult } from './validation';
import { findFirstIncompleteItem, computeMasterProgress, computeOverallProgress, computePhaseProgress } from './utils';
import { ErrorPanel } from './components/ErrorPanel';
import { RoadmapView } from './components/RoadmapView';
import { RoadmapSelector } from './components/RoadmapSelector';
import { VisualsHUD, SceneBackground, usePrefersReducedMotion, useScenePulse, type LiveStatus, type VisualsPhaseNavItem } from './visuals/app';

/**
 * Main application component for the Side‑Car MVP. This component
 * orchestrates the loaded roadmap data, selection of projects and
 * roadmaps, and manages idle detection to show the return‑to‑current
 * task button.
 */
function App() {
  // Load the roadmap data.  Initially we use the sampleData, but
  // the user may replace it by importing JSON or via dynamic updates.
  const [data, setData] = useState<SidecarRoadmap>(sampleData);
  /**
   * Selected project ID. When null, the home screen (project index) is shown.
   */
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  /**
   * Selected roadmap ID within the selected project. When null, the first roadmap
   * in the project will be used.
   */
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  // Bottom sheet visibility.
  const [showSelector, setShowSelector] = useState(false);
  // Return button visibility.
  const [showReturn, setShowReturn] = useState(false);
  // Editor overlay visibility and content.
  const [showEditor, setShowEditor] = useState(false);
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(sampleData, null, 2));
  // Validation result for the currently loaded data or the draft in the editor.
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  // Currently focused item (phaseId + itemId).  Used to scroll to the next
  // actionable item when the user taps the return button or when a new
  // dynamic update arrives.
  const [currentItem, setCurrentItem] = useState<{ phaseId: string; itemId: string } | null>(null);

  // UI-only metadata (does not affect ingestion/state semantics)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(() => new Date());
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('offline');

  // Idle detection: show return button after 7 seconds of inactivity when user
  // has scrolled or navigated away. We track last interaction time.
  const lastInteractionRef = useRef<number>(Date.now());
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Visuals Hot-Swap (UI-only wiring)
  const reduceMotion = usePrefersReducedMotion();
  const { sceneId, pulse: pulseScene } = useScenePulse(reduceMotion);

  // Helper: get the current project and roadmap.
  const currentProject: Project | undefined = selectedProjectId
    ? data.projects.find((p) => p.project_id === selectedProjectId)
    : undefined;
  const currentRoadmap: Roadmap | undefined = currentProject && selectedRoadmapId
    ? currentProject.roadmaps.find((r) => r.roadmap_id === selectedRoadmapId)
    : undefined;

  // Derived metrics for the visuals layer (read-only, computed from currentRoadmap)
  const overallProgress = currentRoadmap ? computeOverallProgress(currentRoadmap) : 0;
  const masterProgress = currentRoadmap ? computeMasterProgress(currentRoadmap) : 0;

  const totalItems = currentRoadmap
    ? currentRoadmap.phases.reduce((sum, ph) => sum + (ph.items?.length ?? 0), 0)
    : 0;

  const doneItems = currentRoadmap
    ? currentRoadmap.phases.reduce((sum, ph) => sum + ph.items.filter((i) => i.status === 'done').length, 0)
    : 0;

  const activePhaseId = currentItem?.phaseId ?? null;
  const activePhase = currentRoadmap && activePhaseId
    ? currentRoadmap.phases.find((p) => p.phase_id === activePhaseId)
    : undefined;

  const activePhaseLabel =
    activePhase?.phase_name ?? (currentRoadmap?.phases?.[0]?.phase_name ?? '—');

  const activePhaseIndex =
    currentRoadmap && activePhaseId
      ? Math.max(0, currentRoadmap.phases.findIndex((p) => p.phase_id === activePhaseId))
      : 0;

  const activePhaseProgress01 = activePhase ? computePhaseProgress(activePhase) / 100 : 0;

  const phasesNav: VisualsPhaseNavItem[] = currentRoadmap
    ? currentRoadmap.phases.map((p) => ({
        phaseId: p.phase_id,
        label: p.phase_name,
        progress01: computePhaseProgress(p) / 100
      }))
    : [];

  const overallProgress01 = overallProgress / 100;
  const masterProgress01 = masterProgress / 100;

  const lastUpdatedLabel = lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const jumpToPhase = useCallback((phaseId: string) => {
    const el = document.getElementById(`phase-${phaseId}`);
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [reduceMotion]);


  // Reset the idle timer on user interaction.
  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    setShowReturn(false);
    idleTimeoutRef.current = setTimeout(() => {
      // Only show return button if user is away from top (we can't detect scroll
      // to current item without a more complex implementation, so we show it always).
      setShowReturn(true);
    }, 7000);
  }, []);

  // Set up global event listeners for idle detection.
  useEffect(() => {
    const events = ['scroll', 'click', 'touchmove', 'keydown'];
    events.forEach((ev) => document.addEventListener(ev, handleInteraction));
    // Immediately start idle timer on mount.
    handleInteraction();
    return () => {
      events.forEach((ev) => document.removeEventListener(ev, handleInteraction));
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [handleInteraction]);

  // On mount, set up Server-Sent Events (SSE) if configured.  If
  // import.meta.env.VITE_SIDECAR_STREAM_URL is defined, the app will
  // connect and listen for messages containing a full `SidecarRoadmap`
  // object.  Each message should be JSON; if the payload validates
  // without errors, the data is replaced and warnings stored.  This
  // enables dynamic content updates.
  useEffect(() => {
    const streamUrl = (import.meta as any).env?.VITE_SIDECAR_STREAM_URL as string | undefined;
    if (!streamUrl) {
      setLiveStatus('offline');
      return;
    }
    const es = new EventSource(streamUrl);
    // Mark live once the stream opens.
    es.onopen = () => setLiveStatus('live');
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data);
        const result = validateSidecarRoadmap(parsed);
        if (result.errors.length === 0) {
          setData(parsed);
          setLastUpdatedAt(new Date());
          setLiveStatus('live');
          // Reset selection to home screen upon incoming dynamic update.
          setSelectedProjectId(null);
          setSelectedRoadmapId(null);
          setValidation(result);
          // Compute the current item from the first project/roadmap in the incoming state.
          if (parsed.projects && parsed.projects.length > 0) {
            const p0 = parsed.projects[0];
            if (p0.roadmaps && p0.roadmaps.length > 0) {
              const r0 = p0.roadmaps[0];
              const ci = findFirstIncompleteItem(r0);
              setCurrentItem(ci);
            }
          }
        } else {
          console.error('Dynamic update contained errors', result.errors);
        }
      } catch (e) {
        console.error('Failed to parse dynamic update', e);
      }
    };
    es.onerror = (ev) => {
      console.warn('SSE connection error', ev);
      setLiveStatus('error');
    };
    return () => {
      es.close();
    };
  }, []);

  // On mount, fetch the initial state from a state URL if provided.
  // If VITE_SIDECAR_STATE_URL is defined, the app will fetch that URL
  // once on mount to initialize the roadmap data.  A successful fetch
  // replaces the default sample data with the remote state.  This
  // complements the SSE stream: if SSE is configured, it will
  // subsequently keep the state updated.
  useEffect(() => {
    const stateUrl = (import.meta as any).env?.VITE_SIDECAR_STATE_URL as string | undefined;
    if (!stateUrl) return;
    let cancelled = false;
    fetch(stateUrl)
      .then((resp) => resp.json())
      .then((json) => {
        if (cancelled) return;
        const result = validateSidecarRoadmap(json);
        if (result.errors.length === 0) {
          setData(json);
          setLastUpdatedAt(new Date());
          setValidation(result);
          // Reset selection to home screen on remote load.
          setSelectedProjectId(null);
          setSelectedRoadmapId(null);
        } else {
          console.error('Initial state contained errors', result.errors);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch initial state', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Whenever the selected roadmap or data changes, compute the first
  // incomplete item to focus on.  This does not automatically scroll;
  // scrolling occurs when the user taps the return button.
  useEffect(() => {
    if (currentRoadmap) {
      const ci = findFirstIncompleteItem(currentRoadmap);
      setCurrentItem(ci);
    } else {
      setCurrentItem(null);
    }
  }, [currentRoadmap]);

  // Pivotal triggers for scenes: project/roadmap/phase changes.
  const prevPivotalRef = useRef<{ projectId: string | null; roadmapId: string | null; phaseId: string | null } | null>(null);

  useEffect(() => {
    const next = { projectId: selectedProjectId, roadmapId: selectedRoadmapId, phaseId: currentItem?.phaseId ?? null };
    if (prevPivotalRef.current) {
      const changed =
        prevPivotalRef.current.projectId !== next.projectId ||
        prevPivotalRef.current.roadmapId !== next.roadmapId ||
        prevPivotalRef.current.phaseId !== next.phaseId;

      if (changed && currentProject && currentRoadmap) {
        pulseScene();
      }
    }
    prevPivotalRef.current = next;
  }, [selectedProjectId, selectedRoadmapId, currentItem?.phaseId, currentProject, currentRoadmap, pulseScene]);

  // Milestone trigger: when deliverables reach 100% on the active roadmap.
  const prevMasterRef = useRef<number | null>(null);
  useEffect(() => {
    if (!currentRoadmap) return;
    const prev = prevMasterRef.current;
    if (typeof prev === 'number' && prev < 100 && masterProgress >= 100) {
      pulseScene();
    }
    prevMasterRef.current = masterProgress;
  }, [currentRoadmap, masterProgress, pulseScene]);


  // Parse URL parameters on mount.  If projectId is provided and
  // exists in the data, select it; otherwise remain on home screen.

  // On initial mount: parse query parameters for projectId and roadmapId. This enables
  // deep linking from external sources such as chat bots. If a valid projectId is
  // provided, select that project; otherwise remain on the home screen.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectParam = params.get('projectId');
    const roadmapParam = params.get('roadmapId');
    if (projectParam) {
      const foundProject = data.projects.find((p) => p.project_id === projectParam);
      if (foundProject) {
        setSelectedProjectId(foundProject.project_id);
        // Use provided roadmapId if valid; otherwise default to first roadmap.
        const foundRoadmap = roadmapParam
          ? foundProject.roadmaps.find((r) => r.roadmap_id === roadmapParam)
          : undefined;
        if (foundRoadmap) {
          setSelectedRoadmapId(foundRoadmap.roadmap_id);
        } else {
          setSelectedRoadmapId(foundProject.default_roadmap_id ?? foundProject.roadmaps[0].roadmap_id);
        }
      }
    }
  }, [data.projects]);

  // Handle user clicking the Import Data button.  Copy current data
  // into the editor and show the overlay.
  const handleImportClick = () => {
    setJsonInput(JSON.stringify(data, null, 2));
    setShowEditor(true);
  };
  // Handle user clicking Edit Data from the error panel.  Copies the
  // current JSON into the editor so the user can fix issues.
  const handleEditData = () => {
    setJsonInput(JSON.stringify(data, null, 2));
    setShowEditor(true);
  };
  // Render the custom JSON from the editor.  Parses, validates,
  // updates data if no errors, otherwise stores errors.
  const handleRenderCustom = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const result = validateSidecarRoadmap(parsed);
      setValidation(result);
      if (result.errors.length === 0) {
        setData(parsed);
        setLastUpdatedAt(new Date());
        setSelectedProjectId(null);
        setSelectedRoadmapId(null);
        setShowEditor(false);
      }
    } catch (e) {
      setValidation({ errors: [{ path: '', message: 'Invalid JSON' }], warnings: [] });
    }
  };
  // Load the sample dataset.  Resets selection and closes editor.
  const handleLoadSample = () => {
    setData(sampleData);
    setLastUpdatedAt(new Date());
    setSelectedProjectId(null);
    setSelectedRoadmapId(null);
    setShowEditor(false);
    setValidation(null);
  };
  // Cancel the editor overlay without changing data.
  const handleCancelEditor = () => {
    setShowEditor(false);
  };

  const buildShareLink = (projectId: string, roadmapId: string) => {
    const params = new URLSearchParams({
      projectId,
      roadmapId
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const handleCopyShareLink = (projectId: string, roadmapId: string) => {
    const link = buildShareLink(projectId, roadmapId);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).catch(() => {
        console.warn('Clipboard write failed');
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = link;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.warn('Clipboard fallback failed', err);
      }
      document.body.removeChild(textarea);
    }
  };

  // Handle selection of project and roadmap from the selector.
  const handleSelect = (projectId: string, roadmapId: string) => {
    setSelectedProjectId(projectId);
    setSelectedRoadmapId(roadmapId);
    setShowSelector(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <SceneBackground sceneId={sceneId} reduceMotion={reduceMotion} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Editor overlay for importing custom JSON */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 sm:w-3/4 md:w-2/3 max-h-[90vh] overflow-y-auto p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Import roadmap JSON</h2>
            <textarea
              className="w-full h-60 p-2 border rounded font-mono text-sm resize-y"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            {validation?.errors.length && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 text-red-700 text-sm rounded">
                {validation.errors[0].message}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-3">
              <button
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm"
                onClick={handleCancelEditor}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                onClick={handleRenderCustom}
              >
                Render
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                onClick={handleLoadSample}
              >
                Load Sample
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If validation errors exist (and not editing), show the error panel */}
      {validation?.errors.length && !showEditor ? (
        <ErrorPanel errors={validation.errors} warnings={validation.warnings} onEdit={handleEditData} />
      ) : null}

      {/* Show warning banner if there are warnings but no errors */}
      {validation && validation.errors.length === 0 && validation.warnings && validation.warnings.length > 0 && !showEditor && (
        <div className="max-w-md mx-auto mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded text-yellow-800 text-sm">
          Rendered with warnings. See console or data for details.
        </div>
      )}
      {/* Home screen: list all projects when no project is selected */}
      {currentProject && currentRoadmap && (!validation || validation.errors.length === 0) ? (
        <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-4">
          {/* Sticky header for project */}
          <header className="sticky top-0 rounded-xl bg-white/80 backdrop-blur shadow p-4 flex flex-col gap-2 z-50">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h1 className="text-lg font-semibold truncate max-w-xs sm:max-w-sm">{currentProject.project_name}</h1>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setShowSelector(true)}
              >
                {currentRoadmap.roadmap_name}
              </button>
            </div>
            {/* Display lock label if present */}
            {currentRoadmap.lock_label && (
              <div className="text-xs text-gray-500 italic">{currentRoadmap.lock_label}</div>
            )}
            {/* Visuals Hot-Swap HUD (wired via visuals.active.json) */}
            <VisualsHUD
              masterProgress01={masterProgress01}
              overallProgress01={overallProgress01}
              doneCount={doneItems}
              totalCount={totalItems}
              activePhaseLabel={activePhaseLabel}
              activePhaseProgress01={activePhaseProgress01}
              phases={phasesNav}
              activePhaseIndex={activePhaseIndex}
              lastUpdatedLabel={lastUpdatedLabel}
              liveStatus={liveStatus}
              reduceMotion={reduceMotion}
              onJumpToPhase={jumpToPhase}
            />

            {/* Import data button for project view */}
            <div className="flex flex-wrap justify-end gap-2 mt-1">
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={handleImportClick}
              >
                Import Data
              </button>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => handleCopyShareLink(currentProject.project_id, currentRoadmap.roadmap_id)}
              >
                Copy Share Link
              </button>
            </div>
          </header>
          {/* Main content for selected project */}
          <main className="pb-20"> {/* bottom padding for floating btn */}
            <RoadmapView roadmap={currentRoadmap} currentItemId={currentItem?.itemId} />
          </main>
        </div>
      ) : (
        <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-4">
          {/* Home screen hero */}
          <section className="rounded-xl bg-white/80 backdrop-blur shadow p-4 space-y-3">
            <div>
              <h1 className="text-2xl font-semibold">🛵 Side‑Car</h1>
              <p className="text-sm text-gray-600 mt-1">
                Lightweight project roadmaps with live visuals, status clarity, and shareable links.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-blue-600 text-white text-sm px-3 py-2 shadow hover:bg-blue-700"
                onClick={handleImportClick}
              >
                Import Data
              </button>
              <button
                className="rounded-lg bg-gray-100 text-gray-700 text-sm px-3 py-2 shadow hover:bg-gray-200"
                onClick={handleLoadSample}
              >
                Load Sample
              </button>
              <button
                className="rounded-lg bg-gray-100 text-gray-700 text-sm px-3 py-2 shadow hover:bg-gray-200"
                onClick={() => {
                  const firstProject = data.projects[0];
                  if (!firstProject) return;
                  const defaultRoadmap = firstProject.default_roadmap_id ?? firstProject.roadmaps[0].roadmap_id;
                  handleCopyShareLink(firstProject.project_id, defaultRoadmap);
                }}
              >
                Copy Share Link
              </button>
            </div>
          </section>
          {/* Project list */}
          <main className="space-y-4">
            {data.projects.map((project) => {
              const defaultRoadmap = project.default_roadmap_id ?? project.roadmaps[0].roadmap_id;
              return (
                <button
                  key={project.project_id}
                  className="block w-full rounded-xl bg-white/80 backdrop-blur p-4 shadow hover:bg-white text-left"
                  onClick={() => {
                    setSelectedProjectId(project.project_id);
                    setSelectedRoadmapId(defaultRoadmap);
                  }}
                >
                  <div className="font-medium text-gray-900">{project.project_name}</div>
                  {project.project_desc && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{project.project_desc}</div>
                  )}
                </button>
              );
            })}
          </main>
        </div>
      )}
      {/* Selector bottom sheet */}
      <RoadmapSelector
        projects={data.projects}
        selectedProjectId={selectedProjectId ?? ''}
        selectedRoadmapId={selectedRoadmapId ?? ''}
        onSelect={(proj, road) => {
          setSelectedProjectId(proj);
          setSelectedRoadmapId(road);
        }}
        open={showSelector}
        onClose={() => setShowSelector(false)}
      />
      {/* Floating return‑to‑current task button */}
      {showReturn && currentProject && currentRoadmap && (
        <button
          onClick={() => {
            setShowReturn(false);
            handleInteraction();
            // Scroll to current item if available.
            if (currentItem) {
              const el = document.getElementById(`item-${currentItem.itemId}`);
              if (el) {
                pulseScene();
                el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
              }
            }
          }}
          className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-xs sm:text-sm"
        >
          Return to current task
        </button>
      )}
    </div>
      </div>
  );
}

export default App;
