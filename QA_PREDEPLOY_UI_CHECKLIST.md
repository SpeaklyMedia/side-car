# QA Predeploy UI Checklist

## Home
- Hero renders (title, microcopy, CTAs)
- Import Data opens editor
- Load Sample resets to sample data
- Share Link copies or opens share sheet
- Project list cards are readable and tappable

## Project View
- Sticky header shows project title + roadmap selector
- Status badges show emoji + text
- Share link field is visible and read-only
- Share + Copy buttons show toast
- Visuals HUD renders without overlapping text
- Return to current task button works

## Visuals
- Background gradients visible but do not reduce legibility
- Reduced motion disables scene pulse
- Milestone completion triggers subtle pulse + toast

## Mobile
- Max width container centers content
- Cards have consistent padding + spacing
- Tap targets are not cramped

## Build
- npm ci
- npm run build
- npm run preview (manual spot check)
