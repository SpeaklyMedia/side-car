// Sample dataset used for the Side‑Car MVP skeleton. This payload conforms
// to the sidecar_roadmap_v1 contract and can be used for development
// and testing. It matches the example provided in the specification.

import type { SidecarRoadmap } from './types';
import sidecarSample from './data/samples/sidecar_v1.json';

const sidecarData = sidecarSample as SidecarRoadmap;

export const sampleData: SidecarRoadmap = {
  contract_version: 'sidecar_roadmap_v1',
  projects: [
    sidecarData.projects[0],
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
