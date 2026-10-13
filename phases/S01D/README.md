# S01D — Genesis 37–50 / Joseph and Judah

**Release 1.6.0 (2026-10-13). CONTENT DESIGN DRAFT ONLY. Not a game build or a certified historicity review.**

- `64` episode outlines; each has verse-exact passage, editorially drafted story beats, six scene nodes, four player choices that cannot alter the biblical plot, one lesson draft and one original-art production brief.
- Genesis 37–50: `449` scripture verse mappings; no duplicated or missing verse by structural test.
- Nine manuscript categories: narrative, historical-status claims, relative chronology, location uncertainty, intertext, illustrations, sensitivity, classroom, and UI.
- No Korean Bible translation reproduced in the package; consult licensed source text in production.
- `../S01C` ends at `handoff-gen-037`, resolved here to `ep-gen-116`. Genesis finishes at `ep-gen-179`, after which `handoff-exo-001` stays locked.
- All release approvals **pending**. No new art images have been generated; visual briefs are specifications only.

Suggested reading sequence:
1. `docs/01_EPISODE_BIBLE.md` (all episodes and passages)
2. `docs/02_JOSEPH_JUDAH_EDITORIAL.md` (cross-chapter continuity and sensitive issues)
3. `docs/03_MAP_AND_HISTORY.md` (grounding and uncertainty)
4. `docs/04_UI_INTERACTIONS.md` (mobile/desktop scene contracts)
5. `docs/05_FACTCHECK_REGISTER.md` (unapproved/source status)
6. `docs/06_TEACHER_PLAYTHROUGH.md` (implementation-ready examples)
7. `docs/07_BUILD_HANDOFF.md` (QA, next tickets)
8. `../genesis_integrated/` (whole-Genesis continuity and coverage)

To validate: `python phases/S01D/scripts/validate_s01d.py`, then `python genesis_integrated/validate_genesis.py` from the package root.
