// Convergent story engine (docs/16 §2, docs/18 §3).
//
// The entry scene of an episode is a hub: the player may open any of its branches (perspective, evidence,
// map, lesson), come back, and open others. "Continue" always leads to the episode's single locked outcome
// scene, and the next episode always comes from the content's canonicalNextId. Nothing in StoryState can
// hold or change a canonical outcome; it only records what the player looked at.
import { outcomeScene, type Slice } from '../content/joseph';
import type { EpisodeGraph, Scene } from '../content/types';

/** The four viewpoints (docs/16 §4, D-003). */
export type Perspective = 'observer' | 'protagonist' | 'supporting' | 'witness';
export const PERSPECTIVES: Perspective[] = ['observer', 'protagonist', 'supporting', 'witness'];

/**
 * Viewpoint values of the phase packages, mapped to the four viewpoints (docs/16 §4 데이터 이관). The
 * packages stay unchanged; character names used as values (S01A: "noah") are a protagonist lens on them.
 */
export function migratePerspective(value: string | undefined): { perspective: Perspective; characterId: string | null } {
  switch (value) {
    case undefined: case 'observer': return { perspective: 'observer', characterId: null };
    case 'protagonist': case 'supporting': case 'witness': return { perspective: value, characterId: null };
    case 'character_lens_without_unrecorded_dialogue': return { perspective: 'protagonist', characterId: null };
    case 'fictional_witness': case 'fictional_witness_explicitly_labeled': return { perspective: 'witness', characterId: null };
    default: return { perspective: 'protagonist', characterId: value };
  }
}

export interface StoryState {
  episodeId: string;
  sceneId: string;
  /** Branch scenes this player opened in this episode, in order. */
  visitedSceneIds: string[];
  /** Evidence cards revealed (claim ids). */
  revealedCardIds: string[];
  perspective: Perspective;
  /** The biblical person a protagonist/supporting lens follows; null: the era's protagonist or the first cast member. */
  lensCharacterId: string | null;
}

export type Next = { kind: 'episode'; episodeId: string } | { kind: 'locked'; handoffId: string; noteKo: string };

function graphOf(slice: Slice, episodeId: string): EpisodeGraph {
  const graph = slice.graphById.get(episodeId);
  if (!graph) throw new Error(`Unknown episode ${episodeId}`);
  return graph;
}

export function currentScene(slice: Slice, state: StoryState): Scene {
  const scene = graphOf(slice, state.episodeId).scenes.find(candidate => candidate.id === state.sceneId);
  if (!scene) throw new Error(`Unknown scene ${state.sceneId}`);
  return scene;
}

/** Starts an episode. The viewpoint carries over between episodes; the followed person does not (the cast changes). */
export function startEpisode(slice: Slice, episodeId: string, perspective: Perspective = 'observer'): StoryState {
  const graph = graphOf(slice, episodeId);
  return { episodeId, sceneId: graph.entrySceneId, visitedSceneIds: [], revealedCardIds: [], perspective, lensCharacterId: null };
}

export function isAtHub(slice: Slice, state: StoryState): boolean {
  return graphOf(slice, state.episodeId).entrySceneId === state.sceneId;
}

export function isAtOutcome(slice: Slice, state: StoryState): boolean {
  return currentScene(slice, state).sceneType === 'locked_canonical_outcome';
}

/** Opens one branch of the hub. Only the hub's own registered choices are accepted. */
export function openBranch(slice: Slice, state: StoryState, choiceId: string): StoryState {
  if (!isAtHub(slice, state)) throw new Error('Branches open only from the episode hub');
  const choice = currentScene(slice, state).choices.find(candidate => candidate.id === choiceId);
  if (!choice) throw new Error(`Unregistered choice ${choiceId}`);
  const { type, value } = choice.effect;
  return {
    ...state,
    sceneId: choice.next,
    visitedSceneIds: state.visitedSceneIds.includes(choice.next) ? state.visitedSceneIds : [...state.visitedSceneIds, choice.next],
    revealedCardIds: type === 'reveal_card' && !state.revealedCardIds.includes(value) ? [...state.revealedCardIds, value] : state.revealedCardIds,
    // set_perspective on a hub choice only opens the lens scene: S01D sets "observer" on all 64 of them as a
    // template value, which would reset the player's own choice every time. The lens is chosen in that scene.
  };
}

export function returnToHub(slice: Slice, state: StoryState): StoryState {
  if (isAtOutcome(slice, state)) throw new Error('The outcome has been shown; continue to the next episode');
  return { ...state, sceneId: graphOf(slice, state.episodeId).entrySceneId };
}

/** Goes to the fixed outcome. Allowed from anywhere before it: no branch is required. */
export function proceedToOutcome(slice: Slice, state: StoryState): StoryState {
  return { ...state, sceneId: outcomeScene(graphOf(slice, state.episodeId)).id };
}

export function setPerspective(state: StoryState, perspective: Perspective, lensCharacterId: string | null = null): StoryState {
  return { ...state, perspective, lensCharacterId };
}

/** What follows this episode. Always taken from the content, never from the player's state. */
export function nextAfter(slice: Slice, episodeId: string): Next {
  const episode = slice.episodeById.get(episodeId);
  if (!episode) throw new Error(`Unknown episode ${episodeId}`);
  const target = episode.canonicalNextId;
  if (slice.episodeById.has(target)) return { kind: 'episode', episodeId: target };
  const handoff = slice.handoffById.get(target);
  if (!handoff) throw new Error(`${episodeId}: next ${target} is neither an episode nor a handoff`);
  if (handoff.resolvesTo && slice.episodeById.has(handoff.resolvesTo)) return { kind: 'episode', episodeId: handoff.resolvesTo };
  return { kind: 'locked', handoffId: handoff.aliasId, noteKo: handoff.notes };
}

/** The canonical outcome reached by a state at its outcome scene. */
export function outcomeOf(slice: Slice, state: StoryState): string {
  const scene = currentScene(slice, state);
  if (scene.sceneType !== 'locked_canonical_outcome' || !scene.canonicalOutcomeId) throw new Error('Not at the outcome');
  return scene.canonicalOutcomeId;
}
