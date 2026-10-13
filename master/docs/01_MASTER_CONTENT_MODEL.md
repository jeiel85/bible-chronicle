# 01. 전체 성경 콘텐츠 구조 — 논리 계층

## 모델 관계

`CanonBook(66)` → `Chapter(1189)` → `LiteraryMacroUnit(~일부 단위)` → `Lesson/Scene/Dossier(단계별 작성)`.

동시에 `StoryArc` ↔ `Episode` ↔ `PassageRef`, `ParallelGroup` ↔ `PassageRef`, `HistoryClaim` ↔ `EvidenceSource` ↔ `MapFeature`로 연결한다.

- `Book/Chapter`: 정경 문서의 구조. 1차 ID는 OSIS 계열 약어 GEN 등, `GEN.001`처럼 고정한다. 본문의 출판·표기 권한은 별도로 관리한다.
- `LiteraryMacroUnit`: 장별 집필 계획용 거시 단락. **절별 구획 확정 아님**. 각 장은 최초 버전에서 정확히 하나의 단락을 가진다. 필요시 하위 단락/장에 걸친 구조가 중첩 가능.
- `Episode`: 특정 역사 기록/문학적 장면의 학습 단위. 화면에 재구성으로 보이더라도 역사적 사실 여부를 선제적으로 판정하지 않는다.
- `HistoricalClaim`: 사실 주장, 범위, 연대, 지리, 인물, 관찰자 견해, 출처·한계·반론 포함.
- `EvidenceSource`: 소장 기관, 자료 표제, 날짜, 원문 URL, 출처 유형, 저작권, 확인 일시, 변형 여부.
- `ParallelGroup`: 성경 여러 본문 간 관계를 '유사 사건', '같은 사건으로 검토', '주제 연관', '인용'으로 **구분하여** 보관. 장 단위 초안은 동일 사건의 증명이 아니다.
- `Arc`: 이야기의 큰 맥락. 예언·시가·서신의 위치는 '동반 읽기'와 '시대 배경'으로만 설정하며 강제적 발생시각을 붙이지 않는다.
- `GameChoice`: 원전 결말과 정해진 다음 주요 사건에 영향이 없는 `inspection`, `learning_focus`, `narrative_perspective`, `reflection`만 허용.

## 장르별 구성

- 역사 서사: 연대표/지도/동맹·전쟁/사건 카드를 핵심으로 삼되 외부 근거 여부 표시
- 율법: 규례의 목적/구조/제사/절기 도식과 당시 공동체 맥락
- 시가: 시의 반복, 평행법, 주제, 예배/탄식/찬양을 반응형 카드로 표현
- 지혜: 대화 입장, 논증, 질문 비교, 학습 실천
- 예언: 발화 대상, 역사적 배경의 확실성, 심판과 회복, 상징의 범주
- 복음서: 병행 비교, 4복음서 문맥을 살린 개별 진행, 겹치는 사건의 병치
- 서신: 수신자·문제·논증 구조, 전달 경로가 불확실하면 표시
- 묵시: 환상 상징 지도(개념 그래프), **실제 지정학적 경계처럼 표현하지 않음**

## 커버리지 수준

`index_only` (책/장 존재) → `outline` (거시 단락) → `passage_drafted` (본문/절·의미) → `research_in_progress` → `reviewed` → `license_cleared` → `publishable`.

주의: 전 단계에서 `index_only/outline`를 `publishable`로 자동 승격하지 않는다. 역사적 사실과 신학적 해설은 검증 책임자를 별도 필드로 둔다.

## 주요 데이터 불변성

- 책/장 구조 변경은 canon 버전 변경으로만 한다.
- 이미 배포된 사건 ID 삭제 금지. 교체시 `supersedes`와 `redirects` 유지.
- `canonicalOutcomeId`가 다른 플레이어 선택에 의해 변경되면 엔진 빌드 실패.
- 동일 사건에 대한 서로 다른 본문을 제거하거나 차이를 '오류 없이 완전 일치'로 가정하는 조정 금지.
- 지도 좌표 없는 사건에 추정 좌표를 만들어 넣지 않는다.
