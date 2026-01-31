import React from "react";

import activeConfig from "./visuals.active.json";

// Pack exports (copied from the IMPLEMENTED pack)
import { HeroMetric, PhaseBar, SlideRail } from "./packs/visualization/hud_v1";
import motionTokens from "./packs/motion/lux_v1/motion.tokens.json";
import scenesMap from "./packs/scenes/cleanBright_v1/scenes.map.json";

/**
 * Minimal runtime wiring for the Visuals Hot-Swap system.
 *
 * IMPORTANT:
 * - This module is UI-only.
 * - It must not change ingestion/state semantics; it only *reads* the current derived state.
 * - Packs are hot-swappable: the active pack ids come from visuals.active.json.
 */

export type LiveStatus = "live" | "offline" | "error";

export interface VisualsPhaseNavItem {
  phaseId: string;
  label: string;
  progress01: number; // 0..1
}

export interface VisualsHUDProps {
  masterProgress01: number; // deliverables 0..1
  overallProgress01: number; // 0..1
  doneCount: number;
  totalCount: number;
  activePhaseLabel: string;
  activePhaseProgress01: number; // 0..1
  phases: VisualsPhaseNavItem[];
  activePhaseIndex: number; // 0..n-1
  lastUpdatedLabel: string;
  liveStatus: LiveStatus;
  reduceMotion: boolean;
  onJumpToPhase?: (phaseId: string) => void;
}

/** Media-query driven reduce-motion (no dependency on app ingestion logic). */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setReduce(!!mq.matches);
    update();

    // Safari fallback
    const add = (mq as any).addEventListener ? "addEventListener" : "addListener";
    const remove = (mq as any).removeEventListener ? "removeEventListener" : "removeListener";

    (mq as any)[add]("change", update);
    return () => (mq as any)[remove]("change", update);
  }, []);

  return reduce;
}

/**
 * SceneBackground
 * - Full-bleed app background
 * - Only transitions at pivotal triggers (phase/roadmap/project change, return-to-now, milestone)
 */
export function SceneBackground(props: { sceneId: string; reduceMotion: boolean }) {
  const { sceneId, reduceMotion } = props;

  // Map scene ids to minimal styles (keep small + safe).
  const isGlow = sceneId === "scene_soft_glow";

  return React.createElement(
    "div",
    {
      "aria-hidden": true,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none"
      }
    },
    // base
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,247,255,1) 100%)"
      }
    }),
    // glow overlay
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        opacity: isGlow ? 1 : 0,
        transition: reduceMotion ? undefined : `opacity ${motionTokens.durations_ms.scene_transition}ms ${motionTokens.easing.settle_out}`,
        background:
          "radial-gradient(60% 50% at 20% 20%, rgba(220,245,255,0.95) 0%, rgba(255,255,255,0) 65%)," +
          "radial-gradient(55% 45% at 80% 30%, rgba(255,235,210,0.55) 0%, rgba(255,255,255,0) 70%)"
      }
    })
  );
}

/**
 * useScenePulse
 * - Provides a `pulse()` method to switch to the pivotal scene briefly.
 * - For reduce motion, uses an instant switch.
 */
export function useScenePulse(reduceMotion: boolean) {
  const defaultScene = (scenesMap as any)?.default ?? "scene_clean_white";
  const glowScene = "scene_soft_glow";

  const [sceneId, setSceneId] = React.useState<string>(defaultScene);
  const timeoutRef = React.useRef<number | null>(null);

  const pulse = React.useCallback(() => {
    // Guard: only pulse if scenes are enabled in active config.
    const activeScenes = (activeConfig as any)?.active?.scenes;
    if (!activeScenes) return;

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    setSceneId(glowScene);

    // Revert after the scene duration.
    const duration = Math.max(0, Number((motionTokens as any)?.durations_ms?.scene_transition ?? 900));
    if (reduceMotion) {
      // instant revert for reduce-motion
      setSceneId(defaultScene);
      return;
    }
    timeoutRef.current = window.setTimeout(() => setSceneId(defaultScene), duration);
  }, [reduceMotion, defaultScene]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return { sceneId, pulse };
}

/**
 * VisualsHUD
 * - Renders the pack-provided HUD components (HeroMetric / PhaseBar / SlideRail)
 * - Adds a deterministic phase jump strip (no ingestion changes; uses DOM scroll only)
 */
export function VisualsHUD(props: VisualsHUDProps) {
  const {
    masterProgress01,
    overallProgress01,
    doneCount,
    totalCount,
    activePhaseLabel,
    activePhaseProgress01,
    phases,
    activePhaseIndex,
    lastUpdatedLabel,
    liveStatus,
    reduceMotion,
    onJumpToPhase
  } = props;

  const hudPackId = (activeConfig as any)?.active?.visualization;
  const motionPackId = (activeConfig as any)?.active?.motion;

  // If visuals.active.json disables visualization, render nothing.
  if (!hudPackId) return null;

  const liveLabel = liveStatus === "live" ? "LIVE" : liveStatus === "error" ? "ERR" : "OFF";

  const phaseBarState =
    liveStatus === "error"
      ? "error"
      : masterProgress01 >= 1
        ? "complete"
        : liveStatus === "live"
          ? "in_progress"
          : "idle";

  // Reserve hero space to avoid layout jumps.
  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "10px 0 2px 0"
      }
    },
    // Top row: metrics + progress
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap"
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
        React.createElement(HeroMetric, {
          label: "Deliverables",
          value: Math.round(masterProgress01 * 100),
          unit: "%",
          reduceMotion
        }),
        React.createElement(HeroMetric, {
          label: "Done",
          value: `${doneCount}/${totalCount}`,
          reduceMotion
        })
      ),
      React.createElement(
        "div",
        { style: { minWidth: 260, flex: "1 1 260px", maxWidth: 420 } },
        React.createElement(PhaseBar as any, {
          state: phaseBarState,
          progress: overallProgress01,
          label: `Phase: ${activePhaseLabel}`,
          reduceMotion
        })
      ),
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", minWidth: 40 } },
        React.createElement(SlideRail, {
          activeIndex: activePhaseIndex,
          count: phases.length,
          reduceMotion
        })
      )
    ),

    // Sub-row: details
    React.createElement(
      "div",
      {
        style: {
          fontSize: 12,
          color: "rgba(0,0,0,0.58)",
          display: "flex",
          gap: 12,
          flexWrap: "wrap"
        }
      },
      React.createElement("span", null, `Active phase progress: ${Math.round(activePhaseProgress01 * 100)}%`),
      React.createElement("span", null, `Updated: ${lastUpdatedLabel}`),
      React.createElement("span", null, `Stream: ${liveLabel}`),
      motionPackId ? React.createElement("span", null, `Motion: ${motionPackId}`) : null
    ),

    // Phase jump strip
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 6
        }
      },
      phases.length === 0
        ? React.createElement("span", { style: { fontSize: 12, opacity: 0.7 } }, "No phases")
        : phases.map((p, idx) => {
            const isActive = idx === activePhaseIndex;
            const label = p.label.length > 18 ? `${p.label.slice(0, 18)}…` : p.label;
            return React.createElement(
              "button",
              {
                key: p.phaseId,
                onClick: () => onJumpToPhase?.(p.phaseId),
                style: {
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: isActive ? "rgba(0,0,0,0.82)" : "rgba(255,255,255,0.72)",
                  color: isActive ? "white" : "rgba(0,0,0,0.85)",
                  borderRadius: 999,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  transition: reduceMotion ? undefined : `all ${motionTokens.durations_ms.list_enter}ms ${motionTokens.easing.soft_in_out}`,
                  boxShadow: isActive ? "0 10px 24px rgba(0,0,0,0.10)" : "0 6px 14px rgba(0,0,0,0.06)"
                }
              },
              label
            );
          })
    )
  );
}
