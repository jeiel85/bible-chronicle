# Reference controller contract

`const active = nextScene(episode, scene, choiceId)` must only navigate among registered scene IDs. A user interaction may modify `uiState` keys, never `episode.canonicalOutcomeId` or `episode.canonicalNextId`.

`handoff-gen-026` is resolved to `ep-gen-064` at phase routing; `handoff-gen-037` intentionally remains locked until S01D.

`release_slice_v1_2.json` follows the current master JSON Schema and is **unpublishable** by design.
