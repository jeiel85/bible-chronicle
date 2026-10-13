import type { Slice } from '../content/joseph';
import type { Episode, Scene } from '../content/types';
import type { StoryState } from '../engine/story';
import { osisToKo, SENSITIVITY_KO } from './labels';

interface Props {
  slice: Slice;
  episode: Episode;
  scene: Scene;
  state: StoryState;
  quizAnswer: string | undefined;
  onOpen: (choiceId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onNextEpisode: () => void;
  onPerspective: (perspective: string) => void;
  onAnswer: (lessonId: string, answerId: string) => void;
}

/** A content-type chip: text first, never colour alone (docs/04 화면 상세 규칙 1). */
function Chip({ kind, children }: { kind: 'scripture' | 'study' | 'fiction' | 'caution'; children: string }) {
  return <span className={`chip chip-${kind}`}>{children}</span>;
}

export function ScenePanel(props: Props) {
  const { slice, episode, scene, state } = props;
  const visited = new Set(state.visitedSceneIds);

  if (scene.sceneType === 'canonical_intro') {
    return (
      <section className="panel" aria-labelledby="scene-heading">
        <p className="passage">{osisToKo(episode.passage.osis)}</p>
        {/* The episode title is already the page heading; repeat the scene heading only when it says something else. */}
        <h2 id="scene-heading" className={scene.headingKo === episode.titleKo ? 'visually-hidden' : undefined}>{scene.headingKo}</h2>
        <div className="chips">
          <Chip kind="scripture">성경 기록 요약 · 검수 전 초안</Chip>
          {episode.sensitivity.filter(tag => SENSITIVITY_KO[tag]).map(tag => <Chip key={tag} kind="caution">{SENSITIVITY_KO[tag]}</Chip>)}
        </div>
        <ol className="beats">{scene.linesKo.map(line => <li key={line}>{line}</li>)}</ol>
        <h3 className="hub-title">무엇을 살펴볼까요?</h3>
        <p className="hub-note">어느 것을 고르든 이야기는 본문 그대로 이어집니다.</p>
        <div className="choices">
          {scene.choices.map(choice => (
            <button key={choice.id} className={visited.has(choice.next) ? 'choice visited' : 'choice'} onClick={() => props.onOpen(choice.id)}>
              {choice.labelKo}{visited.has(choice.next) && <span className="visited-mark" aria-label="살펴봄"> ✓</span>}
            </button>
          ))}
        </div>
        <button className="primary" onClick={props.onContinue}>이야기 계속 →</button>
      </section>
    );
  }

  if (scene.sceneType === 'locked_canonical_outcome') {
    return (
      <section className="panel outcome" aria-labelledby="scene-heading">
        <p className="passage">{osisToKo(episode.passage.osis)}</p>
        <h2 id="scene-heading">본문은 이렇게 이어집니다</h2>
        <Chip kind="scripture">성경 기록 요약 · 검수 전 초안</Chip>
        <p className="outcome-text">{scene.linesKo.join(' ')}</p>
        <p className="hub-note">이 결과는 어떤 선택으로도 바뀌지 않습니다.</p>
        <button className="primary" onClick={props.onNextEpisode}>다음 이야기 →</button>
      </section>
    );
  }

  const back = (
    <div className="branch-actions">
      <button onClick={props.onBack}>← 다른 것도 살펴보기</button>
      <button className="primary" onClick={props.onContinue}>이야기 계속 →</button>
    </div>
  );

  if (scene.sceneType === 'perspective_lens') {
    return (
      <section className="panel" aria-labelledby="scene-heading">
        <h2 id="scene-heading">{scene.headingKo}</h2>
        {scene.linesKo.map(line => <p key={line}>{line}</p>)}
        <div className="choices" role="radiogroup" aria-label="시점">
          {(scene.perspectiveOptions ?? []).map(option => (
            <button key={option.id} role="radio" aria-checked={state.perspective === option.id}
              className={state.perspective === option.id ? 'choice selected' : 'choice'} onClick={() => props.onPerspective(option.id)}>
              {option.labelKo}
            </button>
          ))}
        </div>
        <p className="hub-note">시점 렌즈 연출은 다음 단계(M4)에서 붙습니다. 지금은 선택한 시점이 저장만 됩니다.</p>
        {back}
      </section>
    );
  }

  if (scene.sceneType === 'evidence_inspection') {
    const claim = scene.claimId ? slice.claimById.get(scene.claimId) : undefined;
    return (
      <section className="panel" aria-labelledby="scene-heading">
        <h2 id="scene-heading">{scene.headingKo}</h2>
        {scene.linesKo.map(line => <p key={line}>{line}</p>)}
        {claim && (
          <article className="card">
            <div className="chips">
              <Chip kind="scripture">성경 기록</Chip>
              <Chip kind="caution">{claim.externalHistoricalEvidence === 'not_established' ? '외부 사료 입증: 확인되지 않음' : `외부 사료: ${claim.externalHistoricalEvidence}`}</Chip>
            </div>
            <p>{claim.assertionKo}</p>
            <p className="limit"><strong>이 자료가 말하지 않는 것:</strong> {claim.limitationKo}</p>
          </article>
        )}
        {back}
      </section>
    );
  }

  if (scene.sceneType === 'atlas_inspection') {
    const places = (scene.placeIds ?? []).map(id => slice.placeById.get(id)).filter(place => place !== undefined);
    return (
      <section className="panel" aria-labelledby="scene-heading">
        <h2 id="scene-heading">{scene.headingKo}</h2>
        <ul className="places">
          {places.map(place => (
            <li key={place.id}>
              <strong>{place.labelKo}</strong>
              <span className="muted"> — {place.approvedArchaeologicalPin && place.coordinate ? '검토된 위치' : '정확한 위치 미확정 (지도에 점을 찍지 않음)'}</span>
              <p className="limit">{place.cautionKo}</p>
            </li>
          ))}
        </ul>
        <p className="muted">{scene.linesKo[scene.linesKo.length - 1]}</p>
        {back}
      </section>
    );
  }

  // learning_reflection
  const lesson = scene.lessonId ? slice.lessonById.get(scene.lessonId) : undefined;
  const answered = lesson ? props.quizAnswer : undefined;
  return (
    <section className="panel" aria-labelledby="scene-heading">
      <h2 id="scene-heading">{scene.headingKo}</h2>
      {lesson && (
        <article className="card">
          <Chip kind="study">학습 문항 · 교사 검수 전</Chip>
          <p className="question">{lesson.questionKo}</p>
          <div className="choices" role="radiogroup" aria-label="답">
            {lesson.answers.map(answer => {
              const result = answered ? (answer.isCorrect ? ' correct' : answered === answer.id ? ' wrong' : '') : '';
              return (
                <button key={answer.id} role="radio" aria-checked={answered === answer.id} className={`choice${result}`}
                  onClick={() => props.onAnswer(lesson.id, answer.id)}>
                  {answer.textKo}{answered && answer.isCorrect && ' ✓'}
                </button>
              );
            })}
          </div>
          {answered && <p className="limit">{lesson.answerExplanationKo}</p>}
          <p className="muted">{lesson.reflectionPromptKo}</p>
        </article>
      )}
      {back}
    </section>
  );
}
