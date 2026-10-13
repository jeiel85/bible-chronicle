import { useEffect, useRef } from 'react';
import type { CommunityContent, CommunityState } from '../community/community';
import { ResourceBar } from './CommunityCard';

interface Props { content: CommunityContent; state: CommunityState; onClose: () => void }

/** The household's standing and the decisions it made, in order. */
export function HouseholdDialog({ content, state, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="household-title" onClick={event => event.stopPropagation()}>
        <header className="sheet-head">
          <h2 id="household-title">우리 가문</h2>
          <button ref={closeRef} onClick={onClose}>닫기</button>
        </header>
        <p><span className="chip chip-fiction">가상 공동체</span> {content.householdKo} · {state.generation}세대</p>
        <p className="muted">이 가족은 이름 없는 가상 인물입니다. 이들의 선택은 성경의 이야기를 바꾸지 않습니다.</p>
        <ResourceBar content={content} state={state} />
        <h3>지나온 일</h3>
        {state.resolutions.length === 0 ? <p className="muted">아직 기록이 없습니다.</p> : (
          <ol className="household-log">
            {state.resolutions.map(resolution => {
              const event = content.events.find(candidate => candidate.id === resolution.eventId);
              const choice = event?.choices.find(candidate => candidate.id === resolution.choiceId);
              return (
                <li key={resolution.eventId}>
                  <strong>{event?.titleKo}</strong> — {choice ? choice.labelKo : '정하지 않고 지나감'}
                  {resolution.helped && <span className="muted"> (이웃의 도움)</span>}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
