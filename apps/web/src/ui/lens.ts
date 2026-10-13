// Viewpoint lenses (docs/16 §4): which biblical person a protagonist/supporting lens follows in an episode.
import type { Slice } from '../content/joseph';
import type { Character, Episode } from '../content/types';
import type { Perspective, StoryState } from '../engine/story';

export const PERSPECTIVE_INFO: Record<Perspective, { labelKo: string; descKo: string }> = {
  observer: { labelKo: '관찰자', descKo: '과거를 지켜보는 현대의 나. 본문과 근거를 자유롭게 살펴봅니다.' },
  protagonist: { labelKo: '중심인물', descKo: '시대의 주인공 자리에서 봅니다. 본문에 기록된 행동만 보여 줍니다.' },
  supporting: { labelKo: '주변인물', descKo: '같은 사건을 다른 등장인물의 자리에서 다시 봅니다. 본문에 기록된 행동만 보여 줍니다.' },
  witness: { labelKo: '제3자', descKo: '이 시대를 살아간 이름 없는 가족의 눈으로 봅니다. 가족은 가상 인물입니다.' },
};

/** Named biblical people in the episode's cast (groups such as "요셉의 형제들" are left out). */
export function namedCast(slice: Slice, episode: Episode): Character[] {
  return episode.castIds
    .map(id => slice.characterById.get(id))
    .filter((character): character is Character => !!character && character.isBiblicalNamedCharacter);
}

export const namesOf = (character: Character) => character.labelKo.split('/').map(name => name.trim());

/** "야곱/이스라엘" -> "야곱(이스라엘)": the data's combined label, written for reading. */
export const displayName = (character: Character) => {
  const [name, ...others] = namesOf(character);
  return others.length ? `${name}(${others.join(', ')})` : name;
};

/**
 * The person the current lens follows, or null when there is nobody to follow: the protagonist lens in an
 * episode the protagonist is not in (Genesis 38), or a supporting lens with no other named person.
 */
export function followedCharacter(slice: Slice, episode: Episode, state: StoryState, protagonistId: string): Character | null {
  const cast = namedCast(slice, episode);
  if (state.perspective === 'protagonist') return cast.find(character => character.id === protagonistId) ?? null;
  if (state.perspective === 'supporting') {
    const others = cast.filter(character => character.id !== protagonistId);
    return others.find(character => character.id === state.lensCharacterId) ?? others[0] ?? null;
  }
  return null;
}
