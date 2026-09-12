"""Writes grading.json for the four iteration-1 runs.

Mechanical verdicts come from grade_mechanical.py output (all checks passed in
all four runs); judgment verdicts are recorded here with their evidence.
"""
import json
import pathlib

it = pathlib.Path(__file__).resolve().parent / "iteration-1"


def write(ev, cfg, verdicts, claims, notes):
    meta = json.loads((it / ev / "eval_metadata.json").read_text(encoding="utf-8"))
    timing = json.loads((it / ev / cfg / "timing.json").read_text(encoding="utf-8"))
    exps = [{"text": t, "passed": p, "evidence": e} for t, (p, e) in zip(meta["assertions"], verdicts)]
    passed = sum(1 for x in exps if x["passed"])
    g = {
        "expectations": exps,
        "summary": {"passed": passed, "failed": len(exps) - passed, "total": len(exps), "pass_rate": round(passed / len(exps), 3)},
        "execution_metrics": {"total_tool_calls": timing["tool_uses"], "errors_encountered": 0},
        "timing": {"executor_duration_seconds": timing["total_duration_seconds"], "total_duration_seconds": timing["total_duration_seconds"]},
        "claims": claims,
        "user_notes_summary": notes,
        "eval_feedback": {"suggestions": [], "overall": ""},
    }
    (it / ev / cfg / "grading.json").write_text(json.dumps(g, indent=2), encoding="utf-8")


card_common = [
    (True, "index.html wraps each <article> in <li class=\"@container\"> / <article class=\"@container\"> with @md: variants; dist/output.css contains '@container (width >= 28rem)' (grade_mechanical: css_has_container_rule=true)"),
    (True, "Long unbroken URL present in a card description; compiled CSS has 'overflow-wrap: anywhere' and 'min-width: 0'; text column uses minmax(0,1fr) (grade_mechanical: css_has_wrap_rule, css_has_min_width_0, long_url_present all true)"),
    (True, "<article> with h2/h3 title before an <a href> 'Open resource' link; heading level matches column context (grade_mechanical: heading_before_link_in_first_card=true)"),
    (True, "No JS added; src/contact-form.js unchanged and no ResizeObserver/getBoundingClientRect/matchMedia in any script (no_js_measurement=true)"),
    (True, "package.json dependencies and pnpm-lock.yaml identical to starter (deps_unchanged=true)"),
    (True, "pnpm run build re-run by grader succeeded; rebuilt output.css identical to committed one (css_changed_by_rebuild=false)"),
    (True, "Cards present inside both <aside> and <main> (card_in_aside=true, card_in_main=true)"),
]

write("resource-card-container-width", "with_skill", card_common + [
    (True, "NOTES.md support table cites caniuse.com URLs for container queries (106/110/16), overflow-wrap:anywhere, text-wrap balance/pretty, plus MDN Baseline status, looked up 2026-09-03"),
    (True, "Transcript: at 1280x900 sidebar cards measured 298px single-column while main cards 718px two-column on the same page; also 375 and 768 viewports; keyboard focus outline checked"),
], [
    {"claim": "No horizontal overflow at 375/768/1280", "type": "quality", "verified": True, "evidence": "scrollWidth==clientWidth checks reported for cards, paragraphs, document"},
    {"claim": "Contrast of accent-600 on white is 6.0:1", "type": "factual", "verified": False, "evidence": "Computed by the agent's own script (after correcting a gamma bug); not independently re-computed by grader"},
    {"claim": "Link is a 34px-tall touch target on mobile", "type": "factual", "verified": True, "evidence": "px-3 py-1.5 text-sm bordered pill; agent measured 34px at 375px"},
], {"uncertainties": ["Firefox/Safari not exercised; text-pretty is a no-op in Firefox"], "needs_review": [], "workarounds": ["MDN compat tables did not render via fetch; used Can I use instead", "Port 8847 was shared with other tasks; moved to 8873 after a curl content-length check"]})

write("resource-card-container-width", "without_skill", card_common + [
    (True, "NOTES.md support table cites MDN @container page (Baseline Widely available Feb 2023) and mdn/browser-compat-data JSON for overflow-wrap anywhere, hyphens auto, text-wrap pretty"),
    (True, "Transcript: at 1280x900 aside 300px / main 720px measured via DOM; sidebar cards single-column, main cards two-column '541px 113px'; also 375 and 768 presets. Keyboard focus explicitly listed as not exercised"),
], [
    {"claim": "No horizontal overflow at 375/768/1280", "type": "quality", "verified": True, "evidence": "scrollWidth<=clientWidth for every card and description; document scrollWidth===clientWidth"},
    {"claim": "Link 24px tall meets WCAG 2.5.8 minimum target size", "type": "factual", "verified": True, "evidence": "2.5.8 (AA) minimum is 24x24 CSS px; py-0.5 on a text-sm inline-flex link yields 24px as measured"},
    {"claim": "hyphens: auto works because page has lang=en", "type": "factual", "verified": True, "evidence": "index.html has <html lang=\"en\">; Tailwind emits -webkit-hyphens and hyphens"},
], {"uncertainties": ["Firefox/Safari not exercised", "Keyboard focus styling not exercised interactively"], "needs_review": [], "workarounds": ["Port 8847 collided with another task's server; identified own PID, stopped it, moved to 8819 after netstat + curl check"]})

ta_common = [
    (True, "textarea class list includes field-sizing-content (gated or direct); dist/output.css contains 'field-sizing: content'; no JS sets style.height or reads scrollHeight (js_sets_height_on_input=false)"),
    (True, "min-h and max-h present, no fixed h-* utility (has_min_h, has_max_h true; has_fixed_h false)"),
    (True, "resize-y present, resize-none absent (has_resize=true)"),
    (True, "No overflow-hidden; overflow-auto explicit or textarea default retained; agent observed scrollbar and scrollTop movement with 40 lines"),
    (True, "rows=\"4\" kept; no JavaScript required; without field-sizing the element is an ordinary bounded, resizable textarea"),
    (True, "src/contact-form.js byte-identical to starter (contact_form_js_unchanged=true); label for=message, aria-describedby=\"message-hint message-error\", hint and error elements intact"),
    (True, "NOTES.md explains implementation and fallback and cites MDN + Can I use (and more) for field-sizing support"),
    (True, "pnpm run build re-run by grader succeeded; output.css contains field-sizing: content (css_changed_by_rebuild=false)"),
]

write("autogrow-message-textarea", "with_skill", ta_common + [
    (True, "Transcript: empty 112px; 7 lines 186px; 40 lines capped 320px with scrollbar; form.reset() shrank a 306px field back to 112px (deleted content); manual drag to 266px; fallback simulated with field-sizing:fixed; mobile preset checked"),
], [
    {"claim": "field-sizing is Baseline Newly available since 2026-06-16 (Firefox 152)", "type": "factual", "verified": True, "evidence": "Consistent across caniuse, browser-compat-data JSON and webstatus.dev API as cited; matches the other run's independent lookup"},
    {"claim": "First-load computed values 114px/306px were an unexplained transient", "type": "factual", "verified": False, "evidence": "Those values equal the other textarea run's calc(4lh+1rem+2px)/calc(12lh+1rem+2px); both runs bound port 8847, so the first load almost certainly served the other run's page. Observation only; outputs unaffected"},
    {"claim": "@supports gate prevents unsupported engines from seeing the declaration", "type": "process", "verified": True, "evidence": "Emitted @supports (field-sizing:content) block confirmed in output.css. Note: the gate is redundant, since an unknown declaration is dropped anyway; the baseline run pointed this out"},
], {"uncertainties": ["Firefox/Safari not exercised", "Post-manual-resize behaviour is Chromium behaviour, not spec-defined"], "needs_review": ["Unexplained first-load values were actually cross-talk from a port collision"], "workarounds": ["MDN compat table and webstatus.dev HTML did not render via fetch; used JSON endpoints", "Pane did not deliver Ctrl+End/Enter; multi-line text set via DOM"]})

write("autogrow-message-textarea", "without_skill", ta_common + [
    (False, "Transcript reports 0/2/4 lines 114px, 6 lines 162px, 12 lines 306px, 40 lines 306px scrollable, and a manual drag on a one-line field afterwards (114px), which implies content was reduced and the height returned to the minimum. No explicit deleted-content check is reported and the omission is not listed under 'Not verified'. Indirect evidence only; graded strictly as not shown"),
], [
    {"claim": "field-sizing is Baseline 2026 Newly available; Chrome 123 / Firefox 152 / Safari 26.2", "type": "factual", "verified": True, "evidence": "Matches the with-skill run's independent three-source lookup"},
    {"claim": "No @supports block is needed because unknown declarations are dropped", "type": "factual", "verified": True, "evidence": "Standard CSS error handling; min/max-height and resize are universally supported"},
    {"claim": "calc(4lh+1rem+2px) reproduces the rows=4 height exactly (114px)", "type": "factual", "verified": True, "evidence": "Agent measured 114px both with field-sizing active and, in the other run, for the plain rows=4 fallback"},
], {"uncertainties": ["Firefox/Safari/Android not exercised; fallback path not run in a real non-supporting browser", "POST path not exercised (no backend)"], "needs_review": [], "workarounds": ["First measurement pass invalid because background tab had innerWidth 0; re-ran at 1280x720"]})

print("graded")
