# Bible Chronicle — 최신 통합 패키지 v1.4.0

## 단일 배포본
기존 v1.3 전체 내용 + S01B 창세기 12–25장 상세 초안을 포함한다.
- `master/`: 66권·1,189장 마스터
- `phases/S01A/`: 창 1–11장 / 22 에피소드 / 299절 (원본 보존)
- `phases/S01B/`: 창 12–25장 / 41 에피소드 / 394절 (신규)
- `data/campaign_israel/`: 북이스라엘·남유다 포함 219 에피소드 개요 (원본 보존)
- `master/NEXT_REQUEST.md`: 다음 대화 S01C 창 26–36장 지침

## 구현 주의
S01B 출시 상태는 **설계 초안**이며 역사·성경·신학·권리·교육 감수가 완료된 산출물이 아니다. 콘텐츠 데이터 검증을 통과해도 사용자에게 공개하면 안 된다. `phases/S01B/scripts/validate_release_gate.py`는 의도적으로 실패하며 이를 통과하기 위한 사람 승인 절차를 구현해야 한다.

## 통합 테스트
```shell
python phases/S01B/scripts/validate_s01b.py
python phases/S01A/scripts/validate_s01a.py
python master/scripts/validate_master.py
python scripts/validate_israel_campaign.py
python scripts/validate_package.py
```

## ID 안정성
기존 S01A의 마지막 라우팅 키 `handoff-gen-012`는 외부 어댑터에서 `ep-gen-023`으로 매핑한다. 창 25:34 이후는 `handoff-gen-026`으로 잠그고 향후 S01C 추가 시 연결한다. 기존 사건 ID를 변경하거나 기존 패키지를 직접 패치하지 않는다.
