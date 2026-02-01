import type { Phase, Status } from '../types';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  phases: Phase[];
}

const resetItems = (phase: Phase): Phase => ({
  ...phase,
  items: phase.items.map((item) => ({
    ...item,
    status: 'not_started' as Status,
    progress: undefined,
    blocker_reason: undefined
  }))
});

export const templates: TemplateDefinition[] = [
  {
    id: 'sidecar_v1_templates',
    name: 'Side‑Car V1 Templates',
    description: 'Meta templates for tracking Side‑Car delivery milestones.',
    emoji: '🛵',
    phases: [
      {
        phase_id: 'tpl_sidecar_v1',
        phase_name: 'Side‑Car V1 Scope',
        phase_desc: 'Deliverables to complete V1',
        items: [
          { item_id: 'tpl_p5_1', title: 'P5.1 — Dogfood sample roadmap', status: 'not_started' as Status, is_deliverable: true },
          { item_id: 'tpl_p5_2', title: 'P5.2 — Templates library + insert', status: 'not_started' as Status, is_deliverable: true },
          { item_id: 'tpl_p5_3', title: 'P5.3 — Share semantics + export JSON', status: 'not_started' as Status, is_deliverable: true },
          { item_id: 'tpl_p5_4', title: 'P5.4 — Emoji source‑of‑truth', status: 'not_started' as Status, is_deliverable: true }
        ]
      }
    ]
  },
  {
    id: 'product_launch',
    name: 'Product Launch',
    description: 'Plan, build, and launch a product with checkpoints.',
    emoji: '🚀',
    phases: [
      {
        phase_id: 'tpl_discovery',
        phase_name: 'Discovery',
        phase_desc: 'Scope, success metrics, and risks',
        items: [
          { item_id: 'tpl_discovery_scope', title: 'Define scope + success metrics', status: 'not_started' as Status, is_deliverable: true },
          { item_id: 'tpl_discovery_risks', title: 'Identify risks + mitigations', status: 'not_started' as Status },
          { item_id: 'tpl_discovery_inputs', title: 'Collect required inputs', status: 'not_started' as Status }
        ]
      },
      {
        phase_id: 'tpl_build',
        phase_name: 'Build',
        phase_desc: 'Implement core functionality',
        items: [
          { item_id: 'tpl_build_core', title: 'Build core feature set', status: 'not_started' as Status, is_deliverable: true },
          { item_id: 'tpl_build_qa', title: 'QA pass + fixes', status: 'not_started' as Status }
        ]
      },
      {
        phase_id: 'tpl_launch',
        phase_name: 'Launch',
        phase_desc: 'Ship and validate',
        items: [
          { item_id: 'tpl_launch_release', title: 'Release package', status: 'not_started' as Status, is_deliverable: true },
          { item_id: 'tpl_launch_verify', title: 'Post‑launch verification', status: 'not_started' as Status }
        ]
      }
    ].map(resetItems)
  },
  {
    id: 'app_build',
    name: 'App Build',
    description: 'Design → Develop → QA for application delivery.',
    emoji: '📱',
    phases: [
      {
        phase_id: 'tpl_design',
        phase_name: 'Design',
        phase_desc: 'UX + visual system',
        items: [
          { item_id: 'tpl_design_flow', title: 'User flows + IA', status: 'not_started' as Status, is_deliverable: true },
          { item_id: 'tpl_design_ui', title: 'UI system + screens', status: 'not_started' as Status }
        ]
      },
      {
        phase_id: 'tpl_develop',
        phase_name: 'Develop',
        phase_desc: 'Core features + integrations',
        items: [
          { item_id: 'tpl_dev_core', title: 'Core implementation', status: 'not_started' as Status, is_deliverable: true },
          { item_id: 'tpl_dev_integrations', title: 'Integrations + data', status: 'not_started' as Status }
        ]
      },
      {
        phase_id: 'tpl_qa',
        phase_name: 'QA + Release',
        phase_desc: 'Testing + launch',
        items: [
          { item_id: 'tpl_qa_pass', title: 'QA pass', status: 'not_started' as Status },
          { item_id: 'tpl_release', title: 'Release package', status: 'not_started' as Status, is_deliverable: true }
        ]
      }
    ].map(resetItems)
  }
];
