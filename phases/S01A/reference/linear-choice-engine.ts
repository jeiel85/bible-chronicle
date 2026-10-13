/** S01-A design reference implementation; compile into actual app with automated tests. */
export type ChoiceKind = 'inspection' | 'learning_focus' | 'narrative_perspective' | 'reflection';
export type Effect = { type: 'set_perspective' | 'reveal_card' | 'open_panel' | 'mark_visited'; value: string };
export interface Choice { id:string; kind:ChoiceKind; labelKo:string; next:string; effect:Effect }
export interface Progress {
  episodeId:string; currentSceneId:string; perspectiveId:string;
  revealedClaimIds:string[]; visitedSceneIds:string[]; selectedPanel?:string;
}
export interface FixedEpisode { id:string; canonicalOutcomeId:string; canonicalNextId:string; canonicalOutcomeLocked:true }
export interface Scene { id:string; choices:Choice[] }
export interface FixedResult { progress:Progress; canonicalOutcomeId:string; canonicalNextId:string }
const effects = new Set<Effect['type']>(['set_perspective','reveal_card','open_panel','mark_visited']);
const kinds = new Set<ChoiceKind>(['inspection','learning_focus','narrative_perspective','reflection']);
export function applyLearningChoice(episode:FixedEpisode, current:Scene, choiceId:string, progress:Progress, allScenes:Scene[]):FixedResult {
  if (episode.canonicalOutcomeLocked !== true || episode.id !== progress.episodeId || current.id !== progress.currentSceneId) throw Error('Invalid episode state');
  const choice=current.choices.find(c=>c.id===choiceId);
  if (!choice || !kinds.has(choice.kind) || !effects.has(choice.effect.type)) throw Error('Unauthorized choice');
  if (!allScenes.some(s=>s.id===choice.next)) throw Error('Dangling destination');
  const p:Progress={...progress,currentSceneId:choice.next,revealedClaimIds:[...progress.revealedClaimIds],visitedSceneIds:[...progress.visitedSceneIds]};
  switch(choice.effect.type){
    case 'set_perspective': p.perspectiveId=choice.effect.value;break;
    case 'reveal_card': if(!p.revealedClaimIds.includes(choice.effect.value)) p.revealedClaimIds.push(choice.effect.value); break;
    case 'mark_visited': if(!p.visitedSceneIds.includes(choice.effect.value)) p.visitedSceneIds.push(choice.effect.value);break;
    case 'open_panel': p.selectedPanel=choice.effect.value;break;
  }
  // Crucial: those are returned from the immutable episode definition, not choice effects or local save files.
  return {progress:p,canonicalOutcomeId:episode.canonicalOutcomeId,canonicalNextId:episode.canonicalNextId};
}
