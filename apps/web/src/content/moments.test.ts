import { describe, expect, it } from 'vitest';
import { joseph } from './joseph';
import { checkMoments, josephMoments, momentAt, pictureOf, type Moment } from './moments';

describe('Joseph-era Historic Moments', () => {
  it('are consistent with the slice content', () => {
    expect(checkMoments(joseph, josephMoments)).toEqual([]);
  });

  it('open the era with one transition before its first episode', () => {
    const transitions = josephMoments.filter(moment => moment.kind === 'era_transition');
    expect(transitions).toHaveLength(1);
    expect(momentAt(josephMoments, joseph.episodes[0].id, 'before')).toBe(transitions[0]);
  });

  it('each have an adopted illustration (docs/18 M2)', () => {
    expect(josephMoments.filter(moment => !pictureOf(moment)).map(moment => moment.id)).toEqual([]);
  });

  it('reject a moment that cites another part of the story', () => {
    const stray: Moment = { ...josephMoments[1], id: 'stray', scriptureOsis: 'GEN.45.1-GEN.45.8' };
    expect(checkMoments(joseph, [stray])[0]).toMatch(/does not overlap/);
  });

  it('reject two moments in the same slot', () => {
    expect(checkMoments(joseph, [josephMoments[1], { ...josephMoments[1], id: 'twin' }])).toContainEqual(expect.stringMatching(/second moment/));
  });
});
