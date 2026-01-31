import React from "react";

export interface HeroMetricProps {
  label: string;
  value: number | string;
  delta?: number;
  unit?: string;
  /** When true, disables tick/roll animations. */
  reduceMotion?: boolean;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function formatValue(value: number | string, unit?: string): string {
  const base = isFiniteNumber(value)
    ? Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)
    : String(value);
  return unit ? `${base}${unit}` : base;
}

function useAnimatedNumber(target: number, reduceMotion?: boolean, durationMs = 750): number {
  const [display, setDisplay] = React.useState<number>(target);
  const prevRef = React.useRef<number>(target);

  React.useEffect(() => {
    if (reduceMotion) {
      prevRef.current = target;
      setDisplay(target);
      return;
    }

    const startValue = prevRef.current;
    const endValue = target;
    prevRef.current = target;

    const start = performance.now();
    let raf = 0;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      const next = startValue + (endValue - startValue) * eased;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduceMotion, durationMs]);

  return display;
}

/**
 * HeroMetric
 * - Clean, bright metric tile
 * - Value "ticks" into place (odometer-like) when numeric
 * - Delta is shown subtly (no flashing)
 */
export function HeroMetric(props: HeroMetricProps) {
  const { label, value, delta, unit, reduceMotion } = props;

  const numeric = isFiniteNumber(value) ? value : NaN;
  const animated = isFiniteNumber(value) ? useAnimatedNumber(numeric, reduceMotion) : NaN;

  const displayValue = isFiniteNumber(value)
    ? formatValue(Math.round(animated), unit)
    : formatValue(value, unit);

  const deltaText = typeof delta === "number" && Number.isFinite(delta)
    ? `${delta > 0 ? "+" : ""}${Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(delta)}`
    : "";

  return React.createElement(
    "div",
    {
      style: {
        borderRadius: 16,
        padding: 16,
        background: "rgba(255,255,255,0.86)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 140
      }
    },
    // inline keyframes (safe, self-contained)
    React.createElement(
      "style",
      null,
      `@keyframes luxRolodexPop{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}`
    ),
    React.createElement(
      "div",
      {
        style: {
          fontSize: 12,
          letterSpacing: "0.02em",
          color: "rgba(0,0,0,0.55)",
          textTransform: "uppercase"
        }
      },
      label
    ),
    React.createElement(
      "div",
      {
        style: {
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.1,
          color: "rgba(0,0,0,0.9)",
          animation: reduceMotion ? undefined : "luxRolodexPop 420ms ease-out"
        },
        "aria-live": "polite"
      },
      displayValue
    ),
    deltaText
      ? React.createElement(
          "div",
          {
            style: {
              fontSize: 12,
              color: typeof delta === "number" && delta > 0 ? "rgba(0,120,60,0.9)" : "rgba(160,40,40,0.9)",
              opacity: 0.9
            }
          },
          deltaText
        )
      : null
  );
}
