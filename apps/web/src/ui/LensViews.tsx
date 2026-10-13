import type { Slice } from '../content/joseph';
import type { Episode } from '../content/types';
import { notesMentioning, type VerseNote } from '../content/verses';
import { PERSPECTIVES, type Perspective, type StoryState } from '../engine/story';
import { displayName, followedCharacter, namedCast, namesOf, PERSPECTIVE_INFO } from './lens';

const verseLabel = (note: VerseNote) => `${note.chapter}:${note.verse}`;

interface ChooserProps {
  slice: Slice;
  episode: Episode;
  state: StoryState;
  protagonistId: string;
  onChoose: (perspective: Perspective, characterId: string | null) => void;
}

/** The lens scene: pick one of the four viewpoints, and for the supporting lens the person to follow. */
export function LensChooser({ slice, episode, state, protagonistId, onChoose }: ChooserProps) {
  const others = namedCast(slice, episode).filter(character => character.id !== protagonistId);
  const followed = followedCharacter(slice, episode, state, protagonistId);
  return (
    <div>
      <div className="choices" role="radiogroup" aria-label="시점">
        {PERSPECTIVES.map(perspective => (
          <button key={perspective} role="radio" aria-checked={state.perspective === perspective}
            className={state.perspective === perspective ? 'choice selected' : 'choice'} onClick={() => onChoose(perspective, null)}>
            <strong>{PERSPECTIVE_INFO[perspective].labelKo}</strong>
            <span className="choice-desc">{PERSPECTIVE_INFO[perspective].descKo}</span>
          </button>
        ))}
      </div>
      {state.perspective === 'supporting' && (
        others.length === 0 ? <p className="muted">이 장면에는 따라가 볼 다른 등장인물이 없습니다.</p> : (
          <div className="choices" role="radiogroup" aria-label="따라갈 인물">
            {others.map(character => (
              <button key={character.id} role="radio" aria-checked={followed?.id === character.id}
                className={followed?.id === character.id ? 'choice selected' : 'choice'} onClick={() => onChoose('supporting', character.id)}>
                {displayName(character)}
              </button>
            ))}
          </div>
        )
      )}
      <p className="hub-note">어느 시점을 고르든 이야기는 본문 그대로 이어집니다. 고른 시점은 다음 이야기에도 유지됩니다.</p>
    </div>
  );
}

interface CardProps {
  slice: Slice;
  episode: Episode;
  state: StoryState;
  protagonistId: string;
  hasHouseholdNews: boolean;
}

/** What the chosen lens adds at the hub. The observer lens adds nothing: it is the plain view. */
export function LensCard({ slice, episode, state, protagonistId, hasHouseholdNews }: CardProps) {
  if (state.perspective === 'observer') return null;
  const info = PERSPECTIVE_INFO[state.perspective];

  if (state.perspective === 'witness') {
    return (
      <section className="lens">
        <div className="chips"><span className="chip chip-fiction">시점: {info.labelKo} · 가상 인물</span></div>
        <p>{hasHouseholdNews
          ? '이 시대를 살아간 이름 없는 가족의 눈으로 봅니다. 아래 가문 소식에서 이 가족의 하루를 따라가 보세요.'
          : '이 장면에는 가문 소식이 없습니다. 가족은 멀리 떨어진 골짜기에서 일상을 이어 갑니다. 이 장면은 관찰자처럼 읽어 보세요.'}</p>
      </section>
    );
  }

  const followed = followedCharacter(slice, episode, state, protagonistId);
  const protagonistCharacter = slice.characterById.get(protagonistId);
  const protagonistName = protagonistCharacter ? displayName(protagonistCharacter) : protagonistId;
  if (!followed) {
    return (
      <section className="lens">
        <div className="chips"><span className="chip chip-scripture">시점: {info.labelKo}</span></div>
        <p className="muted">{state.perspective === 'protagonist'
          ? `이 장면에는 시대의 주인공(${protagonistName})이 나오지 않습니다. 이야기가 잠시 다른 인물에게 머무는 대목입니다.`
          : '이 장면에는 따라가 볼 다른 등장인물이 없습니다.'}</p>
      </section>
    );
  }

  const notes = notesMentioning(episode.id, namesOf(followed));
  const name = displayName(followed);
  return (
    <section className="lens">
      <div className="chips">
        <span className="chip chip-scripture">시점: {info.labelKo} · {name}</span>
        <span className="chip chip-caution">본문에 기록된 행동만 · 속마음·대사를 지어내지 않음</span>
      </div>
      <h3>{name}의 자리에서</h3>
      {notes.length === 0 ? <p className="muted">이 장면의 절별 해설에는 {name}이(가) 직접 언급되지 않습니다. 본문에서 이 인물이 어디에 있는지 찾아보세요.</p> : (
        <ul className="lens-verses">
          {notes.map(note => <li key={note.ref}><span className="verse-num">{verseLabel(note)}</span> {note.explanationKo}</li>)}
        </ul>
      )}
      <p className="hub-note">생각해 보기: 본문은 {name}의 행동을 어떻게 기록하나요? 기록되지 않은 마음은 추측으로 남겨 두세요.</p>
    </section>
  );
}

/** The v1.9 verse-by-verse notes of the episode, folded by default. */
export function VerseNotes({ notes }: { notes: VerseNote[] }) {
  if (notes.length === 0) return null;
  return (
    <details className="verse-notes">
      <summary>절별 해설 읽기 ({notes.length}절)</summary>
      <p className="chips"><span className="chip chip-study">편집부 1차 해설 · 원어 대조·전문가 검수 전</span></p>
      <ol>
        {notes.map(note => (
          <li key={note.ref}>
            <span className="verse-num">{verseLabel(note)}</span> {note.explanationKo}
            {note.focusedKo && <p className="focused"><strong>심화 해설:</strong> {note.focusedKo}</p>}
            {(note.riskFlag || note.reviewReasonKo) && (
              <p className="limit"><span className="chip chip-caution">해석 주의</span> {note.riskFlag ?? note.reviewReasonKo}</p>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}
