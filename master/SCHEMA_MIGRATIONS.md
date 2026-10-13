# Schema migration policy

- v1.1의 `GEN` 등 권별 id, `GEN.001` 등 장별 id, `isl-0001` 등 캠페인 이벤트 ID는 **변경 없음**.
- v1.2는 `LU-...`(문학적 단락), `ARC...`(맥락), `PG...`(병행 관측), `S00...S14`(단계)를 추가한다.
- 수동 검증된 구간은 원고 `reviewStatus`를 승격하는 별도 PR 필요; 자동 생성은 `outline_needs_exegetical_review`에서만 시작.
- 정경 사건의 `canonicalOutcomeId` 변경은 메이저 설계 변경이며, `release_notes`, ID 리다이렉트, 회귀 테스트 필수.
- 동일 사건으로 추정되는 양 본문의 자동 병합은 금지. 관련 관계를 `parallel_groups`에 추가/변경한다.
