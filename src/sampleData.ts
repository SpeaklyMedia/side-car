// Sample dataset used for the Side‑Car MVP skeleton. This payload conforms
// to the sidecar_roadmap_v1 contract and can be used for development
// and testing. It matches the example provided in the specification.

import type { SidecarRoadmap } from './types';

export const sampleData: SidecarRoadmap = {
  contract_version: 'sidecar_roadmap_v1',
  projects: [
    {
      project_id: 'sidecar',
      project_name: 'Side‑Car',
      project_desc: 'Stand-alone mobile-first roadmap + progress visualizer.',
      default_roadmap_id: 'ship_mvp',
      roadmaps: [
        {
          roadmap_id: 'ship_mvp',
          roadmap_name: 'Ship MVP',
          lock_label: 'LOCKED: roadmaps + progress bars only',
          phases: [
            {
              phase_id: 'p0',
              phase_name: 'P0 — MVP Shipment',
              items: [
                { item_id: 'ui_mobile', title: 'Mobile-first UI shell', status: 'done' },
                {
                  item_id: 'input_paste',
                  title: 'Paste JSON input + render',
                  status: 'in_progress',
                  progress: 60,
                  detail: 'Parser wired; UI polish pending',
                },
                {
                  item_id: 'validation',
                  title: 'Validation + error panel',
                  status: 'in_progress',
                  progress: 40,
                },
                {
                  item_id: 'switching',
                  title: 'Project/roadmap switcher',
                  status: 'not_started',
                },
                {
                  item_id: 'a11y',
                  title: 'Accessibility pass',
                  status: 'blocked',
                  progress: 10,
                  blocker_reason: 'Need final component structure before audit',
                },
              ],
            },
            {
              phase_id: 'qa_release',
              phase_name: 'QA + Locked Release',
              items: [
                { item_id: 'qa_checklist', title: 'QA checklist + PASS proof doc', status: 'not_started' },
                { item_id: 'release_zip', title: 'Release ZIP + manifest + SHA256', status: 'not_started' },
                { item_id: 'release_notes', title: 'Release notes + version tag', status: 'not_started' },
              ],
            },
          ],
        },
      ],
    },
    {
      project_id: 'grandcrew',
      project_name: 'Grand Crew Hospitality',
      roadmaps: [
        {
          roadmap_id: 'phase1_readiness',
          roadmap_name: 'Phase-1 Readiness Snapshot',
          lock_label: 'LOCKED: visualization only (reporting)',
          phases: [
            {
              phase_id: 'visibility',
              phase_name: 'Visibility Baseline',
              items: [
                { item_id: 'ga4', title: 'GA4 routing live per brand', status: 'done' },
                { item_id: 'cta', title: 'CTA parity', status: 'in_progress', progress: 75 },
                { item_id: 'cms_limits', title: 'CMS script sanitization constraints', status: 'done' },
              ],
            },
            {
              phase_id: 'content',
              phase_name: 'Content Readiness',
              items: [
                {
                  item_id: 'weekly_lineup',
                  title: 'Weekly lineup inputs',
                  status: 'blocked',
                  progress: 20,
                  blocker_reason: 'Inputs exist but not normalized for AI-SEO visibility',
                },
                { item_id: 'schema_plan', title: 'Schema plan staged', status: 'not_started' },
              ],
            },
          ],
        },
      ],
    },
  ],
};