# Bible Chronicle — Stage 0 Master Bible Atlas v1.2.0

2026-10-12 · 기준: 개신교 66권/1,189장 · 마스터 설계 (집필 전)

## 목적

성경의 정경적 사건의 결말을 게임 선택지로 바꾸지 않는 **역사·문학·신학 학습 게임/교보재**의 단일 계약을 확정한다. 본 마스터 파일은 다음 대화/작업이 전체 흐름에서 분리되어도 복원되도록 설계했다.

## 핵심 검증값

- 성경 권: **66권**; 장: **1189장**. 원본 `data/books.json`과 개수/순서가 동일하다.
- 문학적 *거시 단락의 초안*: **250개**. 1,189개 장이 정확히 하나의 1차 거시 단락에 귀속된다. 절별 구분과 학술 검증은 미완료.
- 기존 이스라엘 역사 캠페인 **219개 에피소드 개요** ID는 보존했고, 그 일부 장별 연결을 새 색인에서 참조한다.
- 성경 병행·연관성 **23개 수작업 검토 대기 그룹**. 이는 확정된 사건 일치표가 아니다.
- 서사 매크로 아크 **15개**, 작업 단계 **15개** (S00~S14).
- 현재 집필 완성 장: **0장**, 최종 사실 검증 완료 장: **0장**, 새로 검증된 모든 역사 주장: **0건**. 외부 근거 예시는 링크로 제공하며 각 주장에 따라 추후 출처 범위 검수를 수행한다.

## 파일 지도

1. `data/canon_books.json`, `data/chapter_master_index.json`, `data/literary_units.json`: 66권·1,189장과 문학 단락 계획
2. `data/story_arcs.json`: 시간순 사건과 비시간순 동반 독서, 선지자 시대 교차 연계
3. `data/parallel_groups.json`: 중복/병행 본문과 주의점
4. `data/israel_campaign_reference_index.json`: 이전 219개 에피소드 ID·참조 미러
5. `data/phase_manifest.json`, `data/phase_book_matrix.csv`: S00~S14 작업 로드맵
6. `data/view_policy_by_genre.json`: 장르별 UI/상호작용 계약
7. `data/source_register.json`: 출처 URL·적용 범위·저작권 리스크
8. `schemas/release_slice.schema.json`, `reference/content-contract.ts`: 단계별 JSON/타입 계약
9. `docs/*`: 콘텐츠 집필·팩트체크·기술/UX·교사 교재·단계별 수용기준
10. `scripts/validate_master.py`: 파일 간 참조, 책/장 범위, 219 ID, 이전 파일 불변, 선택 제약 검사
11. `NEXT_REQUEST.md`: 다음 대화에서 복사할 착수 요청문

## 절대 불변 원칙

1. **사건의 결과/정경 서술은 플레이어 선택으로 변경할 수 없다.** 선택은 관점, 정보 순서, 관찰 및 학습 질문만 바꾼다.
2. **성경 내의 기록 / 외부에서 독립 확인된 기록 / 학술적 재구성 / 가상 연출**은 별도 레이블과 출처를 갖는다.
3. **서사 장르가 아닌 부분을 억지로 시간순 사건으로 꾸미지 않는다.** 지혜·시가·율법·서신·묵시문학의 고유 문학 구조를 보존한다.
4. 병행 본문은 단일 본문으로 덮어쓰지 않는다. 서로 다른 강조·차이·불확실성을 읽을 수 있게 한다.
5. 정확한 위치/왕국 국경/날짜가 확정되지 않았으면 확정된 지도로 묘사하지 않는다.
6. 한글 성경 번역 본문은 사용권을 검증하기 전 앱 패키지에 포함하지 않는다. BM 등 박물관 사진도 대상 이미지별 조건을 확인한다.
7. 오프라인 우선, 사용자 계정·광고·분석 SDK 기본 미포함, 모바일 세로/가로·PC 실시간 반응형.

## 검증 실행

`python scripts/validate_master.py` (이 MASTER 폴더에서 실행). 통합 ZIP에서는 `python master/scripts/validate_master.py` 또는 기존 `scripts/validate_package.py`와 `scripts/validate_israel_campaign.py`도 실행.

**검증의 의미**는 데이터 구조·참조·누락 검사에 한정된다. 성경 본문 해석/역사 주장 자체의 진위는 사람이 출처를 읽고 별도로 승인해야 한다.

## 다음 작업

S01 창세기 50장부터 시작한다. `NEXT_REQUEST.md`와 `docs/04_RELEASE_HANDOFF.md`를 사용하여 *각 단계가 독립 ZIP으로 완결*되도록 진행한다. 같은 이름의 출력 파일은 덮어쓰지 않고 버전 증가한다.
