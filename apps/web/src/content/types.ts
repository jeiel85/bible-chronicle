// Shapes of the phase package files (phases/S01D/data). Only the fields the app reads are declared.

export interface VerseRef { bookId: string; chapter: number; verse: number }

export interface Episode {
  id: string;
  stageId: string;
  titleKo: string;
  passage: { start: VerseRef; end: VerseRef; osis: string };
  narrativeSummaryKo: string;
  knowledgeObjectiveKo: string;
  canonicalOutcomeId: string;
  canonicalNextId: string;
  canonicalOutcomeLocked: true;
  castIds: string[];
  placeIds: string[];
  claimIds: string[];
  lessonId: string;
  illustrationId: string;
  sensitivity: string[];
}

export type EffectType = 'set_perspective' | 'reveal_card' | 'open_panel';

export interface Choice {
  id: string;
  kind: 'narrative_perspective' | 'inspection' | 'learning_focus' | 'reflection';
  labelKo: string;
  next: string;
  effect: { type: EffectType; value: string };
}

export type SceneType =
  | 'canonical_intro'
  | 'perspective_lens'
  | 'evidence_inspection'
  | 'atlas_inspection'
  | 'learning_reflection'
  | 'locked_canonical_outcome';

export interface Scene {
  id: string;
  sceneType: SceneType;
  headingKo: string;
  linesKo: string[];
  autoNext: string | null;
  choices: Choice[];
  claimId?: string;
  placeIds?: string[];
  lessonId?: string;
  canonicalOutcomeId?: string;
  perspectiveOptions?: { id: string; labelKo: string }[];
}

export interface EpisodeGraph { episodeId: string; entrySceneId: string; scenes: Scene[] }

export interface Lesson {
  id: string;
  episodeId: string;
  passage: string;
  learningGoalKo: string;
  questionKo: string;
  answers: { id: string; textKo: string; isCorrect: boolean }[];
  answerExplanationKo: string;
  reflectionPromptKo: string;
}

export interface Claim {
  id: string;
  assertionKo: string;
  scripturePassage: string;
  externalHistoricalEvidence: string;
  evidenceClassification: string;
  limitationKo: string;
}

export interface Place {
  id: string;
  labelKo: string;
  evidenceClass: string;
  cautionKo: string;
  approvedArchaeologicalPin: boolean;
  coordinate: [number, number] | null;
}

export interface Character { id: string; labelKo: string; isBiblicalNamedCharacter: boolean; editorial: string }

export interface Handoff { aliasId: string; resolvesTo: string | null; notes: string }

/** A planned illustration (assets_manifest). imageFile stays null until a reviewed picture exists. */
export interface ArtBrief { id: string; episodeId: string; visualBriefKo: string; altTextKo: string; imageFile: string | null }
