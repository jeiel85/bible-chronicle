// Local progress (docs/03 §10, docs/18 §3): what the player looked at and answered, never a canonical outcome.
import { get, set } from 'idb-keyval';
import type { Slice } from '../content/joseph';
import type { StoryState } from '../engine/story';

const KEY = 'bible-chronicle.joseph.progress';
export const SCHEMA_VERSION = 1;

export interface Progress {
  schemaVersion: typeof SCHEMA_VERSION;
  story: StoryState;
  completedEpisodeIds: string[];
  /** lessonId -> chosen answer id */
  quizAnswers: Record<string, string>;
}

/**
 * A saved progress is used only if it still fits the content: a renamed episode or scene after a content
 * update would otherwise put the player on a scene that no longer exists.
 */
export function fitsContent(slice: Slice, value: unknown): value is Progress {
  if (!value || typeof value !== 'object') return false;
  const progress = value as Progress;
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
