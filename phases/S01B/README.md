# Bible Chronicle S01-B — 창세기 12~25장 상세 제작 데이터

- 기존 v1.3을 유지하면서 **41개 에피소드** (`ep-gen-023` ~ `ep-gen-063`) 설계
- **14장·394절을 정확히 한 번씩** 에피소드에 배정하며, 6개 화면/에피소드·4개 교육 선택지/에피소드 설계
- 기본 서사 결과 고정; 실제 고고학적 확인과 성경 기록은 서로 다른 검증 축으로 취급
- **이 단계의 결과는 개발용 콘텐츠 초안**이며, 본문 라이선스·역사·신학·교육 감수와 시각 에셋 제작 전에는 공개 불가
- 원문 및 제3자 이미지 파일 포함하지 않음

## 실행 순서
1. `docs/01_SCOPE_AND_PILLARS.md`
2. `docs/02_EPISODE_BIBLE.md`
3. `docs/03_ATLAS_AND_SOURCES.md`
4. `docs/04_INTERACTIONS_RESPONSIVE.md`
5. `docs/05_IMPLEMENTATION_TICKETS.md`
6. `docs/06_TEACHER_SAFETY_GUIDE.md`
7. `docs/07_PLAYTHROUGH_SAMPLES.md`
8. `data/*.json`, `reference/*.ts`, `scripts/validate_s01b.py`

### 검증
```bash
python phases/S01B/scripts/validate_s01b.py
python phases/S01A/scripts/validate_s01a.py
python master/scripts/validate_master.py
python scripts/validate_israel_campaign.py
python scripts/validate_package.py
```
검사는 JSON 연결·절 범위·불변성·레거시 보존만 확인하며 역사적 사실의 최종 입증이 아니다.
