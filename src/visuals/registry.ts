import type { VisualRegistry } from "./types";

/**
 * Stub registry.
 *
 * Wiring note (for Codex / app implementers):
 * - The app should import this registry (or generate one) and resolve the active pack ids from visuals.active.json.
 * - The app should treat packs as hot-swappable UI layers only.
 * - Core ingestion/state logic must remain unchanged.
 */
export const registry: VisualRegistry = {
  visualization: {
    hud_v1: {
      id: "hud_v1",
      label: "HUD v1 (Phasebar Now)",
      version: "1.0.0",
      entrypoint: "visuals/packs/visualization/hud_v1/index.ts"
    }
  },
  motion: {
    lux_v1: {
      id: "lux_v1",
      label: "Luxury Motion v1",
      version: "1.0.0",
      tokensPath: "visuals/packs/motion/lux_v1/motion.tokens.json",
      sequencesPath: "visuals/packs/motion/lux_v1/sequences.md",
      reduceMotionVariant: "reduce_motion"
    }
  },
  scenes: {
    cleanBright_v1: {
      id: "cleanBright_v1",
      label: "CleanBright Scenes v1",
      version: "1.0.0",
      scenesPath: "visuals/packs/scenes/cleanBright_v1/scenes.map.json",
      triggersPath: "visuals/packs/scenes/cleanBright_v1/triggers.md"
    }
  }
};
