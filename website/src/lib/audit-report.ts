export interface ScoreRow {
  readonly dimension: string;
  readonly score: number;
  readonly note: string;
}

export interface Finding {
  readonly group: "Now" | "Next" | "Later";
  readonly id: string;
  readonly title: string;
  readonly evidence: string;
  readonly impact: number;
  readonly effort: "S" | "M" | "L";
  readonly risk: string;
  readonly confidence: string;
  readonly direction: string;
  readonly reduction: string;
}

/**
 * An illustrative excerpt in the shape the skill's audit workflow actually
 * produces: scored dimensions, ranked findings with repository evidence, and
 * the limits of the pass. The project, files, and scores are invented for the
 * page; the structure is the one in references/audit-review.md.
 */
export type ScoreBand = "high" | "low" | "mid";

/**
 * The 0-5 rubric in references/audit-review.md, banded for display: 2 and
 * below is a gap worth acting on, 3 is sound, 4 and above is strong. The tint
 * this drives is redundant with the numeral it sits behind.
 */
export const bandFor = function bandFor(score: number): ScoreBand {
  if (score >= 4) {
    return "high";
  }
  return score === 3 ? "mid" : "low";
};

export const auditReport = {
  prompt:
    "Audit this project's UI with $fewer-parts. Read-only — no changes yet.",
  scope:
    "14 components, 3 routes, the Tailwind v4 theme, and the shared stylesheet",
  score: "2.8",
  coverage: "Medium",
  summary:
    "Carefully labelled and consistent, with layout and overlay code still doing work the platform can own. Four changes account for most of the available reduction; the form-validation code should stay.",
  scorecard: [
    {
      dimension: "Interaction quality",
      score: 2,
      note: "The custom modal works by keyboard, but its close animation cannot be interrupted and focus briefly reaches the page behind it.",
    },
    {
      dimension: "Project and styling-system fit",
      score: 3,
      note: "Tailwind v4 is installed and mostly used; three components keep a parallel stylesheet with duplicated spacing.",
    },
    {
      dimension: "Runtime and dependency economy",
      score: 2,
      note: "Overlay, selected-state, and textarea measurement code duplicate behavior the current targets provide natively.",
    },
    {
      dimension: "Accessibility and semantics",
      score: 4,
      note: "Labelling, focus order, announcements, and reduced-motion handling are consistent; preserve them during simplification.",
    },
    {
      dimension: "Compatibility and fallbacks",
      score: 3,
      note: "Browserslist targets are respected, but two enhancements leave no usable base behind them.",
    },
    {
      dimension: "Consistency and maintainability",
      score: 3,
      note: "Conventions are clear. Token use drifts in the more recently added components.",
    },
  ] satisfies readonly ScoreRow[],
  findings: [
    {
      group: "Now",
      id: "R-01",
      title: "Card layout keyed to the viewport",
      evidence: "src/components/ResourceCard.css:42",
      impact: 4,
      effort: "S",
      risk: "Low",
      confidence: "High",
      direction:
        "Give the card slot a size container and move both breakpoints to @container, keeping the one-column layout as the base.",
      reduction: "Remove two viewport-specific card overrides.",
    },
    {
      group: "Now",
      id: "S-02",
      title: "Selected state synchronised in JavaScript",
      evidence: "src/components/PlanPicker.tsx:61",
      impact: 3,
      effort: "S",
      risk: "Low",
      confidence: "High",
      direction:
        "Style the selected card with :has(input:checked) and drop the change listener. The radio group already holds the state.",
      reduction: "Remove one listener and a mirrored selected-state class.",
    },
    {
      group: "Next",
      id: "N-03",
      title: "Custom overlay reimplements modality",
      evidence: "src/ui/Modal.tsx:18",
      impact: 4,
      effort: "M",
      risk: "Low",
      confidence: "Medium",
      direction:
        "Move to dialog.showModal() for the top layer, focus containment, and Escape. Keep the existing close animation and the confirm/cancel return values.",
      reduction:
        "Remove the focus trap, Escape handler, scroll lock, and overlay z-index contract.",
    },
    {
      group: "Later",
      id: "M-04",
      title: "Spacing values duplicated outside the token scale",
      evidence: "src/styles/legacy.css",
      impact: 2,
      effort: "M",
      risk: "Low",
      confidence: "High",
      direction:
        "Fold the remaining literal values into the Tailwind v4 theme so new components inherit them.",
      reduction: "Remove the parallel spacing scale after consumers migrate.",
    },
  ] satisfies readonly Finding[],
  strengths:
    "Form labelling, validation timing, focus order, and prefers-reduced-motion handling are consistent. The form script owns real application behavior and should not be removed merely because CSS can style validity.",
  gaps: "Safari was not available in this environment, so the container-query and :has() recommendations were checked against documentation rather than run there. Two routes behind authentication were not inspected.",
} as const;
