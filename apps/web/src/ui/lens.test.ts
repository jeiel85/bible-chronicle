import { describe, expect, it } from 'vitest';
import { joseph } from '../content/joseph';
import { eraProtagonistId, josephMoments } from '../content/moments';
import { setPerspective, startEpisode } from '../engine/story';
import { followedCharacter, namedCast } from './lens';

const protagonist = eraProtagonistId(josephMoments);
const episode = (id: string) => joseph.episodeById.get(id)!;

describe('viewpoint lenses', () => {
  it('every cast id of the slice is a known character', () => {
    const unknown = joseph.episodes.flatMap(item => item.castIds).filter(id => !joseph.characterById.has(id));
    expect([...new Set(unknown)]).toEqual([]);
  });

  it('the era protagonist is Joseph', () => {
    expect(joseph.characterById.get(protagonist)?.labelKo).toBe('요셉');
  });

  it('the protagonist lens follows Joseph where he is in the scene', () => {
    const first = joseph.episodes[0];
    const state = setPerspective(startEpisode(joseph, first.id), 'protagonist');
    expect(followedCharacter(joseph, first, state, protagonist)?.id).toBe(protagonist);
  });

  it('the protagonist lens follows nobody in Genesis 38, where Joseph is absent', () => {
    const judahTamar = joseph.episodes.find(item => item.passage.start.chapter === 38)!;
    expect(namedCast(joseph, judahTamar).map(character => character.id)).not.toContain(protagonist);
    const state = setPerspective(startEpisode(joseph, judahTamar.id), 'protagonist');
    expect(followedCharacter(joseph, judahTamar, state, protagonist)).toBeNull();
  });

  it('the supporting lens never follows the protagonist and defaults to another named person', () => {
    for (const item of joseph.episodes) {
      const state = setPerspective(startEpisode(joseph, item.id), 'supporting', protagonist);
      const followed = followedCharacter(joseph, episode(item.id), state, protagonist);
      expect(followed?.id).not.toBe(protagonist);
    }
  });
});
