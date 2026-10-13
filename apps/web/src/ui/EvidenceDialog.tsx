import { useEffect, useRef } from 'react';
import type { Slice } from '../content/joseph';
import type { Claim } from '../content/types';
import { osisToKo } from './labels';

interface Props { slice: Slice; collectedIds: string[]; onClose: () => void }

/** The evidence collection: every claim card the player has opened, with what it does not prove. */
export function EvidenceDialog({ slice, collectedIds, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const all = slice.episodes.flatMap(episode => episode.claimIds);
  const collected = all.map(id => slice.claimById.get(id)).filter((claim): claim is Claim => !!claim && collectedIds.includes(claim.id));
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="evidence-title" onClick={event => event.stopPropagation()}>
        <header className="sheet-head">
          <h2 id="evidence-title">근거 카드 {collected.length} / {all.length}</h2>
          <button ref={closeRef} onClick={onClose}>닫기</button>
        </header>
        <p className="muted">에피소드에서 "성경 원문 위치·자료 상태 확인"을 열면 카드가 모입니다. 성경에 기록되었다는 것과 외부 사료로 입증되었다는 것은 다른 이야기입니다.</p>
        {collected.length === 0 ? <p className="muted">아직 모은 카드가 없습니다.</p> : (
          <ol className="evidence-list">
            {collected.map(claim => (
              <li key={claim.id} className="card">
                <p className="passage">{osisToKo(claim.scripturePassage)}</p>
                <div className="chips">
                  <span className="chip chip-scripture">성경 기록</span>
                  <span className="chip chip-caution">{claim.externalHistoricalEvidence === 'not_established' ? '외부 사료 입증: 확인되지 않음' : `외부 사료: ${claim.externalHistoricalEvidence}`}</span>
                </div>
                <p>{claim.assertionKo}</p>
                <p className="limit"><strong>이 자료가 말하지 않는 것:</strong> {claim.limitationKo}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
