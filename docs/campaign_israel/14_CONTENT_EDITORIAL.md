# 사건 저술·성경/역사 검증 파이프라인

## 콘텐츠 기본 계약 (index → reviewed event)

`campaign_events_index.json`은 에피소드 **목록**이지 상영 가능한 장면 데이터가 아니다. 실제 `schemas/event.schema.json`으로 변환될 때 반드시 다음 사항이 추가되어야 한다.

```json
{
  "id": "isl-0001",
  "requiredWhenAuthored": {
    "pericopeRefs": ["GEN 1:1-2:3"],
    "parallelPassageRefs": [],
    "scriptureTextLicenseId": null,
    "narrationKo": "집필 전",
    "biblicalClaimIds": [],
    "externalClaimIds": [],
    "dateConfidence": "unknown",
    "placeConfidence": "unknown",
    "sceneVariant": ["historian", "witness", "biblical"],
    "artBriefId": null,
    "theologicalInterpretationNoteKo": "검토 전",
    "violenceSensitivity": "needs_review",
    "teacherQuestions": [],
    "reviewers": [],
    "publishable": false
  }
}
```

- **Bible claim**: 성경 본문에서 실제 주장하는 내용과 어휘. 본문의 서술과 독립 역사 확인을 혼동 금지.
- **Historical claim**: 외부 출처의 범위를 넘지 않는 고고학적/역사적 주장. 직접 근거 source URL, 출판기관, 날짜, 한계, 관점 기입.
- **Theological interpretation**: 본문 저자 및 신앙공동체의 해석. 역사가 증명했다는 식의 표시 금지.
- **Dramatization**: 가상 인물/대사/배경/감정. 구별할 수 있는 UI 표시와 상세 접근성 텍스트 필요.

## 검수 워크플로

`outline_not_authored` → `draft` → `scripture_checked` → `historical_scope_checked` → `teacher_reviewed` → `illustration_licensed` → `ready_to_publish`

- `scripture_checked`: 절 범위와 병행본문 의미가 맞는지 수작업으로 검토. 범위만 검증하는 스크립트는 여기 도달 불가.
- `historical_scope_checked`: 각 외부 사실 주장의 진위·연대·반론·제한을 독립적으로 확인. 현재 `historical_anchor_reviews.json`의 9개는 **좁은 출처 범위의 예시**에 불과.
- `teacher_reviewed`: 청중 연령, 이해도, 신학·문학 장르 정확성 확인.
- `illustration_licensed`: 이미지 생성 프롬프트, 출처, 재사용 허가, 인물/복식 복원 근거, 아동보호 수준 확인.
- `ready_to_publish`: 번역 저작권 해결, 한국어 교정, 오프라인 에셋 번들, 기기 스냅샷 QA.

## 서로 다른 본문을 자동으로 합치지 않는 예

1. **므낫세 (왕하 21장 vs 대하 33장):** 열왕기의 심판 서술과 역대기의 겸비/돌이킴 서술은 원출처별 패널 분리. 두 기록 사이 장면을 상상하여 사실로 잇지 말 것.
2. **요시야의 죽음 (왕하 23장 vs 대하 35장):** 축약 서술과 상세 서술의 차이를 병행 본문으로 보존.
3. **열왕기하 25장 vs 예레미야 52장:** 성전 기물·시기·포로 규모·기록상의 세부 숫자 차이는 사용자에게 검토용 주석을 제시, 임의로 하나의 숫자로 정리하지 않음.
4. **사마리아 멸망 vs 북쪽 지파의 소멸:** 왕국 정치체제의 종말과 종족/주민의 전면 소멸을 동의어로 쓰지 않음.
5. **요엘·오바댜의 연대:** 편의상 '바벨론 이후' 등 하나의 고정 시기에 넣지 않음. `PXX` '연대 미확정 문헌'에서 학습.
6. **시대별 지도:** 고대 민족·왕국 경계는 사료/연구별 다를 수 있음. 추정 지도를 사실적인 현대 국경처럼 사용 금지.
7. **애가·시편·잠언:** 노래/시/지혜 문학을 실재 전투 이벤트로 만드는 것을 금지. 고정 사건과 연결되는 별도 문학 카드.

## 이미지 연출 분류

- `artifact_photo`: 허가 검토 후 직접 유물 사진, 박물관 제공 출처/허가 링크.
- `historical_reconstruction`: 유물과 자료로 부분 복원, 추정 부분 명시.
- `biblical_story_illustration`: 성경 기록 기반 창작 일러스트, 복식과 얼굴은 비검증.
- `symbolic_visual`: 신학적 상징 또는 시적 표현, 실제 사건 사진처럼 오해시키지 않음.
- `fictional_observer_scene`: 창작 목격자. 사실-허구 토글과 자막 제공.

## 1,189장 전체 범위와 이 캠페인의 관계

기존 `data/chapter_index.json`은 **66권 모든 장**의 재료 위치를 나타낸다. 이번 `chapter_campaign_coverage.json`은 34권/686개 장에 대한 **이스라엘 시작–멸망·포로·회복 에필로그** 범위의 거친 연결이다. 나머지 정경 장은 본 캠페인 바깥의 별도 스토리/문학 학습에 편성한다. `coverageKind=chapter_linked_to_outline`은 정확한 절 분할/수업 원고 완료로 해석하면 안 된다.

## 참고문헌 범위

외부 자료 URL과 한계는 `data/campaign_israel/reviewed_sources.json`, 매칭은 `historical_anchor_reviews.json`에 기록되어 있다. **한 문헌에 실린 일부 역사 사건을 나머지 성경 본문의 모든 신학적/세부 기록이 실증되었다는 뜻으로 사용하지 않는다.**
