/** Bible Chronicle Master v1.2.0: pure contract, not an app implementation */
export type BibleBookId = string; // validate against data/canon_books.json runtime registry
export type PassageRef = Readonly<{ bookId: BibleBookId; chapterStart: number; chapterEnd: number }>;
export type ChoiceKind = 'inspection' | 'learning_focus' | 'narrative_perspective' | 'reflection';
export type ClaimClass = 'biblical_account' | 'external_evidence' | 'scholarly_view' | 'theological_interpretation' | 'fictional_reconstruction';
export type DateConfidence = 'verified' | 'approximate' | 'disputed' | 'unknown' | 'not_applicable';
export type MapMode = 'none' | 'historical' | 'reconstruction' | 'symbolic';
export type EpisodeChoice = Readonly<{ id: string; kind: ChoiceKind; next: string }>;
export type Scene = Readonly<{ id: string; choices: readonly EpisodeChoice[] }>;
export type Episode = Readonly<{
  id: string; primaryPassage: PassageRef; outcomeId: string; outcomeLocked: true;
  scenes: readonly Scene[]; historicalReview: 'not_reviewed' | 'in_progress' | 'approved';
  map: { mode: MapMode; confidence: DateConfidence }; notForPublicRelease: boolean;
}>;
export type ReaderState = {
  episodeId: string; sceneId: string; canonicalOutcomeId: string;
  revealedDossiers: string[]; perspective: 'actor' | 'witness' | 'observer';
};
/** Throw if an editor accidentally introduces a choice that changes the canonical event outcome. */
export function chooseInspection(state: ReaderState, episode: Episode, choice: EpisodeChoice): ReaderState {
  if (!episode.outcomeLocked || state.canonicalOutcomeId !== episode.outcomeId) throw new Error('Canon lock mismatch');
  if (!['inspection','learning_focus','narrative_perspective','reflection'].includes(choice.kind)) throw new Error('Choice alters canon');
  const current = episode.scenes.find(s=>s.id===state.sceneId);
  if (!current?.choices.some(c=>c.id===choice.id && c.next===choice.next)) throw new Error('Choice not present in current scene');
  if (!episode.scenes.some(s=>s.id===choice.next)) throw new Error('Dangling scene transition');
  return {...state, sceneId:choice.next, canonicalOutcomeId:episode.outcomeId};
}
