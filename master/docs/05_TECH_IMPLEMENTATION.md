# 05. 구현 실행 가이드 (설계 계약, 완성 코드 아님)

## 권장 엔진/플랫폼

**TypeScript + React + Vite PWA**를 1차 클라이언트로 권장. 정적 웹 호스팅/GitHub Pages + 오프라인 우선 서비스 워커 가능. 교회 앱에 직접 합치지 않고 독립 제품으로 개발 가능. 모바일 네이티브가 필요하면 추후 Capacitor/별도 앱 브리지 검토. 화면 엔진을 Web-first로 두면 같은 콘텐츠/레이아웃을 PC와 모바일에서 운영할 수 있다.

- 로컬 저장 IndexedDB (`contentVersion`, `saveSlot`, `visitedSceneIds`, `unlockedDossiers`, `lastCamera`, `language`, `textSize`).
- 콘텐츠는 버전된 로컬 JSON bundle과 미디어 파일; 네트워크가 없는 상태에서 기본 재생 가능.
- 맵 엔진: MapLibre GL JS **도입 전 패키지 라이선스 재확인**, 베이스맵은 Natural Earth 자체 정적 벡터/라스터로 사전 제작하여 원격 타일 의존을 제거한다. 정밀 지리좌표 없이 시대도식 모드 허용.
- 콘텐츠 컴파일 단계: 원고를 JSON Schema 검사 → 외부 근거 심사 → 번역권한 게이트 → 해시 및 버전 매니페스트 생성 → 정적 번들.
- 기기 방향 회전: `ResizeObserver`와 CSS container queries 설계; 지도 뷰포트/현재 사건/스크롤의 논리 상태를 보존.
- 학습은 계정 없이 브라우저 로컬 저장, 사용자가 직접 백업(JSON export/import). 추후 장치 간 동기화는 별도 동의 없이는 추가 금지.

## 사용자 화면 시나리오

- 모바일 세로: 지도는 요약 카드, 하단 시트에 사건 본문/근거/삽화, 한 손 조작 우선.
- 모바일 가로: 지도와 사건 설명 2분할; 시점 전환 퀵 메뉴, 원고/근거 나란히.
- 데스크톱: 연대표 좌측, 지도 중앙, 인물/외부사료 우측 3패널; Tab/Enter/Esc와 스크린리더.
- 교사 모드: 13차시 기본 연계, 수업용 대형 글씨, 애니메이션 줄이기, 발표자용 질문/정답 토글 (학습자 비공개는 로컬 표시 상태).

## 핵심 상태 머신

`Landing → ArcSelect → EpisodeIntro → Passage/ContextChoice → EvidenceOrMap → Recap → CanonicalNext`.

선택의 효과는 `revealedDossiers`, `perspective`, `lastVisitedPane`, `questionsAnswered`만 수정 가능. `canonicalOutcomeId`, 정경 사건의 대사 및 결과, 다음 필수 사건 ID 변경 금지. 변경 시 테스트 실패.

## 기술 리스크와 대응

- 성경 본문 저작권: 원문을 콘텐츠에 내장하지 않고 현재는 책/장/절 참조 중심.
- 정확한 고대 위치 불명: 지도 기능을 '없는 좌표'로도 정상 렌더링; 가짜 핀 금지.
- 엄청난 아트 규모: 사건 우선순위별 대형 삽화 1컷/핵심 사건, 동시 여러 해상도 출력; 이미지 제작·일러스트 권한 기록.
- 저장 구조 진화: 콘텐츠 ID와 저장 ID 분리, 버전 호환/마이그레이션 테스트.
- 대화 문맥 소실: 마스터 ZIP과 REVIEW_STATUS 정본으로 진행 상태 재현.

## 코드 저장소 권장 구조

```
/apps/web/src/
  features/chronicle/ features/map/ features/evidence/ features/lesson/
  stores/progress.ts  lib/contentLoader.ts  lib/choiceEngine.ts
/packages/content-contract/ /packages/content-validation/
/content/master/ /content/phases/S01/ /content/phases/S04/
/public/map-basemaps/ /public/art/
/scripts/verify-release.mjs
```

즉시 구현 착수 가능한 **설계 계약**이나 실제 화면 앱, 지도 세트, 완성된 성경 원고까지 제공했다는 뜻은 아니다.
