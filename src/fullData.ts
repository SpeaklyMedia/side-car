export type SidecarRoadmapStatus = "done" | "in_progress" | "blocked" | "not_started";

export type SidecarRoadmapItem = {
  item_id: string;
  title: string;
  status: SidecarRoadmapStatus;
  progress?: number;
  is_deliverable?: boolean;
  detail?: string;
  blocker_reason?: string;
};

export type SidecarRoadmapPhase = {
  phase_id: string;
  phase_name: string;
  phase_desc?: string;
  items: SidecarRoadmapItem[];
};

export type SidecarRoadmap = {
  contract_version: "sidecar_roadmap_v1";
  projects: Array<{
    project_id: string;
    project_name: string;
    project_desc?: string;
    default_roadmap_id: string;
    roadmaps: Array<{
      roadmap_id: string;
      roadmap_name: string;
      lock_label?: string;
      is_master?: boolean;
      phases: SidecarRoadmapPhase[];
    }>;
  }>;
};

export const fullData: SidecarRoadmap = {
  contract_version: "sidecar_roadmap_v1",
  projects: [
    {
      project_id: "sidecar",
      project_name: "Side-Car",
      project_desc:
        "Mobile-first, gamified work dashboard + roadmap tool for governed operator systems. UX target: scan → understand → act (fast).",
      default_roadmap_id: "r1_ironhud_minimal",
      roadmaps: [
        {
          roadmap_id: "r1_ironhud_minimal",
          roadmap_name: "R1 — IronHUD Minimal Pass (Apple × Stark)",
          lock_label:
            "LOCKED: IronHUD minimal styling, hero vs up-next, airy accordions, safe import/validation, iPhone Pro Max optimization",
          is_master: true,
          phases: [
            {
              phase_id: "hero",
              phase_name: "Hero Overview (Drama + Clarity)",
              phase_desc:
                "Big title, progress ring/bar, and 3 core metrics. No boxy panels—hairlines + ticks only.",
              items: [
                {
                  item_id: "hero_title",
                  title: "Weighted H1 + readable subheading and body copy",
                  status: "in_progress",
                  progress: 65,
                  is_deliverable: true,
                  detail:
                    "H1 44–56px desktop / 34–44px mobile; body 15–16px line-height 1.6."
                },
                {
                  item_id: "hero_metrics",
                  title: "Hero metrics: DONE / BLOCKERS / UP NEXT",
                  status: "in_progress",
                  progress: 55,
                  is_deliverable: true,
                  detail:
                    "Metrics must be scannable in < 1 second; calm contrast."
                }
              ]
            },
            {
              phase_id: "up_next",
              phase_name: "What’s Up Next (Single Strip)",
              phase_desc:
                "One clear directive under hero; not a wall of tasks.",
              items: [
                {
                  item_id: "next_strip",
                  title: "Up Next strip: one sentence + optional chevron action",
                  status: "in_progress",
                  progress: 60,
                  is_deliverable: true
                }
              ]
            },
            {
              phase_id: "accordion",
              phase_name: "Airy Accordions (Readability)",
              phase_desc:
                "More line spacing and less visual noise. Tap targets >= 44px.",
              items: [
                {
                  item_id: "accordion_spacing",
                  title: "Accordion headers taller; increased line spacing + separation rules",
                  status: "in_progress",
                  progress: 70,
                  is_deliverable: true
                },
                {
                  item_id: "status_badges",
                  title: "Consistent status badges (no emoji-status mixing)",
                  status: "in_progress",
                  progress: 55,
                  is_deliverable: true
                }
              ]
            },
            {
              phase_id: "import",
              phase_name: "Import + Validation (Never Crash)",
              phase_desc:
                "Load full dataset with one click. Invalid shows errors without crashing; overlay remains usable.",
              items: [
                {
                  item_id: "load_full",
                  title: "Load Full Dataset button injects this dataset and renders successfully",
                  status: "in_progress",
                  progress: 60,
                  is_deliverable: true
                },
                {
                  item_id: "load_invalid",
                  title: "Load Invalid Dataset shows validation errors without crash",
                  status: "in_progress",
                  progress: 45,
                  is_deliverable: true
                }
              ]
            },
            {
              phase_id: "mobile",
              phase_name: "Mobile-First (iPhone Pro Max)",
              phase_desc:
                "430×932 emulation pass: no horizontal scroll, safe-area respected, overlay scroll works.",
              items: [
                {
                  item_id: "safe_area",
                  title: "Safe-area padding (env(safe-area-inset-*)); header + actions bar safe",
                  status: "in_progress",
                  progress: 55,
                  is_deliverable: true
                },
                {
                  item_id: "tap_targets",
                  title: "Tap targets >= 44px for key controls",
                  status: "not_started",
                  is_deliverable: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      project_id: "speakly_ops",
      project_name: "Speakly Operator Systems",
      project_desc:
        "Governed multi-agent execution: Proposal → Build → QA → Ship. Side-Car is the visual layer for locks + receipts.",
      default_roadmap_id: "gov_pack",
      roadmaps: [
        {
          roadmap_id: "gov_pack",
          roadmap_name: "Governance Pack (Ship Gates)",
          lock_label: "LOCKED: receipts + release layer + QA sentinel + pair-pack enforcement",
          phases: [
            {
              phase_id: "qa_gates",
              phase_name: "QA Gates",
              items: [
                { item_id: "unzip_sha", title: "Integrity gates: unzip -t + sha256sum -c", status: "done", is_deliverable: true },
                { item_id: "prod_smoke", title: "Production smoke QA (GET / 200, assets OK, import valid/invalid safe)", status: "blocked", is_deliverable: true, blocker_reason: "Deploy URL must serve app at / (200)." }
              ]
            }
          ]
        }
      ]
    }
  ]
};
