import { describe, expect, it } from 'vitest';
import { joseph } from './joseph';
import { checkNarration, josephNarration } from './narration';

describe('rewritten episode narration', () => {
  it('covers all 64 episodes with filled parts and cited verses', () => {
    expect(checkNarration(joseph, josephNarration)).toEqual([]);
  });

  it('catches a missing episode', () => {
    const { [joseph.episodes[0].id]: _dropped, ...rest } = josephNarration;
    expect(checkNarration(joseph, rest)).toContainEqual(expect.stringMatching(/no narration/));
  });

  it('quotes no Korean translation verbatim (spot check: no sentence ends in archaic 개역 endings)', () => {
    const sentences = Object.values(josephNarration).flatMap(entry => [...entry.introKo, entry.outcomeKo]);
    // Sentence-final only: modern words such as "하더라는" are fine.
    expect(sentences.filter(line => /(나이다|하시니라|하였더라|하더라|이니라)[.!?]?$/.test(line.trim()))).toEqual([]);
  });
});
