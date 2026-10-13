/** S01B UI-only branches. No database or networking dependencies. */
export type EducationEffect =
  | {type:'set_perspective'; value:'observer'|'character_lens_without_unrecorded_dialogue'|'fictional_witness_explicitly_labeled'}
  | {type:'reveal_card'; value:string}
  | {type:'open_panel'; value:'map'|'lesson'};
export interface StoryNode { id:string; sceneType:string; autoNext:string|null; choices:Array<{id:string;kind:string;next:string;effect:EducationEffect}>; }
export interface StoryGraph { episodeId:string; entrySceneId:string; scenes:StoryNode[]; }
export interface CanonicalEpisode {id:string; canonicalOutcomeId:string; canonicalNextId:string;canonicalOutcomeLocked:true;}
export function resolveChoice(graph:StoryGraph,episode:CanonicalEpisode,sceneId:string,choiceId:string){
  const scene=graph.scenes.find(s=>s.id===sceneId);
  if(!scene) throw new Error('Unknown scene');
  const c=scene.choices.find(c=>c.id===choiceId);
  if(!c) throw new Error('Unknown choice');
  if(!['inspection','learning_focus','narrative_perspective','reflection'].includes(c.kind))throw new Error('Unsupported choice');
  if(!graph.scenes.some(s=>s.id===c.next))throw new Error('Dangling choice');
  // canon is sourced solely from immutable episode, never choice effect.
  return {nextSceneId:c.next, educationalEffect:c.effect, immutableOutcomeId:episode.canonicalOutcomeId, immutableNextEpisodeId:episode.canonicalNextId};
}
export function resolveHandoff(id:string){
  if(id==='handoff-gen-012')return 'ep-gen-023';
  if(id==='handoff-gen-026')return null; // S01C is not authored yet
  return id;
}

export function setViewLens(episode:CanonicalEpisode, currentSceneId:string, mode:'observer'|'character_lens_without_unrecorded_dialogue'|'fictional_witness_explicitly_labeled') {
  // Deliberately returns presentation state only, with unchanged immutable route.
  return {currentSceneId,mode,canonicalOutcomeId:episode.canonicalOutcomeId,canonicalNextId:episode.canonicalNextId};
}
