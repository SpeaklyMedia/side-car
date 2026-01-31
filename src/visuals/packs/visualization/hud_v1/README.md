# HUD v1 (Implemented)

This visualization pack provides the baseline “luxury data delivery” layer:

- **HeroMetric**: numeric values animate into place (odometer-like tick) with a soft reveal.
- **PhaseBar**: progress fill eases in; **flow/loop** only during active states (`loading`, `in_progress`) and only when `reduceMotion=false`.
- **SlideRail**: a minimal slide/minimap indicator supporting “ease-swipe” block layouts.

## Usage contract
- These components are **hot-swappable UI layers**. They must not mutate core ingestion/state logic.
- The app should pass `reduceMotion=true` when the user has reduce-motion enabled.

## Notes
- This pack is intentionally self-contained (inline keyframes) to keep integration friction low.
