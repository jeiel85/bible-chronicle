# 10. 개발 에이전트 / 구현 착수 지시서

## 이 설계서로 무엇부터 만들 것인가

1. **프레임워크와 이벤트 엔진**부터 구현; 콘텐츠는 `data/chapter_index.json`의 현재 `not_authored` 상태를 보존.
2. `event.schema.json`을 앱 타입 및 JSON 검증에 사용. 샘플 2개의 가상 UI 연출만 구현하되 학술 검토 전 외부 공개 금지.
3. 66권/1,189장을 모두 표시하는 책장. 미집필 장에 거짓 요약/이미지 채우지 않음.
4. MapLibre에 **검증된** 지형 베이스 레이어를 연결할 계획. 샘플 `places.sample.geojson`은 미검증 좌표라 실제 표시용으로 사용하면 안 됨.
5. 3개 체험 시점, 3개 레이아웃을 동일 스토리/지도 데이터 소스에서 그릴 것.
6. 독립 사료/번역 본문의 권한·역사 확인이 끝나기 전 교보재 v1로 명명하지 않는다.

## 개발 에이전트에 전달하는 프롬프트

```text
Role: Experienced TypeScript/React architect and educational-content engineer.
Input: All files in Bible_Chronicle_Design_v1.zip.
Task: Build a runnable web PWA implementation, not a toy mock.
Priority: product correctness, deterministic canonical outcomes, offline-first,
accessible portrait/landscape/desktop UX, data provenance, licensing.

Constraints:
1. Follow docs/01_PRODUCT.md through docs/09_TEST_STRATEGY.md.
2. Load and display 66 books/1189 chapters from provided JSON; do not imply written content exists.
3. Use event schema and build-time validation; forbid canonical history mutation from choices.
4. Implement three viewpoints that only affect observation and scene presentation.
5. Build a local-first map view with appropriately licensed basemap sources and provenance;
   do not show the unverified sample coordinates as historically verified.
6. Include a visible distinction between canonical narrative, external evidence, debate,
   conjecture, fictional reconstruction, and theological assertions.
7. No analytics, ads, user account, remote LLM or tracking SDK.
8. Implement progress and notes via IndexedDB with export/import.
9. Include automated coverage, schema, graph, offline, E2E and resize/orientation tests.
10. Do not embed Korean Bible translations without confirming specific usage rights.
11. Use original graphics only. No Civilization copyrighted game assets.
12. Create README, CLI commands, CI and a release checklist.

Deliverable:
- Running React/Vite source with npm scripts: dev, build, test, lint, validate:content
- Responsive book shelf, era timeline, event/story scene, map and evidence drawer,
  teacher presentation mode, local progress, content integrity dashboard.
- 2 demo stories as clearly labelled demonstration content only.
- Changelog recording unimplemented editorial assets and historical verification blockers.

Acceptance:
- Same canonical outcome regardless of choices.
- All 66 book/1189 chapter entries navigable without inventing unreviewed content.
- User can switch orientation/size without losing event and progress state.
- No public-ready status until content/legal/historical review is complete.
```

## 최소 완성 기능을 검사할 사용자 행동 시나리오

- 홈 → 구약/신약 권수 확인 → 창세기 1장 → 미집필 상태 및 나중에 삽입할 원문/학습 위치 확인.
- 홈 → 앗수르 시대 샘플 → 라기스 사건 → 세 가지 배경 정보 선택 → 같은 사건 결과 카드 확인.
- 주제 → 외부 사료 버튼 → 대영박물관 라기스 자료 → 해당 자료가 보장하지 않는 범위 확인.
- 세로 화면 → 가로 화면 회전 → 라기스 사건과 지도 초점 유지.
- 오프라인 접속 → 기존 다운로드한 텍스트 학습 열람 → 노트 생성 → JSON 내보내기.

## 나중에 실제 성경 전권 제작 시 조직적으로 관리할 것

각 장 담당자가 작업 파일을 만들 때 강제되는 편집 메타데이터:

```yaml
bookId: GEN
chapter: 1
literaryUnits: []
scriptureReference: "창세기 1장"
originalSummaryKo: null
canonicalClaimIds: []
externalClaimIds: []
chronology: {kind: unknown}
geographyIds: []
illustrationAssetIds: []
teachingQuestions: []
rights: {translationSource: null, usagePermissionId: null}
review: {bible: pending, history: pending, geography: pending, legal: pending}
publication: not_authored
```

**공개 조건**: 내용 집필 + 성경 원문 확인 + 주장별 사료 검토(해당 시) + 지리 검토(해당 시) + 라이선스 통과 + 학습자 검증.


## v1.1 캠페인 통합 필수 지시

신규 `docs/campaign_israel/11_CAMPAIGN_PRODUCT.md`부터 `15_IMPLEMENTATION_TICKETS.md`를 읽고, `data/campaign_israel/`의 데이터를 **집필/검수 전 카탈로그**로 취급한다. 사용자가 이스라엘의 시작과 멸망을 캠페인 핵심 범위로 요구했다. 기존 66권 전체 확장 범위는 유지한다. 국경·날짜·대사·신학적 결론을 임의 생성하지 말고, 사실 검증 및 라이선스 체크 없는 콘텐츠를 공개하지 않는다.

`python scripts/validate_israel_campaign.py`를 CI에서 함께 돌린다.
