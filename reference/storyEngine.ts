/**
 * Bible Chronicle deterministic reference engine.
 * This code is illustrative but valid TypeScript; instantiate after parsing/validating JSON Schema.
 * All historical outcomes are immutable canonical source data.
 */

export interface Choice {
  id: string;
  labelKo: string;
  inspectionTags: string[];
  nextSceneId: string;
  reflectionPrompt?: string;
  screenFocus?: 'image' | 'map' | 'evidence' | 'scripture';
}

export interface Scene {
  id: string;
  type: 'scripture_reading' | 'historical_reconstruction' | 'evidence_comparison' | 'literary_reflection';
  disclosureKo: string;
  imageAssetId: string | null;
  choices: Choice[];
}

export interface CanonicalEvent {
  id: string;
  titleKo: string;
  canonicalOutcomeId: string;
  canonicalNextEventIds: string[];
  scenes: Scene[];
}

export interface StorySession {
  eventId: string;
  sceneId: string | null;
  selectedChoiceIds: string[];
  inspectedTags: string[];
  isComplete: boolean;
}

export function startEvent(event: CanonicalEvent): StorySession {
  return {
    eventId: event.id,
    sceneId: event.scenes[0]?.id ?? null,
    selectedChoiceIds: [],
    inspectedTags: [],
    isComplete: event.scenes.length === 0,
  };
}

export function choose(event: CanonicalEvent, state: Readonly<StorySession>, choiceId: string): StorySession {
  if (event.id !== state.eventId) throw new Error('State/event mismatch');
  if (state.isComplete) throw new Error('Event already completed');
  const scene = event.scenes.find(s => s.id === state.sceneId);
  if (!scene) throw new Error('Scene not found');
  const choice = scene.choices.find(c => c.id === choiceId);
  if (!choice) throw new Error('Choice does not exist in active scene');
  if (!event.scenes.some(s => s.id === choice.nextSceneId)) throw new Error('Unknown next scene');
  return {
    eventId: state.eventId,
    sceneId: choice.nextSceneId,
    selectedChoiceIds: [...state.selectedChoiceIds, choice.id],
    inspectedTags: Array.from(new Set([...state.inspectedTags, ...choice.inspectionTags])),
    isComplete: false,
  };
}

export function finishEvent(event: CanonicalEvent, state: Readonly<StorySession>) {
  if (event.id !== state.eventId) throw new Error('State/event mismatch');
  const active = event.scenes.find(s => s.id === state.sceneId);
  if (active?.choices.length) throw new Error('Cannot finish while choices remain');
  return {
    session: { ...state, isComplete: true },
    /** Note: outcome never originates in state, and a choice cannot set it. */
    canonicalOutcomeId: event.canonicalOutcomeId,
    canonicalNextEventIds: [...event.canonicalNextEventIds],
  } as const;
}
