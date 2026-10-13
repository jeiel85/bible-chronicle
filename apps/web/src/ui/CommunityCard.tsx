import {
  canChoose, communitySources, isResolved, levelKo, type CommunityContent, type CommunityEvent, type CommunityState, type Effects,
} from '../community/community';
import { osisToKo } from './labels';

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/** The badge names exactly the kinds of evidence the note has (an external-only note gets no biblical label). */
export function lifeNoteLabel(kind: CommunityEvent['lifeNoteKind'], hasPassage: boolean, hasExternal: boolean): string {
  const prefix = kind === 'life_history' ? '생활사' : '성경 속 배경';
  const evidence = hasPassage && hasExternal ? '외부 자료와 성경 본문 근거' : hasExternal ? '외부 자료 근거' : '성경 본문 근거';
  return `${prefix} · ${evidence}`;
}

/** The life note with its evidence: Genesis passages, and checked external sources with their limits. */
function LifeNote({ event }: { event: CommunityEvent }) {
  const passages = event.lifeNoteSources.flatMap(source => ('osis' in source ? [source.osis] : []));
  const external = event.lifeNoteSources.flatMap(source => ('sourceId' in source ? communitySources.filter(found => found.id === source.sourceId) : []));
  return (
    <div className="life-note">
      <p className="limit">
        <span className="chip chip-study">{lifeNoteLabel(event.lifeNoteKind, passages.length > 0, external.length > 0)}</span> {event.lifeNoteKo}
      </p>
      <ul className="life-sources">
        {passages.length > 0 && <li>성경: {passages.map(osisToKo).join(', ')}</li>}
        {external.map(source => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">{source.citationKo}</a>
            <span className="muted"> — 이 자료가 말하지 않는 것: {source.limitsKo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EffectList({ content, effects }: { content: CommunityContent; effects: Effects }) {
  const entries = content.resources.filter(resource => effects[resource.id]);
  if (entries.length === 0) return null;
  return (
    <ul className="effects" aria-label="변화">
      {entries.map(resource => <li key={resource.id}>{resource.labelKo} {signed(effects[resource.id]!)}</li>)}
    </ul>
  );
}

export function ResourceBar({ content, state }: { content: CommunityContent; state: CommunityState }) {
  return (
    <dl className="resources">
      {content.resources.map(resource => (
        <div key={resource.id}>
          <dt>{resource.labelKo}</dt>
          <dd><meter min={0} max={10} low={3} high={7} optimum={10} value={state.resources[resource.id]} /> {levelKo(state.resources[resource.id])}</dd>
        </div>
      ))}
    </dl>
  );
}

interface Props {
  content: CommunityContent;
  event: CommunityEvent;
  state: CommunityState;
  onChoose: (choiceId: string) => void;
}

/** The household's news at an episode hub. Optional: the story goes on whether or not the player decides. */
export function CommunityCard({ content, event, state, onChoose }: Props) {
  const resolution = state.resolutions.find(candidate => candidate.eventId === event.id);
  const chosen = resolution?.choiceId ? event.choices.find(choice => choice.id === resolution.choiceId) : undefined;
  return (
    <section className="community" aria-labelledby={`${event.id}-title`}>
      <div className="chips">
        <span className="chip chip-fiction">가상 공동체 · 이름 없는 주변 사람들</span>
      </div>
      <h3 id={`${event.id}-title`}>{content.householdKo}: {event.titleKo}</h3>
      {event.canonEffect && (
        <p className="canon-effect">
          <span className="chip chip-scripture">성경 기록</span> {event.canonEffect.textKo} ({osisToKo(event.canonEffect.scriptureOsis)})
          <EffectList content={content} effects={event.canonEffect.effects} />
        </p>
      )}
      <p>{event.situationKo}</p>
      {!isResolved(state, event.id) ? (
        <div className="choices">
          {event.choices.map(choice => {
            const affordable = canChoose(state, choice);
            return (
              <button key={choice.id} className="choice" disabled={!affordable} onClick={() => onChoose(choice.id)}>
                {choice.labelKo}
                {!affordable && <span className="muted"> (은이 부족함)</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="community-result">
          <p>{chosen ? chosen.resultKo : '이번에는 따로 정하지 않고 지나갔다.'}</p>
          {chosen && <EffectList content={content} effects={chosen.effects} />}
          {resolution?.helped && <p className="muted">곡식이 바닥났지만 이웃과 친족의 도움으로 버텼다.</p>}
        </div>
      )}
      <LifeNote event={event} />
      <p className="read-along">함께 읽기: {event.readAlongKo}</p>
    </section>
  );
}
