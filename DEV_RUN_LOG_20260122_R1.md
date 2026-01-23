# Development Run Log – R1 (2026‑01‑22)

This document describes the actions taken during the SIDECAR R1 implementation phase from the perspective of the Picasso Coder.  The goal was to integrate the Systems Architect constraints, UX flow lock and brand assets into the existing Sidecar MVP skeleton and to ship a functional prototype that reflects the R1 requirements as far as practicable.

## What was done

1. **Transport bundle verification.**  The `SIDECAR_PICASSO_CODER_TRANSPORT_BUNDLE_20260122_R1.zip` was unpacked and all files were verified against the provided SHA256 checksums in `receipts/SHA256SUMS_PICASSO_CODER_TRANSPORT_20260122_R1.txt`.  Each file matched its expected digest which ensured the transport bundle had not been tampered with.
2. **Workspace setup.**  The `workspace/sidecar_mvp_final.zip` archive was extracted to produce the project skeleton.  The skeleton contained a basic React application with sample data and type definitions.
3. **Brand pack integration.**  The NES.css stylesheet from the Speakly/ThetaFrame 8‑bit brand pack was copied into the `src` directory as `nes.css` and imported in `main.tsx`.  This establishes the retro 8‑bit visual theme required by the UX lock.
4. **New components.**  To support the R1 flows the following components were implemented:
   - **ProjectList:** displays Active/Archived tabs and renders clickable project cards (archived projects are not yet separated in this iteration).
   - **HeroPanel:** shows the current focus item (first in‑progress or not‑started task) with its phase name and an optional detail snippet.
   - **Enhanced PhaseCard:** extended the existing PhaseCard to include emoji/status icons (✅, 🔧, 🚫, 🕒), nested bullet parsing (Option A) with an accordion for details, and client‑view filtering.  Items without `is_deliverable` are hidden when Client View is enabled.
5. **Roadmap view updates.**  `RoadmapView` was updated to accept a `clientView` prop and pass it down to PhaseCard.  Each phase remains collapsible with a summary progress bar and counts.
6. **Main application restructuring.**  `App.tsx` was rewritten to add:
   - A project list screen that lists all projects and allows selecting the default roadmap for a project.
   - A per‑project screen with a sticky header showing the project name, roadmap name, a Client View toggle, and a disabled “Generate Client Link” control (copy per UX lock).  An Import Data link allows pasting JSON to replace the current state.
   - Hero selection logic following the prescribed rules: first unlocked in‑progress item, else first unlocked not‑started item; if none qualify, the hero panel displays a completion message.
   - Client View filtering: when enabled, only items with `is_deliverable === true` are displayed; this affects both the task list and hero selection.
   - A JSON import editor overlay reused from the skeleton, allowing users to paste or load sample data.  Validation is performed via the existing `validateSidecarRoadmap` helper.
7. **Third‑party notices.**  A `THIRD_PARTY_NOTICES.md` file was added acknowledging the MIT licence for the cand2_vrk attract‑mode engine and the MIT licences for NES.css and PSone.css, along with the SIL Open Font License for the bundled fonts.

## How to run locally

1. Ensure that you have [Node.js](https://nodejs.org) installed (version 16 or higher).  Note that this environment may not have external network access, so `npm install` could fail when attempting to fetch dependencies; the instructions assume a normal development environment.
2. From the `sidecar_mvp_skeleton` directory, install the project dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173` (or the port reported by Vite).  You should see the project list with the 8‑bit theme applied.  Select a project to view its roadmap, toggle Client View, and import custom JSON via the Import Data link.

## Remaining work / known gaps

While the above implementation covers many of the R1 tasks, several features remain incomplete or stubbed:

* **Attract Mode overlay:** idle detection, update‑dismiss logic, cooldown management and integration of the cand2_vrk canvas engine have not been implemented.  The overlay should respect `prefers-reduced-motion` and provide an always‑visible return button.
* **Canonical hashing & applied update detection:** JSON imports are validated but do not compute SHA‑256 hashes to detect duplicate payloads.  This hashing logic is required to implement update‑dismiss behaviours.
* **Deep linking and persistence:** URL parameters and local storage integration from the skeleton are not preserved in this iteration.  Restoring these features would allow bookmarking specific projects/roadmaps.
* **Dark mode and theming tokens:** The app currently uses only the NES.css light theme.  A full implementation should wire up dark‑mode support and leverage the brand token definitions from the brand pack.
* **29 second hero animation pause:** The hero panel does not include animated elements or a pause timer.  Future iterations could add subtle animations respecting reduced‑motion preferences.

Despite these gaps, the current build aligns with the UX flow lock for project selection, roadmap viewing, hero determination, task filtering and disabled client link presentation.