# Bible Chronicle / 성경 역사 문명

> 성경 정경의 사건 결과는 바꾸지 않고, 역사·지리·인물·문화의 맥락을 학습하는 반응형 역사 탐험 교보재.
>
> 설계 패키지 v1.1 | 2026-10-12 | 언어: 한국어 | 기준: 개신교 66권

## 산출물의 범위 (중요)

**바로 개발 착수할 수 있도록** 제품 명세, 콘텐츠 계약, JSON Schema, 66권/1,189장 색인, 사건 예시, 사료 추적 장부, 구현 체크리스트, 검사 스크립트, 참조 상태 전이 코드를 제공합니다.

**완성했다고 주장하지 않는 것**: 성경 1,189장의 개별 본문·해설 집필, 모든 성경 사건의 고고학적 검증, 완성된 고대 왕국 국경 폴리곤, 전 시대의 고정 연대표, 게임 클라이언트, 역사 삽화. 이들은 별도 취재·저술·검수·제작이 필요합니다. `data/chapter_index.json`의 `content_status: "not_authored"`는 그 사실을 기계적으로 표시합니다. 잘못된 '완성' 표기를 방지하기 위한 의도적인 설계입니다.

## v1.1 신규 핵심 캠페인 — 이스라엘의 시작과 멸망

- 아브라함과 야곱의 족장 시대, 출애굽과 사사, 사울·다윗·솔로몬, 분열왕국과 북이스라엘/남유다 멸망, 포로·회복 에필로그를 하나의 연속 학습 캠페인으로 설계.
- `docs/campaign_israel/11_CAMPAIGN_PRODUCT.md`: 캠페인 명세·화면·정경 불변 계약
- `docs/campaign_israel/12_SERMON_LESSONS.md`: 교사·설교 연계 **13차시** 학습 과정
- `docs/campaign_israel/13_CHRONOLOGY_MAP.md`: 두 왕국 병렬 연표·외세·지도 신뢰도
- `docs/campaign_israel/14_CONTENT_EDITORIAL.md`: 본문/사료/신학/연출 구분과 집필 승인
- `docs/campaign_israel/15_IMPLEMENTATION_TICKETS.md`: 직접 개발 가능한 에픽·인수 기준
- `data/campaign_israel/campaign_events_index.json/.csv`: **219개 집필용 사건 개요**, 최종 원고 아님
- `data/campaign_israel/rulers.json`: 통일3·북19·남20 통치자, 시기 미확정 처리
- `data/campaign_israel/prophets_cross_index.json`: **26명 예언자/문헌** 연결
- `data/campaign_israel/chapter_campaign_coverage.json`: 34권/686장 범위와 사건 개요 매핑(절별 검수 아님)
- `data/campaign_israel/historical_anchor_reviews.json`: 박물관·학술 기관 등 **9개 사건 한정 외부 근거**
- `scripts/validate_israel_campaign.py`: 신규 사건 색인·참조·제약 검증

**참고:** 출판 가능한 성경 원문 및 역사 서술을 실제로 작성/검증했다는 뜻은 아닙니다. 이번 추가 파일 역시 전반적으로 `outline_not_authored` 상태입니다. 문서 우선순위는 `CHANGELOG.md` 참조.

## 설계 파일

| 파일 | 설명 |
|---|---|
| docs/01_PRODUCT.md | 제품 요구사항, 모드, 선택 규칙, 교보재 게임 루프 |
| docs/02_CONTENT_SYSTEM.md | 정경 66권, 전체 1,189장 커버리지, 병행본문, 비서사 장르 |
| docs/03_TECH_ARCHITECTURE.md | 기술 스택, 로컬 저장, 콘텐츠 파이프라인, API/상태 모델 |
| docs/04_UI_UX.md | 모바일 세로/가로·PC 와이어프레임 및 접근성 |
| docs/05_HISTORY_MAP_FACTCHECK.md | 역사·고고학 근거, 지도 확실성, 검증 게이트 |
| docs/06_IMPLEMENTATION_BACKLOG.md | 에픽/스토리/수용 기준/완료 정의 |
| docs/07_ART_DIRECTION.md | 문명형 사건 일러스트, 에셋 제작 명세와 출처 구분 |
| docs/08_LICENSE_SOURCES.md | 확인한 근거 URL, 저작권, 상용 배포 점검 |
| docs/09_TEST_STRATEGY.md | 테스트 시나리오 및 공개 전 안전장치 |
| data/books.json | 66권 원장, 장수, 핵심 본문 범위, 문학 장르 |
| data/chapter_index.json | **1,189개 장 색인** (미집필로 명시) |
| data/historical_claims.json | 실제 확인한 출처의 범위 한정 예시 |
| data/events.sample.json | 시각·사료·선택/결말 고정을 포함한 샘플 이벤트 |
| data/places.sample.geojson | **좌표 검증 전** GeoJSON 샘플 (프로덕션 사용 금지) |
| schemas/event.schema.json | 사건 데이터 계약(JSON Schema) |
| scripts/validate_package.py | 정경 수/장 합산/참조/선택 제약/출처의 기계 검사 |
| reference/storyEngine.ts | 결정론적 진행·사건 결과 불변 참조 구현 |

## 실행 (설계 데이터 정합성 확인)

```bash
python scripts/validate_package.py
python scripts/validate_israel_campaign.py
```

검증 결과는 '**색인 무결성 및 샘플 구조 검증**'에 한정되며, 역사적 진위 확인을 자동화했다는 뜻이 아닙니다.

## 첫 개발 권장 진입점

1. `docs/01_PRODUCT.md` → 무엇을 만들지 결정
2. `docs/02_CONTENT_SYSTEM.md` → 66권 전범위를 어떤 형식으로 담을지 고정
3. `schemas/event.schema.json` + `reference/storyEngine.ts` → 엔진 구현
4. `docs/05_HISTORY_MAP_FACTCHECK.md` → 사료의 엄밀성 확보
5. `docs/06_IMPLEMENTATION_BACKLOG.md` → 이슈로 분해해 개발

## 설계 상 핵심 약속

- 정경의 사건 결과/순서를 플레이어 선택으로 조작하지 않는다.
- 외부 사료가 없다는 이유로 성경 기록을 '거짓'으로 단정하지 않고, 성경에 기록되었다는 이유만으로 고고학적으로 '검증됨'으로 단정하지도 않는다.
- 시대/영역별 지도가 불확실하면 점선·범위·불명 표시를 쓰고 임의 폴리곤을 만들지 않는다.
- 한국어 성경 번역 본문은 해당 번역판의 사용권 검토 전 포함하지 않는다.
- 초기 제품은 계정·분석 SDK·광고 없이 로컬 기록으로 작동한다.
