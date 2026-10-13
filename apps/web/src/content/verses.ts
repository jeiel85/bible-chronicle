// v1.9 verse-by-verse notes for the slice (first-pass drafts, docs: genesis_verse_annotation_v1_9/README.md).
import notes from 'virtual:joseph-verse-notes';

export interface VerseNote {
  ref: string;
  chapter: number;
  verse: number;
  episodeId: string;
  explanationKo: string;
  /** An interpretive caution written with the note. */
  riskFlag: string | null;
  /** The v1.7 in-depth note kept for this verse, if any. */
  focusedKo: string | null;
  /** Why the verse is in the critical review queue, if it is. */
  reviewReasonKo: string | null;
}

const byEpisode = new Map<string, VerseNote[]>();
for (const note of notes as VerseNote[]) {
  const list = byEpisode.get(note.episodeId) ?? [];
  list.push(note);
  byEpisode.set(note.episodeId, list);
}
for (const list of byEpisode.values()) list.sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);

export const allVerseNotes = notes as VerseNote[];

export function verseNotesOf(episodeId: string): VerseNote[] {
  return byEpisode.get(episodeId) ?? [];
}

/** Notes in which any of the names appears: the verses where the text speaks about that person. */
export function notesMentioning(episodeId: string, names: string[]): VerseNote[] {
  return verseNotesOf(episodeId).filter(note => names.some(name => note.explanationKo.includes(name)));
}
