export type PackId = string;

export interface VisualizationPack {
  id: PackId;
  label: string;
  version: string;
  // Contract: return a React component that renders the HUD layer.
  // NOTE: Implementation lives in app repo. This pack only defines the protocol + stubs.
  entrypoint: string;
}

export interface MotionPack {
  id: PackId;
  label: string;
  version: string;
  // Contract: motion tokens + named sequences that UI can call.
  tokensPath: string;
  sequencesPath: string;
  reduceMotionVariant: string;
}

export interface ScenePack {
  id: PackId;
  label: string;
  version: string;
  // Contract: scene catalog + triggers spec.
  scenesPath: string;
  triggersPath: string;
}

export interface VisualRegistry {
  visualization: Record<PackId, VisualizationPack>;
  motion: Record<PackId, MotionPack>;
  scenes: Record<PackId, ScenePack>;
}
