// The Joseph-era slice (docs/18): Genesis 37–50, read unchanged from phases/S01D/data.
import episodesJson from '@repo/phases/S01D/data/episode_index.json';
import scenesJson from '@repo/phases/S01D/data/scenes.json';
import lessonsJson from '@repo/phases/S01D/data/lessons.json';
import claimsJson from '@repo/phases/S01D/data/claims.json';
import placesJson from '@repo/phases/S01D/data/place_catalog.json';
import charactersJson from '@repo/phases/S01D/data/characters.json';
import handoffsJson from '@repo/phases/S01D/data/handoffs.json';
import assetsJson from '@repo/phases/S01D/data/assets_manifest.json';
import type { ArtBrief, Character, Claim, Episode, EpisodeGraph, Handoff, Lesson, Place, Scene } from './types';

export interface Slice {
  episodes: Episode[];
  episodeById: Map<string, Episode>;
  graphById: Map<string, EpisodeGraph>;
  lessonById: Map<string, Lesson>;
  claimById: Map<string, Claim>;
  placeById: Map<string, Place>;
  characterById: Map<string, Character>;
  handoffById: Map<string, Handoff>;
  artById: Map<string, ArtBrief>;
}

const byId = <T extends { id: string }>(items: T[]) => new Map(items.map(item => [item.id, item]));

/** The scene where an episode's fixed biblical outcome is shown. Every episode has exactly one. */
export function outcomeScene(graph: EpisodeGraph): Scene {
  const found = graph.scenes.filter(scene => scene.sceneType === 'locked_canonical_outcome');
  if (found.length !== 1) throw new Error(`${graph.episodeId}: expected one locked outcome scene, found ${found.length}`);
  return found[0];
}

/**
 * Builds the slice and refuses inconsistent content: a broken chain or a scene graph whose outcome does not
 * match its episode would let the story drift from the canonical order.
 */
export function buildSlice(input: {
  episodes: Episode[]; graphs: EpisodeGraph[]; lessons: Lesson[]; claims: Claim[];
  places: Place[]; characters: Character[]; handoffs: Handoff[]; art: ArtBrief[];
}): Slice {
  const slice: Slice = {
    episodes: input.episodes,
    episodeById: byId(input.episodes),
    graphById: new Map(input.graphs.map(graph => [graph.episodeId, graph])),
    lessonById: byId(input.lessons),
    claimById: byId(input.claims),
    placeById: byId(input.places),
    characterById: byId(input.characters),
    handoffById: new Map(input.handoffs.map(handoff => [handoff.aliasId, handoff])),
    artById: byId(input.art),
  };
  const errors: string[] = [];
  input.episodes.forEach((episode, index) => {
    const graph = slice.graphById.get(episode.id);
    if (!graph) { errors.push(`${episode.id}: no scene graph`); return; }
    const sceneIds = new Set(graph.scenes.map(scene => scene.id));
    if (!sceneIds.has(graph.entrySceneId)) errors.push(`${episode.id}: missing entry scene`);
    for (const scene of graph.scenes) {
      for (const choice of scene.choices) {
        if (!sceneIds.has(choice.next)) errors.push(`${choice.id}: dangling choice`);
      }
    }
    try {
      if (outcomeScene(graph).canonicalOutcomeId !== episode.canonicalOutcomeId) errors.push(`${episode.id}: outcome mismatch`);
    } catch (error) {
      errors.push((error as Error).message);
    }
    const expectedNext = input.episodes[index + 1]?.id;
    const next = episode.canonicalNextId;
    if (expectedNext ? next !== expectedNext : !slice.handoffById.has(next)) errors.push(`${episode.id}: broken chain -> ${next}`);
  });
  if (errors.length) throw new Error(`Invalid slice content:\n${errors.join('\n')}`);
  return slice;
}

export const joseph: Slice = buildSlice({
  episodes: episodesJson as unknown as Episode[],
  graphs: scenesJson as unknown as EpisodeGraph[],
  lessons: lessonsJson as unknown as Lesson[],
  claims: claimsJson as unknown as Claim[],
  places: placesJson as unknown as Place[],
  characters: charactersJson as unknown as Character[],
  handoffs: handoffsJson as unknown as Handoff[],
  art: assetsJson as unknown as ArtBrief[],
});
