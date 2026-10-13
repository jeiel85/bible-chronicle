// Historic Moments (docs/16 §3.3): full-screen illustration + narration at the turning points of an era.
// Content lives in content/moments/*.json; pictures in art/moments/<imageId>.webp once reviewed (docs/17 §4).
import momentsJson from '@repo/content/moments/joseph_moments.json';
import type { Slice } from './joseph';

export interface Moment {
  id: string;
  kind: 'era_transition' | 'moment';
  episodeId: string;
  /** before: shown when the episode starts; after: shown when the player leaves its outcome. */
  timing: 'before' | 'after';
  eraLabelKo: string;
  titleKo: string;
  protagonistHandoff?: { fromKo: string; toKo: string };
  narrationKo: string[];
  scriptureOsis: string;
  imageId: string;
}

const pictures = import.meta.glob('@repo/art/moments/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** The reviewed picture for a moment, or null while it has not been made (never another moment's picture). */
export function pictureOf(moment: Moment): string | null {
  const key = Object.keys(pictures).find(path => path.endsWith(`/${moment.imageId}.webp`));
  return key ? pictures[key] : null;
}

const verseKey = (osisVerse: string) => {
  const [, chapter, verse] = osisVerse.split('.').map(Number);
  return chapter * 1000 + verse;
};

/** Refuses moments that point at an unknown episode, repeat a slot, or cite verses outside their episode. */
export function checkMoments(slice: Slice, moments: Moment[]): string[] {
  const errors: string[] = [];
  const slots = new Set<string>();
  for (const moment of moments) {
    const episode = slice.episodeById.get(moment.episodeId);
    if (!episode) { errors.push(`${moment.id}: unknown episode ${moment.episodeId}`); continue; }
    const slot = `${moment.episodeId}/${moment.timing}`;
    if (slots.has(slot)) errors.push(`${moment.id}: a second moment at ${slot}`);
    slots.add(slot);
    if (moment.narrationKo.length < 1 || moment.narrationKo.length > 3) errors.push(`${moment.id}: narration must be 1–3 lines`);
    // The cited verses must overlap the episode's passage: a moment sums up its episode and may reach a verse
    // beyond it for context (41:46, Joseph's age), but cannot cite a different part of the story.
    const [start, end = start] = moment.scriptureOsis.split('-');
    const [passageStart, passageEnd] = episode.passage.osis.split('-');
    if (verseKey(start) > verseKey(end) || verseKey(end) < verseKey(passageStart) || verseKey(start) > verseKey(passageEnd)) {
      errors.push(`${moment.id}: ${moment.scriptureOsis} does not overlap ${episode.passage.osis}`);
    }
  }
  return errors;
}

export const josephMoments: Moment[] = (momentsJson as { moments: Moment[] }).moments;

export function momentAt(moments: Moment[], episodeId: string, timing: Moment['timing']): Moment | undefined {
  return moments.find(moment => moment.episodeId === episodeId && moment.timing === timing);
}
