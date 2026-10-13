# Genesis Verse Annotations v1.9 – 통합 주석 초안

## 정확한 완료 범위

- 창세기 1~50장 **1,533절 각각 별도 한국어 주석 초안**을 직접 작성했습니다. 자동으로 공통 문구를 복제한 카드가 아닙니다.
- 기존 v1.7의 **74개 선별 심화 주석을 손대지 않고 보존**했으며, 새 데이터에서도 해당 항목을 링크합니다.
- 기존 179개 에피소드와 50개 장별 교사용 해설에 `episodeId`/`chapterGuideId`로 연결했습니다.
- `chapters/GEN_01.md`부터 `GEN_50.md`까지 장별 텍스트를 제공하며 CSV·JSON·오프라인 검색용 뷰어가 있습니다.
- 이전 패키지 237개 파일의 SHA-256 해시를 기록해 **원본 바이트 동일성**을 검사합니다.

## 완료가 아닌 것

- 모든 절에 대해 히브리어 자음 본문·모음 전통·70인역·사해 사본을 상호 대조한 정밀 주해가 아닙니다.
- 단독 WEB 본문 출처는 역사·고고학 주장에 대한 독립적인 증거가 아닙니다.
- 외부 전문가의 신학적 감수는 사용자 요청에 따라 필수 릴리스 차단 조건에서 제외하되, 검토 의견은 계속 수용합니다.
- 한국어 개역개정판 본문과 미승인 일러스트는 포함하지 않았습니다. 저작권/배포 사용권 확인은 계속 필요합니다.

## 읽는 순서

1. `demo/Genesis_Verse_Viewer.html` (모바일/PC에서 인터넷 없이 실행)
2. `chapters/GEN_01.md` ~ `chapters/GEN_50.md` (장별 해설 원고)
3. `data/verse_commentary_1533.json` (개발용 원본, 절별 상태 포함)
4. `data/critical_review_queue.json` (해석·원문 대조 우선 검토)
5. `docs/ITERATIVE_EDITORIAL_WORKFLOW.md` (사용하면서 수정)
6. `scripts/validate_v19.py` (구조·보존 검증)

**중요:** `editorialStage=first_pass_draft_complete`는 집필 완료 표시이며 정확성 보증이나 공개 승인이 아닙니다.
