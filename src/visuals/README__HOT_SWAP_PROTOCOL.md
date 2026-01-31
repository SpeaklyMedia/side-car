# Hot-Swap Protocol (Locked L1)

## Purpose
Enable safe swapping of **Visualization**, **Motion**, and **Scene** packs via configuration **without touching core ingestion/state logic**.

## Allowed changes (Codex scope)
- ✅ `visuals/packs/**` (add or update pack content)
- ✅ `visuals/visuals.active.json` (select which packs are active)
- ✅ Pack-local docs, tokens, stubs
- ❌ Any app-core ingestion/state logic (outside this L1 pack)

## Runtime contract (app-side)
- Read `visuals/visuals.active.json`
- Resolve pack metadata from `visuals/registry.ts` (or generated equivalent)
- Load/compose UI layers:
  - HUD visualization layer (hero blocks, phasebar)
  - Motion sequences/tokens
  - Scene backgrounds + triggers

## Reduce motion
Any pack must provide a reduce-motion behavior. If in doubt: **snap transitions** + **no looping progress**.
