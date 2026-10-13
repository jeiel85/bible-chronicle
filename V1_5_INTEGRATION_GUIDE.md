# v1.5 unified design — Genesis 26–36

The directory `phases/S01C` is new. Existing phase files (`phases/S01A`, `phases/S01B`), all master schemas and 219 Israel history index entries are copied byte-for-byte from v1.4. The `master/data/integrated_v1_5_manifest.json` contains archive preservation checks.

## Migration

Episode `ep-gen-063` previously points to `handoff-gen-026`; the new alias resolves to `ep-gen-064` **without mutating the old episode**. Episode `ep-gen-115` leads to an intentionally unresolved `handoff-gen-037` until S01D is authored.

The `episode_index` and `scenes` arrays can be lazy-loaded by module. The data schema for the shared release slice stays at **v1.2.0**, a deliberate compatibility choice; package version 1.5 is not schema version 1.5.

## Validation

Run the new module validator and all prior phase/master validators. `validate_release_gate.py` must return nonzero because approval records are missing.
