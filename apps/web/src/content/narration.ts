// Rewritten episode narration (content/narration): replaces the S01D scene lines on screen while the phase
// package stays unchanged. Written in our own words; no translation is quoted.
import narrationJson from '@repo/content/narration/joseph_narration.json';
import type { Slice } from './joseph';

export interface EpisodeNarration {
  /** The episode's opening narration, shown at the hub. */
  introKo: string[];
  /** The fixed biblical outcome, shown at the locked outcome scene. */
  outcomeKo: string;
  /** Why the quiz answer is right, with the verse to read. */
  quizExplanationKo: string;
}

export const josephNarration = (narrationJson as { episodes: Record<string, EpisodeNarration> }).episodes;

export function narrationOf(episodeId: string): EpisodeNarration | undefined {
  return josephNarration[episodeId];
}

/** Every slice episode has narration, nothing is left over, and each part is filled. */
export function checkNarration(slice: Slice, narration: Record<string, EpisodeNarration>): string[] {
  const errors: string[] = [];
  for (const episode of slice.episodes) {
    const entry = narration[episode.id];
    if (!entry) { errors.push(`${episode.id}: no narration`); continue; }
    if (entry.introKo.length < 1 || entry.introKo.length > 4 || entry.introKo.some(line => !line.trim())) errors.push(`${episode.id}: intro must be 1–4 lines`);
    if (!entry.outcomeKo.trim()) errors.push(`${episode.id}: empty outcome`);
    if (!/창세기 \d+:\d+/.test(entry.quizExplanationKo)) errors.push(`${episode.id}: quiz explanation must cite a verse`);
  }
  for (const id of Object.keys(narration)) {
    if (!slice.episodeById.has(id)) errors.push(`${id}: narration for an unknown episode`);
  }
  return errors;
}
