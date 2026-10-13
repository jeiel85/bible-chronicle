// Local progress (docs/03 §10, docs/18 §3): what the player looked at and answered, never a canonical outcome.
import { get, set } from 'idb-keyval';
import type { Slice } from '../content/joseph';
import type { StoryState } from '../engine/story';
import { josephCommunity, startCommunity, type CommunityState } from '../community/community';

const KEY = 'bible-chronicle.joseph.progress';
export const SCHEMA_VERSION = 1;

export interface Progress {
  schemaVersion: typeof SCHEMA_VERSION;
  story: StoryState;
  completedEpisodeIds: string[];
  /** lessonId -> chosen answer id */
  quizAnswers: Record<string, string>;
  /** Historic Moments the player has seen, in order: the player's chronicle (docs/16 §3.3). */
  chronicleMomentIds: string[];
  /** The nameless household (docs/16 §5). Kept apart from the story state, which never reads it. */
  community: CommunityState;
}

/**
 * A saved progress is used only if it still fits the content: a renamed episode or scene after a content
 * update would otherwise put the player on a scene that no longer exists.
 */
export function fitsContent(slice: Slice, value: unknown): value is Progress {
  if (!value || typeof value !== 'object') return false;
  const progress = value as Progress;
  // Saves made before the chronicle existed are kept; they simply have an empty chronicle.
  if (!Array.isArray(progress.chronicleMomentIds)) progress.chronicleMomentIds = [];
  if (!progress.community || !Array.isArray(progress.community.resolutions)) progress.community = startCommunity(josephCommunity);
  if (progress.schemaVersion !== SCHEMA_VERSION || !progress.story) return false;
  const graph = slice.graphById.get(progress.story.episodeId);
  return !!graph && graph.scenes.some(scene => scene.id === progress.story.sceneId)
    && Array.isArray(progress.completedEpisodeIds) && typeof progress.quizAnswers === 'object';
}

export type LoadResult = { status: 'loaded'; progress: Progress } | { status: 'empty' } | { status: 'unavailable'; reason: string };

export async function loadProgress(slice: Slice): Promise<LoadResult> {
  try {
    const value = await get(KEY);
    if (value === undefined) return { status: 'empty' };
    return fitsContent(slice, value) ? { status: 'loaded', progress: value } : { status: 'empty' };
  } catch (error) {
    return { status: 'unavailable', reason: (error as Error).message };
  }
}

/** Resolves to an error message when the browser refuses to store (private mode, blocked storage). */
export async function saveProgress(progress: Progress): Promise<string | null> {
  try {
    await set(KEY, progress);
    return null;
  } catch (error) {
    return (error as Error).message;
  }
}
