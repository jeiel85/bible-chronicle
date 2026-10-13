# 04. 다중 대화/다중 ZIP 연속 작업 계약

## 반드시 유지할 아티팩트

- Master v1.2.0: `canon_books`, `chapter_master_index`, `literary_units`, `story_arcs`, `parallel_groups`, `phase_manifest`.
- 이스라엘 캠페인 v1.1: `isl-0001`~`isl-0219`, 북/남왕국·선지자·교사용 13차시.
- 각 개별 단계의 결과물: `Phase_SNN_..._vX.Y.zip`, 미완료 항목, QA 보고, 출처 레지스트리.

## 단계별 ZIP 구성 의무

```
phase-S01-genesis/
  README.md
  data/episodes.json                 # 실제 원고가 있는 경우에만 완성 표시
  data/chapters.json                 # 해당 장 모두 상태 표기
  data/literary_units.json           # 하위 절 단위 연결 포함
  data/passage_links.json            # 타 권 병행/주제 인용, 범위 수동 검수
  data/claims.json                   # 주장 범위별 실증·이견·출처
  data/geography.json                # 좌표 없는 사건은 null 또는 미해당
  data/assets_manifest.json         # 필요한 삽화 명세·저작권·상태
  data/lessons.json                  # 교사 활용 가이드·퀴즈
  docs/SCREEN_SPEC.md
  docs/EDITORIAL_REVIEW.md
  docs/QA_REPORT.md
  scripts/validate_phase.py
  RELEASE_MANIFEST.json
```

## 각 단계 완료의 문턱

1. 대상 권의 모든 장이 색인에 존재하고 최소 한 개의 집필용 단락/학습 목표에 연결될 것.
2. 모든 주요 주장에 정확한 본문 참조. 외부 사료는 출처 URL과 적용 범위 확인.
3. 예시 게임 진행에서 어떤 선택을 하더라도 `canonicalOutcomeId`가 바뀌지 않을 것.
4. 3 시점 선택 가능한 곳에만 제공. 가상의 관찰자/경험담은 연출로 명시.
5. 포트레이트/랜드스케이프/데스크톱 화면과 키보드·터치 접근성 검수.
6. 한글 성경 텍스트/이미지 저작권 허가 증빙 또는 비수록.
7. 미검증·미집필·미완료 상태는 결과보고에 숫자로 기재.
8. ZIP 무결성 테스트, JSON Schema 검사, 단계별 인수 기준 확인.

## 마스터 갱신 규칙

- 원본 38개 파일의 체크섬을 `v1_1_preservation_sha256.json`에 보존했다. 기존 ID가 변경되어야 한다면 반드시 migration/alias 추가.
- 마스터 변경은 `MASTER_CHANGELOG.md` + `SCHEMA_MIGRATIONS.md`에 기록하고 새 버전 ZIP 생성.
- 대화가 분리되면 최신 마스터 ZIP과 직전 단계 ZIP을 첨부하여 이어서 진행.
- 최종 프로젝트 코드 저장소에서는 `/design/master`, `/design/phases`, `/content` 등으로 관리하는 것을 권장.

## 권장 버전 표기

- `Bible_Chronicle_Master_v1_2.zip`: 마스터 단독
- `Bible_Chronicle_Integrated_v1_2.zip`: 기존 v1.1 + 최신 마스터
- 단계별 예: `Bible_Chronicle_Phase_S01_Genesis_v1_0.zip`

**다음 대화 프롬프트**: `../NEXT_REQUEST.md` 참조.
