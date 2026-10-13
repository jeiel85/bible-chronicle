# 모바일/PC UX 설계 — 창세기 원역사 대응

## 화면 구조

- **모바일 세로 < 640 CSS px**: 상단 시대 칩(`정경 진행 순서·연대 미확정`), 중간 16:9 일러스트 크롭(실제 생성시), 하단 본문 요약 1열, `관점/본문과 근거/개념지도` 하단 탭. 사용자 탭으로 카드 노출. 탭 순서 순환 없이 키보드 접근.
- **태블릿·모바일 가로 ≥ 640 / < 1024**: 2개 패널(좌: 삽화·개념지도, 우: 본문 카드), 서술 길이 단위와 스크롤 보존.
- **데스크톱 ≥ 1024**: 3열(좌: 22단계 목차, 중: 일러스트/지도, 우: 본문·사료·교사용 해설). 세로 창폭 좁히면 2열/1열 자동 축소.
- **시스템 회전**: orientation API 강제 회전은 지양. CSS container query / ResizeObserver 기반, 현재 episodeId 및 sceneId, 열람한 evidence card, 텍스트 배율, 지도 조작 상태를 유지.

## 화면 상태

```text
CampaignSelect > EpisodeLanding > StoryOpening
  > [Perspective | Evidence | Map] (사용자가 원하는 순서로 탐색)
  > CanonicalRecap > Lesson > NextFixedEpisode
```

`reducedMotion`, `highContrast`, `fontScale`, 키보드 포커스, 스크린리더 문구는 필수. 그림은 `altTextKo`가 제공되어야 하며 이미지 실제 파일이 없는 경우 플레이스홀더 카드 사용. 폭력·대규모 사망/노출 등 예민한 장면에 대한 숨김 설정 포함.

## 시안용 텍스트 와이어프레임

### 세로
```
┌────────────────────────────┐
│ GEN 7:1-24  |  연대 미확정 │
├────────────────────────────┤
│   [대형 사건 삽화]         │
│   창작적 재구성 라벨       │
├────────────────────────────┤
│ 큰물이 덮다               │
│ 간단한 3단계 사건 설명     │
│ 본문참조 GEN.7.1~GEN.7.24 │
├────────────────────────────┤
│ 관점 | 성경/근거 | 지도    │
├────────────────────────────┤
│ 정해진 본문 결말 ▶ 다음    │
└────────────────────────────┘
```

### 데스크톱
```
[22개 에피소드] | [16:9 일러스트 / 개념도] | [성경·외부사료 구분 카드]
[서사 고정 진행] | [연대표: 정경 순서만]    | [선택: 열람·관점]
```

## 학습 진척 저장

IndexedDB `bc-progress-s01a-v1`: `{contentVersion, episodeId, currentSceneId, visitedSceneIds, revealedClaimIds, perspectiveId, quizResponses, mapView, lastOrientation, fontScale}`. 어떤 필드도 `canonicalOutcomeId` 또는 `canonicalNextId` 수정 불가. 이전 버전의 ID가 존재하는 경우 로컬 진행도를 유지한다. 계정/텔레메트리/광고 네트워크 필요 없음.
