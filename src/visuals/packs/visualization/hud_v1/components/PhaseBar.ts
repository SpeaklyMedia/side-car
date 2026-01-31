import React from "react";

export type PhaseState = "idle" | "loading" | "in_progress" | "complete" | "error";

export interface PhaseBarProps {
  state: PhaseState;
  progress?: number; // 0..1
  label?: string;
  reduceMotion?: boolean;
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/**
 * PhaseBar
 * - Calm, premium progress delivery.
 * - “Flow/loop” effect is used ONLY in active states (loading/in_progress) and only when reduceMotion=false.
 * - Complete state settles to still.
 */
export function PhaseBar(props: PhaseBarProps) {
  const { state, progress = 0, label, reduceMotion } = props;
  const p = clamp01(progress);

  const isActive = (state === "loading" || state === "in_progress") && !reduceMotion;
  const isComplete = state === "complete";
  const isError = state === "error";

  const fillColor = isError
    ? "rgba(190,60,60,0.95)"
    : isComplete
      ? "rgba(0,140,90,0.95)"
      : "rgba(40,90,220,0.92)";

  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    React.createElement(
      "style",
      null,
      `@keyframes luxFlow{0%{background-position:0% 50%}100%{background-position:200% 50%}}`
    ),
    label
      ? React.createElement(
          "div",
          { style: { fontSize: 12, color: "rgba(0,0,0,0.55)", letterSpacing: "0.02em" } },
          label
        )
      : null,
    React.createElement(
      "div",
      {
        style: {
          height: 12,
          borderRadius: 999,
          overflow: "hidden",
          background: "rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)"
        },
        role: "progressbar",
        "aria-valuenow": Math.round(p * 100),
        "aria-valuemin": 0,
        "aria-valuemax": 100
      },
      React.createElement("div", {
        style: {
          height: "100%",
          width: `${Math.round(p * 100)}%`,
          borderRadius: 999,
          background: isActive
            ? `linear-gradient(90deg, ${fillColor}, rgba(255,255,255,0.72), ${fillColor})`
            : fillColor,
          backgroundSize: isActive ? "200% 100%" : undefined,
          animation: isActive ? "luxFlow 1600ms ease-in-out infinite" : undefined,
          transition: reduceMotion ? undefined : "width 700ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.07)"
        }
      })
    )
  );
}
