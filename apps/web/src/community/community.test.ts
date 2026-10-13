import { describe, expect, it } from 'vitest';
import { joseph } from '../content/joseph';
import { nextAfter, openBranch, outcomeOf, proceedToOutcome, startEpisode } from '../engine/story';
import {
  biblicalNamesOf, canChoose, checkCommunity, eventAt, josephCommunity, resolve, startCommunity,
  type CommunityContent, type CommunityState,
} from './community';

const content = josephCommunity;

/** Plays the whole slice, deciding each household event with `pick`, and records the canonical path. */
function playThrough(pick: (state: CommunityState, choices: string[]) => string | null) {
  let community = startCommunity(content);
  const canon: string[] = [];
  let episodeId: string | null = joseph.episodes[0].id;
  while (episodeId) {
    let story = startEpisode(joseph, episodeId);
    const event = eventAt(content, episodeId);
    if (event) {
      const affordable = event.choices.filter(choice => canChoose(community, choice)).map(choice => choice.id);
      community = resolve(community, event, pick(community, affordable));
    }
    story = proceedToOutcome(joseph, story);
    canon.push(outcomeOf(joseph, story));
    const next = nextAfter(joseph, episodeId);
    episodeId = next.kind === 'episode' ? next.episodeId : null;
  }
  return { canon, community };
}

describe('household content (docs/16 §5.1)', () => {
  it('follows the content rules', () => {
    expect(checkCommunity(joseph, content, biblicalNamesOf(joseph))).toEqual([]);
  });

  it('catches a household text that names a biblical person', () => {
    const named: CommunityContent = {
      ...content,
      events: [{ ...content.events[0], situationKo: '요셉과 마주친 목자 가족' }],
    };
    expect(checkCommunity(joseph, named, biblicalNamesOf(joseph))).toContainEqual(expect.stringMatching(/요셉/));
  });

  it('treats a combined cast label as both names', () => {
    expect(biblicalNamesOf(joseph)).toEqual(expect.arrayContaining(['야곱', '이스라엘', '요셉', '유다']));
  });
});

describe('influence runs one way only', () => {
  it('household decisions never change the canonical path', () => {
    const first = playThrough((_, choices) => choices[0] ?? null);
    const last = playThrough((_, choices) => choices[choices.length - 1] ?? null);
    const none = playThrough(() => null);
    expect(first.community.resolutions).not.toEqual(last.community.resolutions);
    expect(last.canon).toEqual(first.canon);
    expect(none.canon).toEqual(first.canon);
    expect(first.canon).toEqual(joseph.episodes.map(episode => episode.canonicalOutcomeId));
  });

  it('canonical famine reaches the household even when the player decides nothing', () => {
    const famine = content.events.find(event => event.canonEffect)!;
    const before = startCommunity(content);
    const after = resolve(before, famine, null);
    expect(after.resources.grain).toBe(Math.max(1, before.resources.grain + (famine.canonEffect!.effects.grain ?? 0)));
  });

  it('story state carries no household data', () => {
    const state = openBranch(joseph, startEpisode(joseph, joseph.episodes[0].id), `${joseph.episodes[0].id}/choice-evidence`);
    expect(Object.keys(state).sort()).toEqual(['episodeId', 'lensCharacterId', 'perspective', 'revealedCardIds', 'sceneId', 'visitedSceneIds']);
  });
});

describe('no game over', () => {
  it('kin and neighbours refill an empty granary', () => {
    const hungry: CommunityState = { ...startCommunity(content), resources: { flock: 0, grain: 0, silver: 0, harmony: 0 } };
    const famine = content.events.find(event => event.canonEffect?.effects.grain)!;
    const after = resolve(hungry, famine, null);
    expect(after.resources.grain).toBe(1);
    expect(after.resolutions.at(-1)?.helped).toBe(true);
  });

  it('a household that always picks the hardest option still reaches the next generation', () => {
    const { community } = playThrough((_, choices) => choices[0] ?? null);
    expect(community.generation).toBe(2);
    expect(Object.values(community.resources).every(value => value >= 0 && value <= 10)).toBe(true);
  });

  it('refuses a choice the household cannot afford', () => {
    const buy = content.events.flatMap(event => event.choices.map(choice => ({ event, choice }))).find(({ choice }) => choice.requires)!;
    const poor: CommunityState = { ...startCommunity(content), resources: { flock: 5, grain: 5, silver: 0, harmony: 5 } };
    expect(() => resolve(poor, buy.event, buy.choice.id)).toThrow(/not affordable/);
  });

  it('resolves each event only once', () => {
    const event = content.events[0];
    const once = resolve(startCommunity(content), event, event.choices[0].id);
    expect(() => resolve(once, event, event.choices[0].id)).toThrow(/already resolved/);
  });
});
