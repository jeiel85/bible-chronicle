# 앱 연결 계약: 연구 기반 편집 자료를 UX에 반영하는 방법

## 데이터 로딩

`verse_review_matrix_1533` → `episode_commentary_179` / `chapter_commentary_50` / 선택 `selected_verse_notes` 연결.

```ts
type ReviewStatus = 'focused_editorial_draft' | 'not_yet_written_independently';
type VerseRecord = {
  ref: string; // e.g. GEN.41.14
  chapter: number;
  verse: number;
  episodeId: string;
  chapterGuideId: string;
  verseSpecificNoteId: string | null;
  noteStatus: ReviewStatus;
  sourceTextEmbedded: false;
}

function getVerseNote(record: VerseRecord, focus: Map<string, string>) {
  return record.verseSpecificNoteId ? focus.get(record.verseSpecificNoteId) : null;
}
```

## 디스플레이

- '본문' 탭: 적법하게 허락받은 성경 역본을 사용자가 선택; 사용권 미확보 상태에서는 장절과 원문 제공기관 외부 링크만 표시.
- '관찰' 탭: 서사 비트와 해당 장의 독립 편집 주석. 문헌 형성에 학술적 이견이 있을 때 다중 관점으로 나란히 표시.
- '자료' 탭: 독립 외부 증거가 없는 경우에는 '성경 서술 / 외부 사료 미확인' 배지. 이건 사건이 거짓임을 판정하는 배지가 아니다.
- '가르침' 탭: 신학적 적용과 본문에 명시된 내용을 구분. 모든 주석에 초안 상태 표시.
- '연대 지도' 탭: 요셉의 파라오 실명과 왕조를 할당하는 UI를 설계 단계에서 차단.
- '교사 전용' 탭: 민감 장면 토글, 반대 견해, 근거 수준, 감수 대기 목록 표시.

## 출판 게이트

1. 절별 `noteStatus` 모두 전문가 승인 상태가 아니면 전체 해설 완료 표시 금지.
2. 사료 승인 없는 장소 좌표는 `symbolic_region`/`regional_only`로만 표시.
3. 권리 승인 없는 한국어 성경 본문·유물 사진은 앱 파일에 동봉 금지.
4. 기존 `canonicalOutcomeLocked=true` 규칙 우회 불가.
