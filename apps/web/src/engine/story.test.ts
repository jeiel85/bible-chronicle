import { describe, expect, it } from 'vitest';
import { buildSlice, joseph } from '../content/joseph';
import {
  isAtHub, migratePerspective, nextAfter, openBranch, outcomeOf, proceedToOutcome, returnToHub, setPerspective, startEpisode,
  type StoryState,
} from './story';

/** Every order in which a player could open some or none of the hub's branches. */
function branchOrders(choiceIds: string[]): string[][] {
  const orders: string[][] = [[]];
  const extend = (prefix: string[]) => {
    for (const id of choiceIds) {
      if (prefix.includes(id)) continue;
      const order = [...prefix, id];
      orders.push(order);
      extend(order);
    }
  };
  extend([]);
  return orders;
}

function play(state: StoryState, order: string[]): StoryState {
  let current = state;
  for (const choiceId of order) current = returnToHub(joseph, openBranch(joseph, current, choiceId));
  return proceedToOutcome(joseph, current);
}

describe('Joseph slice content', () => {
  it('covers Genesis 37–50 as one unbroken chain of 64 episodes', () => {
    expect(joseph.episodes).toHaveLength(64);
    expect(joseph.episodes[0].passage.start).toMatchObject({ chapter: 37, verse: 1 });
    expect(joseph.episodes[63].passage.end.chapter).toBe(50);
  });

  it('refuses content whose chain skips an episode', () => {
    const episodes = joseph.episodes.map(episode => ({ ...episode }));
    episodes[0].canonicalNextId = episodes[2].id;
    expect(() => buildSlice({
      episodes, graphs: [...joseph.graphById.values()], lessons: [...joseph.lessonById.values()],
      claims: [...joseph.claimById.values()], places: [...joseph.placeById.values()],
      characters: [...joseph.characterById.values()], handoffs: [...joseph.handoffById.values()],
      art: [...joseph.artById.values()],
    })).toThrow(/broken chain/);
  });
});

describe('canonical outcomes cannot be changed by choices', () => {
  for (const episode of joseph.episodes) {
    it(`${episode.id}: every branch order reaches ${episode.canonicalOutcomeId}`, () => {
      const start = startEpisode(joseph, episode.id);
      const hubChoices = joseph.graphById.get(episode.id)!.scenes.find(scene => scene.id === start.sceneId)!.choices.map(c => c.id);
      const outcomes = new Set(branchOrders(hubChoices).map(order => outcomeOf(joseph, play(start, order))));
      expect([...outcomes]).toEqual([episode.canonicalOutcomeId]);
    });
  }

  it('the next episode depends only on the content, never on the player state', () => {
    for (const episode of joseph.episodes) {
      const index = joseph.episodes.indexOf(episode);
      const next = nextAfter(joseph, episode.id);
      if (index < 63) expect(next).toEqual({ kind: 'episode', episodeId: joseph.episodes[index + 1].id });
      else expect(next).toMatchObject({ kind: 'locked', handoffId: 'handoff-exo-001' });
    }
  });
});

describe('hub rules', () => {
  const first = joseph.episodes[0].id;

  it('rejects a choice that the hub does not register', () => {
    expect(() => openBranch(joseph, startEpisode(joseph, first), 'made-up-choice')).toThrow(/Unregistered/);
  });

  it('opens branches only from the hub and records what was looked at', () => {
    const hub = startEpisode(joseph, first);
    const evidenceChoice = `${first}/choice-evidence`;
    const opened = openBranch(joseph, hub, evidenceChoice);
    expect(isAtHub(joseph, opened)).toBe(false);
    expect(() => openBranch(joseph, opened, evidenceChoice)).toThrow(/only from the episode hub/);
    expect(opened.revealedCardIds).toEqual([joseph.episodes[0].claimIds[0]]);
    expect(isAtHub(joseph, returnToHub(joseph, opened))).toBe(true);
  });

  it('cannot go back to the hub once the outcome is shown', () => {
    expect(() => returnToHub(joseph, proceedToOutcome(joseph, startEpisode(joseph, first)))).toThrow(/outcome/);
  });
});

describe('four viewpoints (docs/16 §4)', () => {
  const first = joseph.episodes[0].id;

  it('maps every viewpoint value used in the phase packages', () => {
    expect(migratePerspective('observer')).toEqual({ perspective: 'observer', characterId: null });
    expect(migratePerspective('character_lens_without_unrecorded_dialogue').perspective).toBe('protagonist');
    expect(migratePerspective('fictional_witness_explicitly_labeled').perspective).toBe('witness');
    expect(migratePerspective('fictional_witness').perspective).toBe('witness');
    expect(migratePerspective('noah')).toEqual({ perspective: 'protagonist', characterId: 'noah' });
  });

  it('opening the lens branch does not reset the chosen viewpoint', () => {
    const chosen = setPerspective(startEpisode(joseph, first), 'supporting', 'jacob');
    const opened = openBranch(joseph, chosen, `${first}/choice-lens`);
    expect(opened).toMatchObject({ perspective: 'supporting', lensCharacterId: 'jacob' });
  });

  it('the viewpoint carries to the next episode, the followed person does not', () => {
    const next = startEpisode(joseph, joseph.episodes[1].id, setPerspective(startEpisode(joseph, first), 'witness').perspective);
    expect(next).toMatchObject({ perspective: 'witness', lensCharacterId: null });
  });
});
