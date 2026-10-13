# 구현 핸드오프 / tickets

## P0 인덱스·런타임
- 공통 SceneRunner가 `locked_canonical_outcome` 밖으로 넘길 때 데이터 기반 next ID만 사용.
- S01A/B/C/D 모듈 단위 lazy-load, 3개의 기존 handoff alias와 다음 장 진입 잠금 처리.
- 미승인 콘텐츠는 `releaseReady:false` + `published:false` 이중 차단.

## P0 본문 검증 워크플로
- 한국어 성경 역본 선택과 사용권 확인; 외부 공개 전 해당 절의 의미·판본·표현에 대한 인간 감수.
- 각 episode의 `claimId`/`sourceId`를 UI에 노출. '학술적으로 검증됨' 표시 불가.
- 동일 이름의 지명·가계 중복 확인, 46장과 49장처럼 본문 내부 차이 노트 처리.

## P1 지도·미술
- 지도 가로·세로 전환, 고센과 도단에 승인 전까지 확정 핀 사용 금지.
- 64개의 원본 일러스트와 접근성 대체텍스트 제작, 4:3·9:16·16:9 크롭 검수.
- 야곱 장례 행렬은 이동 개념 지도. 애굽/가나안 시대별 국경은 자료 승인 전 숨김.

## P1 교육
- 64개 학습 문항은 정답 데이터는 있으나 편집 초안이므로 교사·교단 내부 검수 필요.
- 민감 장면은 연령별 비노골적 설정과 보호자/교사 안내, 활동 기록은 로컬 저장.

## P2 정식 창세기 출시 승인
- 50장/1,533절 구조 PASS 외에도 전 구절 원문·해석 검토, 화면 QA, 실제 이미지 사용권 승인, 외부 역사 주장 재검증이 끝나야 배포 상태 변경 가능.

## 회귀 검사
`python scripts/validate_package.py`
`python master/scripts/validate_master.py`
`python scripts/validate_israel_campaign.py`
`python phases/S01A/scripts/validate_s01a.py`
`python phases/S01B/scripts/validate_s01b.py`
`python phases/S01C/scripts/validate_s01c.py`
`python phases/S01D/scripts/validate_s01d.py`
`python genesis_integrated/validate_genesis.py`

For release gate: `python phases/S01D/scripts/validate_release_gate.py` is **expected to fail**; do not treat its failure as an integration defect.
