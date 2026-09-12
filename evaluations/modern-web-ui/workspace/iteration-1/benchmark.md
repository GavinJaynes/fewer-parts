# Skill Benchmark: modern-web-ui

**Recorded executor model**: claude-fable-5-1 (as recorded by the original harness)
**Date**: 2026-09-03
**Evaluations**: 0 and 1, one run per configuration per task

This is the historical pilot for an earlier skill draft. It does not evaluate the current basic skill. The table below is reconstructed from the per-run records in `benchmark.json` and `timing.json`; the original generated summary incorrectly claimed three runs and reported zero tokens.

| Task | With skill: assertions / seconds / tokens | Without skill: assertions / seconds / tokens |
| --- | --- | --- |
| Resource card | 9/9 / 335.1 / 95,999 | 9/9 / 463.4 / 93,579 |
| Message textarea | 9/9 / 469.6 / 105,396 | 8/9 / 241.4 / 69,473 |

The single assertion difference concerned explicitly reporting a deleted-content check. Both configurations used the same primary native features. Two task pairs do not establish a consistent improvement; see the [evaluation narrative](../../modern-web-ui-evaluation.md).
