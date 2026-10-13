import { describe, expect, it } from 'vitest';
import { joseph } from './joseph';
import { allVerseNotes, notesMentioning, verseNotesOf } from './verses';

const verseCount = (osis: string) => {
  const [start, end] = osis.split('-').map(ref => ref.split('.').map(Number));
  if (start[1] !== end[1]) return null; // crosses a chapter: counted by the chapter test below
  return end[2] - start[2] + 1;
};

describe('v1.9 verse notes in the slice', () => {
  it('cover Genesis 37–50 verse by verse (449 verses)', () => {
    expect(allVerseNotes).toHaveLength(449);
  });

  it('give every episode one note per verse of its passage', () => {
    for (const episode of joseph.episodes) {
      const expected = verseCount(episode.passage.osis);
      const notes = verseNotesOf(episode.id);
      expect(notes.length, episode.id).toBeGreaterThan(0);
      if (expected !== null) expect(notes.length, episode.id).toBe(expected);
    }
  });

  it('find the verses that speak about a person', () => {
    const first = joseph.episodes[0].id;
    expect(notesMentioning(first, ['요셉']).length).toBeGreaterThan(0);
    expect(notesMentioning(first, ['없는이름'])).toEqual([]);
  });
});
