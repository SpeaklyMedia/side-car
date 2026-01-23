# Side‑Car MVP Skeleton

This repository contains a minimal skeleton for the Side‑Car mobile-first visualizer as described in the locked specification and design review.  It is not a fully functional application; instead, it provides the project structure, configuration, and placeholder components needed to begin implementation.

## Features

- **Vite + React + TypeScript** setup configured for a mobile-first UI.
- **Sticky header** with a summary strip that includes a master progress bar and basic counts.
- **Phase card** example with items and status pills.
 - **Floating “Return to current task” button** that appears after 7 seconds of inactivity when the user has scrolled away from the current item.  The button can be dismissed and triggers a return to the focus item when tapped.
 - **Data import & validation overlay**: users can paste a custom roadmap JSON payload, validate it against the `sidecar_roadmap_v1` contract, and render it.  Errors block rendering and are displayed in a dedicated panel; warnings do not block rendering.
 - **Dynamic content scaffolding**: the app listens for Server‑Sent Events (SSE) if `VITE_SIDECAR_STREAM_URL` is defined at build time.  Incoming messages containing a valid roadmap object replace the current data and reset the view.
- **Home screen** that lists all projects defined in the roadmap payload.  When no project is selected, the app shows this index and allows the user to pick a project to view.  The list updates automatically as new projects appear in the state feed.
- **Deep linking** support via query parameters: appending `?projectId=<id>&roadmapId=<id>` to the URL will open a specific project/roadmap (useful for chat bots to send “launch sidecar” links).
 - **Searchable roadmap selector**: the bottom‑sheet selector includes a search bar to filter projects and roadmaps by name.  This helps users quickly find the correct roadmap when many projects exist.
 - **Initial state fetch**: if `VITE_SIDECAR_STATE_URL` is defined, the app will fetch a JSON roadmap at that URL on startup.  This complements the SSE stream and allows the app to populate its home screen from a remote source without needing manual import.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser to see the application.

## Next Steps

Refer to the locked roadmap and design review for guidance on implementing the following features:

1. **Complete dynamic content integration:** Replace the sample data with calls to your derived state API and ensure SSE updates trigger UI refreshes.  Implement graceful fallback if SSE is unavailable.
2. **Implement current item tracking:** Determine the current focus item based on the specification and scroll the view when the user taps the return button or when new events arrive.
3. **Polish bottom‑sheet selector:** Upgrade the roadmap selector into a true mobile bottom sheet (e.g., using a portal or dialog) and add a search/filter if necessary.
4. **Accessibility:** Ensure text labels accompany all icons and bars, implement 44 pt tap targets, and provide ARIA roles for interactive components.
5. **Release packaging:** Follow the governance documents to package releases with manifest and checksums.

## Home screen and deep linking

The skeleton now includes a simple home screen.  When the app starts without a selected project, a list of all projects is shown.  Tapping a project navigates to its default roadmap.  This index will update when new roadmaps are published via the dynamic content feed.

You can also open a project directly by using query parameters: `?projectId=<your_project_id>&roadmapId=<roadmap_id>`.  For example:

```
https://your-sidecar.vercel.app/?projectId=sidecar&roadmapId=ship_mvp
```

This mechanism allows a chat bot to send a “launch sidecar” link that opens the correct project for the user.

## License

This skeleton is provided as part of the ThetaFrame App Dev project and inherits its governance and licensing terms.