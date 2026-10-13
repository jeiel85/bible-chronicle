import { useEffect, useRef } from 'react';
import { pictureOf, type Moment } from '../content/moments';
import { osisToKo } from './labels';

interface Props {
  moments: Moment[];
  onOpen: (moment: Moment) => void;
  onClose: () => void;
}

/** The player's chronicle: the Historic Moments seen so far, in story order. */
export function ChronicleDialog({ moments, onOpen, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="chronicle-title" onClick={event => event.stopPropagation()}>
        <header className="sheet-head">
          <h2 id="chronicle-title">나의 연대기</h2>
          <button ref={closeRef} onClick={onClose}>닫기</button>
        </header>
        {moments.length === 0 ? <p className="muted">아직 기록된 역사적 순간이 없습니다. 이야기를 따라가면 큰 사건마다 이곳에 남습니다.</p> : (
          <ol className="chronicle">
            {moments.map(moment => {
              const picture = pictureOf(moment);
              return (
                <li key={moment.id}>
                  <button onClick={() => onOpen(moment)}>
                    {picture ? <img src={picture} alt="" /> : <span className="thumb-empty" aria-hidden="true" />}
                    <span>
                      <strong>{moment.titleKo}</strong>
                      <span className="muted"> {osisToKo(moment.scriptureOsis)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
