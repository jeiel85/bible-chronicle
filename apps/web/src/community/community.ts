// The nameless household (docs/16 §5, D-004, D-007).
//
// Influence runs one way only: canonical events change the household (canonEffect), the household never
// changes the story. Nothing here takes or returns a StoryState, and the story engine never reads this.
import communityJson from '@repo/content/community/joseph_community.json';
import sourcesJson from '@repo/content/community/sources.json';
import type { Slice } from '../content/joseph';

export type ResourceId = 'flock' | 'grain' | 'silver' | 'harmony';
export type Effects = Partial<Record<ResourceId, number>>;

export interface CommunityChoice {
  id: string;
  labelKo: string;
  requires?: Effects;
  effects: Effects;
  resultKo: string;
}

export interface CommunityEvent {
  id: string;
  episodeId: string;
  kind?: 'generation';
  titleKo: string;
  canonEffect?: { effects: Effects; textKo: string; scriptureOsis: string };
  situationKo: string;
  choices: CommunityChoice[];
  /** Sourced background (not the household's story), so it may name biblical people when citing the text. */
  lifeNoteKo: string;
  lifeNoteSources: LifeNoteSource[];
  /** Points the player to the passage to compare; may name biblical people. */
  readAlongKo: string;
}

/** A life note's evidence: a passage of Genesis, or an entry of content/community/sources.json. */
export type LifeNoteSource = { kind: 'biblical_text'; osis: string } | { sourceId: string };

export interface ExternalSource {
  id: string;
  kind: 'external_primary' | 'external_secondary';
  citationKo: string;
  url: string;
  supportsKo: string;
  limitsKo: string;
}

export interface CommunityContent {
  householdKo: string;
  resources: { id: ResourceId; labelKo: string; start: number }[];
  events: CommunityEvent[];
}

export interface Resolution {
  eventId: string;
  /** null: the player passed the episode without deciding; the canonical effect still happened. */
  choiceId: string | null;
  /** A shortage was softened by help from kin and neighbours (no game over, docs/16 §5.1-8). */
  helped: boolean;
}

export interface CommunityState {
  generation: number;
  resources: Record<ResourceId, number>;
  resolutions: Resolution[];
}

export const MIN = 0;
export const MAX = 10;
const RESOURCE_IDS: ResourceId[] = ['flock', 'grain', 'silver', 'harmony'];

export function startCommunity(content: CommunityContent): CommunityState {
  const resources = Object.fromEntries(content.resources.map(resource => [resource.id, resource.start])) as Record<ResourceId, number>;
  return { generation: 1, resources, resolutions: [] };
}

export function eventAt(content: CommunityContent, episodeId: string): CommunityEvent | undefined {
  return content.events.find(event => event.episodeId === episodeId);
}

export function isResolved(state: CommunityState, eventId: string): boolean {
  return state.resolutions.some(resolution => resolution.eventId === eventId);
}

export function canChoose(state: CommunityState, choice: CommunityChoice): boolean {
  return Object.entries(choice.requires ?? {}).every(([id, amount]) => state.resources[id as ResourceId] >= (amount ?? 0));
}

/**
 * Applies an event once: its canonical effect, then the player's choice (or none when the episode was
 * passed by). An empty granary is refilled to 1 by kin and neighbours, so the household always goes on.
 */
export function resolve(state: CommunityState, event: CommunityEvent, choiceId: string | null): CommunityState {
  if (isResolved(state, event.id)) throw new Error(`${event.id} is already resolved`);
  const choice = choiceId === null ? null : event.choices.find(candidate => candidate.id === choiceId);
  if (choice === undefined) throw new Error(`${event.id}: unknown choice ${choiceId}`);
  if (choice && !canChoose(state, choice)) throw new Error(`${event.id}: ${choice.id} is not affordable`);
  const resources = { ...state.resources };
  for (const effects of [event.canonEffect?.effects ?? {}, choice?.effects ?? {}]) {
    for (const id of RESOURCE_IDS) resources[id] = Math.min(MAX, Math.max(MIN, resources[id] + (effects[id] ?? 0)));
  }
  const helped = resources.grain === 0;
  if (helped) resources.grain = 1;
  return {
    generation: state.generation + (event.kind === 'generation' && choice ? 1 : 0),
    resources,
    resolutions: [...state.resolutions, { eventId: event.id, choiceId: choice?.id ?? null, helped }],
  };
}

export function levelKo(value: number): string {
  if (value <= 2) return '부족';
  if (value <= 6) return '보통';
  return '넉넉';
}

const OSIS = /^GEN\.\d+\.\d+(-GEN\.\d+\.\d+)?$/;

/**
 * Content rules from docs/16 §5.1: events sit on real episodes, one per episode, the household's own text
 * never names a biblical person (the sourced life note and readAlongKo may, as they cite the text), and every
 * life note has evidence: a Genesis passage or a checked external source with what it does and does not support.
 */
export function checkCommunity(slice: Slice, content: CommunityContent, biblicalNames: string[], sources: ExternalSource[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const event of content.events) {
    if (!slice.episodeById.has(event.episodeId)) errors.push(`${event.id}: unknown episode ${event.episodeId}`);
    if (seen.has(event.episodeId)) errors.push(`${event.id}: a second event on ${event.episodeId}`);
    seen.add(event.episodeId);
    if (event.choices.length === 0) errors.push(`${event.id}: no choices`);
    if (!event.lifeNoteSources?.length) errors.push(`${event.id}: life note has no source`);
    for (const source of event.lifeNoteSources ?? []) {
      if ('osis' in source) {
        if (!OSIS.test(source.osis)) errors.push(`${event.id}: bad passage ${source.osis}`);
      } else {
        const found = sources.find(candidate => candidate.id === source.sourceId);
        if (!found) errors.push(`${event.id}: unknown source ${source.sourceId}`);
        else if (!found.url.startsWith('https://') || !found.supportsKo || !found.limitsKo) errors.push(`${found.id}: needs an https url, what it supports and its limits`);
      }
    }
    const ownText = [event.titleKo, event.situationKo, event.canonEffect?.textKo ?? '',
      ...event.choices.flatMap(choice => [choice.labelKo, choice.resultKo])].join('\n');
    for (const name of biblicalNames) {
      if (ownText.includes(name)) errors.push(`${event.id}: names the biblical person "${name}"`);
    }
    for (const choice of event.choices) {
      for (const id of Object.keys({ ...choice.effects, ...choice.requires })) {
        if (!RESOURCE_IDS.includes(id as ResourceId)) errors.push(`${event.id}/${choice.id}: unknown resource ${id}`);
      }
    }
  }
  return errors;
}

/**
 * Names of biblical people the household's text must not use: the slice's named cast ("야곱/이스라엘" counts
 * as both names). "바로" (Pharaoh) is left out: the data marks him unnamed, and the word is also a common adverb.
 */
export function biblicalNamesOf(slice: Slice): string[] {
  return [...new Set([...slice.characterById.values()]
    .filter(character => character.isBiblicalNamedCharacter)
    .flatMap(character => character.labelKo.split('/').map(name => name.trim())))];
}

export const josephCommunity = communityJson as unknown as CommunityContent;
export const communitySources = (sourcesJson as { sources: ExternalSource[] }).sources;
