import { HeroMetric } from "./components/HeroMetric";
import { PhaseBar } from "./components/PhaseBar";
import { SlideRail } from "./components/SlideRail";

export const HUD_PACK_ID = "hud_v1" as const;

/**
 * HUD v1 exports
 *
 * This pack provides functional, self-contained components that deliver:
 * - staged/soft hero metric reveal (Rolodex-style pop)
 * - flowing progress only in active states
 * - slide rail indicator for “ease-swipe” blocks
 */
export const hud_v1 = {
  id: HUD_PACK_ID,
  version: "1.0.0",
  components: {
    HeroMetric,
    PhaseBar,
    SlideRail
  }
};

export { HeroMetric, PhaseBar, SlideRail };
