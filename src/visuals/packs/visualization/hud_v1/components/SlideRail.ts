import React from "react";

export interface SlideRailProps {
  activeIndex: number;
  count: number;
  reduceMotion?: boolean;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * SlideRail
 * - Minimal “slides/minimap” indicator.
 * - Intended to support the “blocks ease-swipe in/out” feel.
 */
export function SlideRail(props: SlideRailProps) {
  const { activeIndex, count, reduceMotion } = props;
  const safeCount = Math.max(0, count | 0);
  const active = safeCount ? clamp(activeIndex | 0, 0, safeCount - 1) : 0;

  const dots = Array.from({ length: safeCount }, (_, i) => i);

  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8, alignItems: "center" } },
    React.createElement(
      "style",
      null,
      `@keyframes luxDotPop{0%{transform:scale(0.85);opacity:0.55}100%{transform:scale(1);opacity:1}}`
    ),
    ...dots.map((i) => {
      const isActive = i === active;
      return React.createElement("div", {
        key: i,
        style: {
          width: isActive ? 8 : 6,
          height: isActive ? 18 : 6,
          borderRadius: 999,
          background: isActive ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.22)",
          transition: reduceMotion ? undefined : "all 420ms cubic-bezier(0.22,1,0.36,1)",
          animation: isActive && !reduceMotion ? "luxDotPop 420ms ease-out" : undefined
        }
      });
    })
  );
}
