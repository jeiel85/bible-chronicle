/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Content is read straight from the repository's phase packages (docs/18 §3), which sit outside this app.
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const repoFile = (path: string) => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), 'utf-8'));

/**
 * `virtual:joseph-verse-notes`: the v1.9 verse notes (genesis_verse_annotation_v1_9, 2 MB for all of Genesis)
 * cut down at build time to the slice's verses and the fields the app shows. The source file stays the
 * single source of truth; nothing derived is committed.
 */
function josephVerseNotes(): Plugin {
  const id = 'virtual:joseph-verse-notes';
  const resolved = `\0${id}`;
  return {
    name: 'joseph-verse-notes',
    resolveId: source => (source === id ? resolved : undefined),
    load(source) {
      if (source !== resolved) return undefined;
      const episodes = new Set((repoFile('phases/S01D/data/episode_index.json') as { id: string }[]).map(episode => episode.id));
      const review = new Map((repoFile('genesis_verse_annotation_v1_9/data/critical_review_queue.json') as { ref: string; reasonKo: string }[])
        .map(item => [item.ref, item.reasonKo]));
      type Note = { ref: string; chapter: number; verse: number; episodeId: string; explanationKo: string; riskFlag: string | null; priorFocusedExplanationKo: string | null };
      const notes = (repoFile('genesis_verse_annotation_v1_9/data/verse_commentary_1533.json') as Note[])
        .filter(note => episodes.has(note.episodeId))
        .map(note => ({
          ref: note.ref, chapter: note.chapter, verse: note.verse, episodeId: note.episodeId,
          explanationKo: note.explanationKo, riskFlag: note.riskFlag, focusedKo: note.priorFocusedExplanationKo,
          reviewReasonKo: review.get(note.ref) ?? null,
        }));
      return `export default ${JSON.stringify(notes)};`;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), josephVerseNotes()],
  resolve: { alias: { '@repo': repoRoot } },
  server: { fs: { allow: [repoRoot] } },
  // The phase content is versioned separately from the code; a separate chunk keeps code updates from
  // re-downloading it and shows its size on its own.
  build: {
    rollupOptions: {
      output: { manualChunks: id => (id.includes('/phases/') || id.includes('joseph-verse-notes') ? 'content' : undefined) },
    },
  },
  test: { environment: 'node' },
});
