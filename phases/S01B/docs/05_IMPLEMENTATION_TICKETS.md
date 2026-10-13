# 구현 작업 분해 (실제 착수 순서)

|Ticket|작업|수락 테스트|
|---|---|---|
|S01B-01|`episode_index`, `verse_coverage` 로더와 Zod/JSON Schema 계약|41건·394절, 중복 절 0|
|S01B-02|S01A `handoff-gen-012` 라우팅 어댑터|기존 ID 유지, GEN 12:1 진입|
|S01B-03|고정 결과 내러티브 러너|모든 선택을 수행해도 동일 canonId·nextId|
|S01B-04|역사 검증 패널|본문·독립 사료·학술 이견·제작 연출 4층 레이블|
|S01B-05|지도 추상 레이어|좌표 미확정 장소 핀 미생성, 정치적 경계선 미표시|
|S01B-06|아트 자산 파이프라인|한 에피소드 3종 비율, alt, 권리 필드 없으면 차단|
|S01B-07|Responsive + orientation regression|세로·가로·PC 상태 보존·키보드 접근|
|S01B-08|안전성 편집 토글|창 19/22, 하갈 가족사 대체 교육 카드 노출|
|S01B-09|교육문항·교사용 차시|41문항 모두 근거절과 응답 연결, 오답 설명|
|S01B-10|Release Gate CLI|감수/권리 미승인 시 프로덕션 게시 거부|
|S01B-11|콘텐츠 원고 편집 CMS (로컬)|데이터 출처와 감수 로그 + diff 저장|
|S01B-12|S01C 연결 준비|GEN 25:34 완료 시 창 26:1 잠금/예고 처리|

## 코드 구현 선호
TypeScript + React 또는 Vue + Vite + MapLibre GL JS (구체 라이선스·배포 확인) + IndexedDB 저장 + PWA 오프라인 팩. 레거시 ZIP에는 프론트 실제 구현 코드가 없으므로 위는 권장 설계이며 완료 구현이라고 주장하지 않음.

## CI
```bash
python phases/S01B/scripts/validate_s01b.py
python phases/S01A/scripts/validate_s01a.py
python master/scripts/validate_master.py
python scripts/validate_israel_campaign.py
python scripts/validate_package.py
```
