import { useEffect, useRef, useState } from 'react';
import { joseph } from '../content/joseph';
import {
  currentScene, nextAfter, openBranch, proceedToOutcome, returnToHub, setPerspective, startEpisode, type Next,
} from '../engine/story';
import { loadProgress, saveProgress, SCHEMA_VERSION, type Progress } from '../storage/progress';
import { ScenePanel } from './ScenePanel';
import { osisToKo } from './labels';

const slice = joseph;
const FIRST = slice.episodes[0].id;

const freshProgress = (): Progress => ({
  schemaVersion: SCHEMA_VERSION, story: startEpisode(slice, FIRST), completedEpisodeIds: [], quizAnswers: {},
});

type Screen = 'loading' | 'title' | 'play';

export function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [progress, setProgress] = useState<Progress>(freshProgress);
  const [hasSave, setHasSave] = useState(false);
  const [storageProblem, setStorageProblem] = useState<string | null>(null);
  const [locked, setLocked] = useState<Extract<Next, { kind: 'locked' }> | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProgress(slice).then(result => {
      if (result.status === 'loaded') { setProgress(result.progress); setHasSave(true); }
      if (result.status === 'unavailable') setStorageProblem(result.reason);
      setScreen('title');
    });
  }, []);

  const update = (next: Progress) => {
    setProgress(next);
    saveProgress(next).then(setStorageProblem);
  };

  // Moving to another scene puts keyboard and screen-reader focus on its content.
  useEffect(() => { headingRef.current?.focus(); }, [progress.story.sceneId]);

  const { story } = progress;
  const episode = slice.episodeById.get(story.episodeId)!;
  const scene = currentScene(slice, story);
  const art = slice.artById.get(episode.illustrationId);
  const index = slice.episodes.indexOf(episode);

  const goToEpisode = (episodeId: string) => {
    update({ ...progress, story: startEpisode(slice, episodeId, story.perspective) });
    setListOpen(false);
  };

  const nextEpisode = () => {
    const completed = progress.completedEpisodeIds.includes(episode.id) ? progress.completedEpisodeIds : [...progress.completedEpisodeIds, episode.id];
    const next = nextAfter(slice, episode.id);
    if (next.kind === 'locked') { update({ ...progress, completedEpisodeIds: completed }); setLocked(next); return; }
    update({ ...progress, completedEpisodeIds: completed, story: startEpisode(slice, next.episodeId, story.perspective) });
  };

  if (screen === 'loading') return <main className="title-screen"><p>불러오는 중…</p></main>;

  if (screen === 'title') {
    return (
      <main className="title-screen">
        <p className="era-kicker">족장 시대 · 창세기 37–50장</p>
        <h1>요셉의 시대</h1>
        <p className="title-lede">야곱의 집에서 애굽의 궁정까지. 이야기는 성경에 기록된 그대로 흐르고, 당신은 그 곁에서 지켜보고 살펴봅니다.</p>
        <div className="title-actions">
          {hasSave && <button className="primary" onClick={() => setScreen('play')}>이어서 하기 ({index + 1} / {slice.episodes.length})</button>}
          <button className={hasSave ? '' : 'primary'} onClick={() => { update(freshProgress()); setScreen('play'); }}>
            {hasSave ? '처음부터' : '시작하기'}
          </button>
        </div>
        <p className="disclaimer">개발 미리보기 · 본문 요약·학습 문항은 전문가 검수 전 초안입니다. 성경 번역 본문은 사용 허가 확보 후 수록합니다.</p>
        {storageProblem && <p className="warning" role="alert">이 브라우저에서는 진행 저장을 할 수 없습니다: {storageProblem}</p>}
      </main>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="list-toggle" aria-expanded={listOpen} aria-controls="episode-list" onClick={() => setListOpen(open => !open)}>목록</button>
        <div className="era">
          <span className="era-name">요셉의 시대</span>
          <span className="era-meta">{osisToKo(episode.passage.osis)} · {index + 1} / {slice.episodes.length}</span>
        </div>
        <progress max={slice.episodes.length} value={progress.completedEpisodeIds.length} aria-label="완료한 이야기 수" />
      </header>

      <nav id="episode-list" className={listOpen ? 'episodes open' : 'episodes'} aria-label="이야기 목록">
        <ol>
          {slice.episodes.map((item, i) => (
            <li key={item.id}>
              <button aria-current={item.id === episode.id ? 'step' : undefined}
                className={item.id === episode.id ? 'current' : progress.completedEpisodeIds.includes(item.id) ? 'done' : ''}
                onClick={() => goToEpisode(item.id)}>
                <span className="num">{i + 1}</span> {item.titleKo}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <figure className="art">
        {art?.imageFile ? <img src={art.imageFile} alt={art.altTextKo} /> : (
          <div className="art-placeholder" role="img" aria-label={`일러스트 준비 중: ${art?.altTextKo ?? episode.titleKo}`}>
            <span className="art-badge">일러스트 준비 중</span>
            <p>{art?.visualBriefKo ?? episode.titleKo}</p>
          </div>
        )}
        <figcaption>상상 재현 일러스트 자리 · 역사 사진이 아닙니다</figcaption>
      </figure>

      <main className="story" ref={headingRef} tabIndex={-1}>
        <h1 className="episode-title">{episode.titleKo}</h1>
        {locked ? (
          <section className="panel outcome">
            <h2>창세기의 끝</h2>
            <p>요셉의 시대가 끝났습니다. 이야기는 출애굽기로 이어지지만, 그 부분은 아직 준비 중입니다.</p>
            <p className="muted">{locked.noteKo}</p>
            <button onClick={() => setLocked(null)}>마지막 이야기로 돌아가기</button>
          </section>
        ) : (
          <ScenePanel
            slice={slice} episode={episode} scene={scene} state={story} quizAnswer={progress.quizAnswers[episode.lessonId]}
            onOpen={choiceId => update({ ...progress, story: openBranch(slice, story, choiceId) })}
            onBack={() => update({ ...progress, story: returnToHub(slice, story) })}
            onContinue={() => update({ ...progress, story: proceedToOutcome(slice, story) })}
            onNextEpisode={nextEpisode}
            onPerspective={perspective => update({ ...progress, story: setPerspective(story, perspective) })}
            onAnswer={(lessonId, answerId) => update({ ...progress, quizAnswers: { ...progress.quizAnswers, [lessonId]: answerId } })}
          />
        )}
        {storageProblem && <p className="warning" role="alert">진행 저장 실패: {storageProblem}</p>}
      </main>
    </div>
  );
}
