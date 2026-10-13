# 창세기 통합 캠페인 v1.6

**1–50장 전체 = 179개 에피소드·1,533절 구조 매핑 (S01A–S01D).** 전체 서사·장절 색인·개발 데이터를 연결하였지만 모든 절에 대한 학술/신학 해설이 인간 감수된 것은 아니다.

- 이전 단계 파일은 변경하지 않았다. 에피소드의 마지막 `canonicalNextId`에 존재하는 handoff 별칭을 `handoff_resolution.json`으로 일괄 해석한다.
- `genesis_chapter_manifest.json`: 장별 절 수 / 담당 구간 / 에피소드 목록.
- `genesis_episode_chain.json`: 모든 179개 에피소드의 단방향 고정 흐름.
- `genesis_qa_manifest.json`: 내용 범위 및 감수 승인 상태.
- `validate_genesis.py`: 전 구간 장절 누락·중복·연쇄·기본 보존 여부 검증.

**창세기의 결말**은 출애굽기 사건을 플레이로 실행하지 않는다. `handoff-exo-001`이 후속 S02 설계를 기다리는 잠긴 전환점이다.

다음 독립 단계: **S02 출애굽기~신명기**. 1.6의 파일을 기준으로 기존 ID를 유지한다.
