export type Lens = "observer" | "character_lens_without_unrecorded_dialogue" | "fictional_witness_explicitly_labeled";
export type ChoiceKind = "inspection" | "learning_focus" | "narrative_perspective" | "reflection";
export interface UIState { episodeId: string; sceneId: string; lens: Lens; visitedPanels: string[]; }
export interface Choice { id: string; kind: ChoiceKind; next: string; effect: {type: "set_perspective" | "reveal_card" | "open_panel"; value: string}; }
export interface Scene { id:string; sceneType:string; autoNext:string|null; choices:Choice[]; }
export interface EpisodeGraph { episodeId:string; entrySceneId:string; scenes:Scene[]; }
export interface Episode { id:string; canonicalOutcomeLocked:true; canonicalOutcomeId:string; canonicalNextId:string; }
export function selectBranch(ep:Episode, graph:EpisodeGraph, state:UIState, choiceId:string):UIState {
  if(ep.id!==graph.episodeId || state.episodeId!==ep.id || ep.canonicalOutcomeLocked!==true) throw new Error("invalid episode");
  const scene=graph.scenes.find(s=>s.id===state.sceneId); if(!scene) throw new Error("missing scene");
  const choice=scene.choices.find(c=>c.id===choiceId); if(!choice) throw new Error("unregistered choice");
  if(!graph.scenes.some(s=>s.id===choice.next)) throw new Error("dangling branch");
  const lens=choice.effect.type==="set_perspective"?choice.effect.value as Lens:state.lens;
  const visitedPanels=choice.effect.type==="set_perspective"?state.visitedPanels:[...new Set([...state.visitedPanels,choice.effect.value])];
  return {...state,sceneId:choice.next,lens,visitedPanels};
}
export function advanceToCanon(ep:Episode, graph:EpisodeGraph, state:UIState):{nextId:string,canonId:string} {
  const scene=graph.scenes.find(s=>s.id===state.sceneId); if(!scene || scene.sceneType!=="locked_canonical_outcome") throw new Error("not at canonical outcome");
  return {nextId:ep.canonicalNextId,canonId:ep.canonicalOutcomeId};
}
export const handoffResolver:Readonly<Record<string,string|null>>={"handoff-gen-026":"ep-gen-064","handoff-gen-037":null};
