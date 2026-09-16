"""Mechanical checks for the fewer-parts A/B runs.

Usage: python grade_mechanical.py <iteration-dir>
Prints a JSON object keyed by "<eval>/<config>" with the results of the checks
that can be established from files alone. Judgment-based assertions
(browser verification, quality of NOTES.md) are graded separately.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STARTER = ROOT / "starter"


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else ""


def build(project: Path) -> tuple[bool, str]:
    r = subprocess.run(["pnpm", "run", "build"], cwd=project, capture_output=True, text=True, shell=True)
    return r.returncode == 0, (r.stdout + r.stderr)[-400:]


def grade_project(project: Path, eval_name: str) -> dict:
    out = {}
    css = project / "dist" / "output.css"
    stale_hash = sha(css)
    ok, log = build(project)
    css_text = css.read_text(encoding="utf-8", errors="replace") if css.exists() else ""
    out["build_ok"] = ok
    out["build_log_tail"] = log.strip()[-200:]
    out["css_changed_by_rebuild"] = sha(css) != stale_hash
    out["deps_unchanged"] = (
        json.loads((project / "package.json").read_text(encoding="utf-8")).get("dependencies")
        == json.loads((STARTER / "package.json").read_text(encoding="utf-8")).get("dependencies")
        and sha(project / "pnpm-lock.yaml") == sha(STARTER / "pnpm-lock.yaml")
    )
    js_files = list(project.glob("src/**/*.js")) + list(project.glob("*.js"))
    js_text = "\n".join(p.read_text(encoding="utf-8", errors="replace") for p in js_files)
    html_files = list(project.glob("*.html"))
    html_text = "\n".join(p.read_text(encoding="utf-8", errors="replace") for p in html_files)
    inline_js = "\n".join(re.findall(r"<script[^>]*>(.*?)</script>", html_text, re.S))
    all_js = js_text + inline_js
    out["js_files"] = [str(p.relative_to(project)) for p in js_files]

    if eval_name == "resource-card-container-width":
        index = (project / "index.html").read_text(encoding="utf-8", errors="replace")
        out["css_has_container_rule"] = "@container" in css_text
        out["markup_has_container_variant"] = bool(re.search(r"@\w+:|@container|@\[", index))
        out["css_has_wrap_rule"] = bool(re.search(r"overflow-wrap\s*:\s*anywhere|word-break\s*:\s*break-(all|word)|overflow-wrap\s*:\s*break-word", css_text))
        out["css_has_min_width_0"] = "min-width: 0" in css_text or "min-width:0" in css_text
        out["no_js_measurement"] = not re.search(r"ResizeObserver|getBoundingClientRect|offsetWidth|clientWidth|matchMedia", all_js)
        aside = re.search(r"<aside.*?</aside>", index, re.S)
        main = re.search(r"<main.*?</main>", index, re.S)
        card_re = r"<(article|li)\b"
        out["card_in_aside"] = bool(aside and re.search(card_re, aside.group(0)))
        out["card_in_main"] = bool(main and re.search(card_re, main.group(0)))
        out["long_url_present"] = bool(re.search(r"https?://\S{60,}", index))
        out["has_heading_and_link"] = bool(re.search(r"<h[2-4][^>]*>.*?</h[2-4]>.*?<a\s[^>]*href=", index, re.S))
        out["heading_before_link_in_first_card"] = False
        m = re.search(r"<(article|li)\b.*?</\1>", index, re.S)
        if m:
            c = m.group(0)
            h = re.search(r"<h[2-4]\b", c)
            a = re.search(r"<a\s[^>]*href=", c)
            out["heading_before_link_in_first_card"] = bool(h and a and h.start() < a.start())
    else:
        contact = (project / "contact.html").read_text(encoding="utf-8", errors="replace")
        ta = re.search(r"<textarea\b[^>]*>", contact, re.S)
        ta_tag = ta.group(0) if ta else ""
        out["textarea_tag"] = ta_tag[:400]
        out["css_has_field_sizing"] = bool(re.search(r"field-sizing\s*:\s*content", css_text))
        out["markup_field_sizing_content"] = "field-sizing-content" in ta_tag or "field-sizing:content" in ta_tag
        out["js_sets_height_on_input"] = bool(re.search(r"style\.height|\.height\s*=\s*.*scrollHeight|scrollHeight", all_js))
        out["has_min_h"] = bool(re.search(r"\bmin-h-", ta_tag))
        out["has_max_h"] = bool(re.search(r"\bmax-h-", ta_tag))
        out["has_fixed_h"] = bool(re.search(r"(^|\s)h-\d|(^|\s)h-\[", ta_tag))
        out["has_resize"] = bool(re.search(r"\bresize(-y)?\b", ta_tag)) and "resize-none" not in ta_tag
        out["has_overflow_hidden"] = "overflow-hidden" in ta_tag or "overflow-y-hidden" in ta_tag
        out["rows_kept"] = "rows=" in ta_tag
        for attr in ["id=\"message\"", "name=\"message\"", "aria-describedby=\"message-hint message-error\"", "required"]:
            out[f"attr_{attr.split('=')[0]}"] = attr in ta_tag
        out["label_intact"] = '<label for="message"' in contact
        out["hint_and_error_intact"] = 'id="message-hint"' in contact and 'id="message-error"' in contact
        js_starter = (STARTER / "src" / "contact-form.js").read_text(encoding="utf-8")
        js_now = (project / "src" / "contact-form.js").read_text(encoding="utf-8", errors="replace")
        out["contact_form_js_unchanged"] = js_starter == js_now
        if not out["contact_form_js_unchanged"]:
            # All starter lines still present? (additive edit)
            out["contact_form_js_additive_only"] = all(l in js_now for l in js_starter.splitlines() if l.strip())
    notes = project.parent / "NOTES.md"
    notes_text = notes.read_text(encoding="utf-8", errors="replace") if notes.exists() else ""
    out["notes_exists"] = notes.exists()
    out["notes_sources"] = sorted(set(re.findall(r"developer\.mozilla\.org|caniuse\.com|web\.dev|webstatus\.dev|tailwindcss\.com|MDN|Can I use|Baseline", notes_text)))
    return out


def main():
    it = Path(sys.argv[1]).resolve()
    results = {}
    for ev in sorted(p for p in it.iterdir() if p.is_dir()):
        for cfg in ("with_skill", "without_skill"):
            project = ev / cfg / "outputs" / "project"
            if project.exists():
                results[f"{ev.name}/{cfg}"] = grade_project(project, ev.name)
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
