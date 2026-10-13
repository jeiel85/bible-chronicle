# 03. 기술 아키텍처 및 데이터 파이프라인

## 1. 권장 구성: 로컬 우선 반응형 PWA

- Frontend: TypeScript + React + Vite, React Router, Zustand(플레이 세션), CSS variables / container queries
- Map: MapLibre GL JS + 기간별 GeoJSON/vector-tile layer. 프로덕션 지도 타일은 라이선스와 자체 호스팅 조건이 확인된 공급처 사용.
- Content: 정적 버전 관리 JSON 또는 압축된 JSON shard; 추후 SQLite/FTS로 규모 최적화 가능
- Schema: JSON Schema draft 2020-12 + 빌드 검사(Ajv 권장); TypeScript 정적 타입 생성(`json-schema-to-typescript` 권장)
- Persistence: IndexedDB(Dexie 검토) + schemaVersion 마이그레이션; 교육생 데이터/노트 로컬, 서버 계정 기본 미사용
- Offline: Service Worker (vite-plugin-pwa 검토) + 핵심 텍스트·지도 데이터·썸네일 캐싱 + 다운로드 팩
- Deployment: 정적 호스팅(GitHub Pages/Vercel 등) 가능; 서버/DB 없이 첫 릴리스. 호스팅 도메인은 별도 설정.
- Licensing: 라이브러리별 버전 고정과 SBOM, 콘텐츠 에셋별 권리 원장 별도 관리

MapLibre GL JS는 실제 지리 좌표, GeoJSON 계층, 지도 이동/줌을 처리하는 도구로 적합하다(공식 문서: https://maplibre.org/maplibre-gl-js/docs/). 고대 지도를 자동으로 만들어주지는 않으므로 원전 기반의 시대별 영토/이동선 자료 구축은 별도 작업이다.

## 2. 모듈 분해

```text
apps/web
  src/app                 # routing, modes, responsive shell
  src/engine              # deterministic canonical event engine
  src/content             # book/chapter/event/literary-unit loaders
  src/history             # fact claims, corroboration views
  src/map                 # geolocation, confidence render, time layers
  src/features/story      # scene, image, choice, outcome
  src/features/learning   # quiz, notes, discovery badges
  src/storage             # IndexedDB, migrations, backup
  src/ui                  # portrait/landscape/desktop shared components
packages/content-schema  # JSON Schema/types/validation
content/bible             # 66권, 장, 문학 단위
content/events            # 정경 사건 설명 및 병행본문
content/geography         # 지명, 좌표, 시대별 지리 엔티티
content/claims            # 개별 주장의 근거 기록
content/media             # 직접 제작 및 권리 확인 이미지
scripts                    # coverage, link, chronology, QA 검사
```

## 3. 이벤트/선택 결정론

- 이벤트 출처가 정의한 `canonicalOutcomeId`를 사건 결과의 유일한 진실로 유지.
- `Choice`에는 `inspectionTags`, `reflectionPrompt`, `screenFocus`, `nextSceneId`만 허용.
- 다음 정경 사건 목록은 `canonicalNextEventIds`로 별도 선언; 사용자의 화면 탐색 순서와 분리.
- 실제 역사 결과를 변경하는 메서드/상태가 엔진 타입에 존재해서는 안 된다.
- 앱을 재시작해도 선택 기록만 복원하고 사건 결과는 불변 정경 데이터로부터 재계산.
- 선택지에서 가상 대사를 만들 경우 명시적 `fictionalReconstruction` 표시 의무.

`reference/storyEngine.ts`가 위 계약의 최소 참조 구현이다.

## 4. 데이터 관계 (ERD 개념)

```text
BibleBook 1 ── N BibleChapter
BibleChapter N ── N LiteraryUnit
LiteraryUnit N ── N CanonicalEvent
CanonicalEvent N ── N PassageReference
CanonicalEvent N ── N HistoricalClaim
CanonicalEvent N ── N Scene
Scene 1 ── N Choice (화면/이해만 영향)
CanonicalEvent N ── N Place
Place N ── N GeoRepresentation(period, source, confidence)
CanonicalEvent N ── N MediaAsset (rights, source, createdBy)
UserProgress N ── 1 CanonicalEvent (읽음, 메모, 발견한 근거)
```

## 5. 시간 자료형 규약

```ts
type HistoricalTime =
 | {kind:'exactYear'; yearAstronomical:number; displayLabel:string; sourceIds:string[]}
 | {kind:'range'; startYearAstronomical:number; endYearAstronomical:number; displayLabel:string; sourceIds:string[]}
 | {kind:'relative'; anchorEventId:string; relation:'before'|'after'|'overlaps'; sourceIds:string[]}
 | {kind:'unknown'; displayLabel:'연대 미확정'; sourceIds:[]};
```

- 천문학적 연도는 정수 0을 기원전 1년으로 사용하므로 UI 표기에 반드시 변환기가 필요 (`0 → 1 BCE`, `-700 → 701 BCE`).
- 표시 문자열을 숫자 연도로 역변환하지 말고 표현/정렬용 메타데이터 분리.
- 대략적인 연대 범위는 단일 대표 연도로 바꾸지 않는다.

## 6. 공간 자료형 규약

- `Place` = 식별되는 고대 지명 + 언어별 이명 + 문헌 기록.
- `GeoRepresentation` = `Point | LineString | Polygon | MultiPolygon | null` + `validFrom`, `validTo`, `certainty`, `method`, `evidenceIds`.
- `unknown`이면 좌표가 없는 상태가 정상이며 지도에 기본 좌표(0,0)를 찍지 않는다.
- 정확한 유적 위치(`site`)와 불확실한 고대 지명 대응(`approximate`) 분리.
- 영역 데이터는 실제 학술 재구축이 확보되기 전까지 **그리지 않기**. 타임 슬라이더를 움직여도 해당 시대에 등록된 계층만 표시.
- 전투·강제 이주·포로 이동선은 '사료가 명시한 구간'과 '시각화를 위한 추정 경로'를 다른 스타일로 출력.

## 7. 데이터 콘텐츠 빌드

```text
Author draft (Markdown/structured editor)
  -> Bible reference checker
  -> chronology/claim provenance verifier
  -> source and license audit
  -> historical map QA
  -> editor review (text & teaching)
  -> publishable status
  -> JSON Schema validate
  -> static content build (hashed packs)
  -> offline pack & CDN publish
```

작성자·신학 검토자·역사 검토자가 동일 인물이어도 체크 기록은 역할별 남겨야 함. 검증 도장과 근거 URL은 빌드 아티팩트에 포함.

## 8. 콘텐츠 공개 API (정적 자산 규약)

```text
/content/manifest.v1.json
/content/books.v1.json
/content/chapters.v1.json
/content/events/arc-{arcId}.v1.json
/content/claims/claim-{claimId}.json
/content/places/period-{periodId}.geojson
/content/media/asset-index.v1.json
```

예시 API는 HTTP 서버 라우팅이 아니라 읽기 전용 파일 경로다. cache key=manifest version/sha256. 마이그레이션 버전 불일치시 데이터를 읽기 전용으로 열고 업데이트 안내. `localProgress`와 `contentData`를 별도 저장소로 유지.

## 9. 성능 예산 (설계 목표; 실측 수치 아님)

- 이동/줌은 60fps 지향, 저사양 모바일은 30fps 이상 목표(실측 필요).
- 라이트맵만 먼저 로드, 시대별 지형·문화 세력 계층 lazy-load.
- 일러스트 WebP/AVIF responsive srcset + 텍스트 먼저 표시 + 느린 네트워크 fallback.
- 오프라인 텍스트 패키지와 이미지 팩을 분리; 사용자가 선택 다운로드.
- 이미지는 처음 표시할 때 전체 가로폭 로드가 아니라 디바이스 픽셀 비율/해상도에 맞춰 제공.

## 10. 보안/개인정보

- 사용자 계정/추적 SDK/광고 없이 저장; 데이터 export/import JSON 기능 명시.
- 사용자 메모는 IndexedDB의 같은-origin 데이터로 브라우저 삭제 시 손실될 수 있어 백업 안내.
- 무결성 확인되지 않은 콘텐츠 팩은 로딩 금지.
- 렌더러에 임의 HTML 삽입 금지; Markdown 링크 sanitizer, CSP, 의존성 취약점 검사.
- 신규 이벤트 번들은 `schemaVersion`, `contentHash`, `reviewStatus`가 있어야 함.
