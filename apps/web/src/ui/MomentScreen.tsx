import { useEffect, useRef } from 'react';
import { pictureOf, type Moment } from '../content/moments';
import { osisToKo } from './labels';

interface Props {
  moment: Moment;
  /** replay: opened again from the chronicle, so closing does not move the story. */
  mode: 'story' | 'replay';
  onClose: () => void;
}

/** A Historic Moment (docs/16 §3.3): full-screen illustration, era, narration and scripture reference. */
export function MomentScreen({ moment, mode, onClose }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const picture = pictureOf(moment);

  useEffect(() => {
    buttonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && mode === 'replay') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, onClose]);

  return (
    <div className={`moment moment-${moment.kind}`} role="dialog" aria-modal="true" aria-labelledby="moment-title">
      <div className="moment-art">
        {picture ? <img src={picture} alt="" /> : <div className="art-placeholder"><span className="art-badge">일러스트 준비 중</span></div>}
      </div>
      <div className="moment-body">
        <p className="moment-kicker">{moment.kind === 'era_transition' ? '새로운 시대' : '역사적 순간'} · {moment.eraLabelKo}</p>
        <h2 id="moment-title">{moment.titleKo}</h2>
        {moment.protagonistHandoff && (
          <p className="moment-handoff">이야기의 중심 <span>{moment.protagonistHandoff.fromKo}</span> → <strong>{moment.protagonistHandoff.toKo}</strong></p>
        )}
        {moment.narrationKo.map(line => <p key={line} className="moment-line">{line}</p>)}
        <p className="moment-ref">{osisToKo(moment.scriptureOsis)}</p>
        <div className="chips">
          <span className="chip chip-scripture">성경 기록을 우리말로 요약 · 검수 전</span>
          <span className="chip chip-fiction">그림: 상상 재현 일러스트</span>
        </div>
        <button ref={buttonRef} className="primary" onClick={onClose}>
          {mode === 'story' ? '연대기에 기록하고 계속 →' : '닫기'}
        </button>
      </div>
    </div>
  );
}
