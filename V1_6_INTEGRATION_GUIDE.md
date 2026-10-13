# v1.6 integration guide (S01D complete; Genesis outline closed)

1. Keep v1.5 as read-only historical baseline, but for new work only use this v1.6 ZIP.
2. Load `master/` and existing `phases/S01A/B/C/` byte-for-byte unchanged.
3. Register `phases/S01D/` after S01C, without rewriting S01C's `ep-gen-115.canonicalNextId`.
4. Resolve aliases by `genesis_integrated/handoff_resolution.json` — final `handoff-exo-001` is locked.
5. Full Genesis: 179 episode IDs, 50 chapters, 1533 verse references with no duplicates or gaps by validator. This verifies **coverage indexing**, not that all interpretive statements are correct.
6. If UI uses `master/schemas/release_slice.schema.json`, its schema version remains 1.2.0 for S01D.
7. Run `python genesis_integrated/validate_genesis.py` and each stage validator before merging branches.
8. Public release gate must remain BLOCKED for 179 unreviewed Genesis episodes and existing Israel history drafts.

### Migration note
`genesis_integrated` is a *derived navigation index*, not an independently rewritten historical version. IDs and content within earlier phase modules remain unchanged.
