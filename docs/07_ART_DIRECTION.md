# 07. 시각 자산 / 역사적 재현 가이드

## 1. 스타일

- 분위기: 문명 시리즈의 대형 시대 전환 사건 이미지가 가진 '역사적 장엄함'을 참조하지만 구체 그림/기존 게임 UI·리소스·트레이드 드레스를 복제하지 않음.
- 일러스트: 고대 근동의 장소·재료·복식에 대한 자문이 반영된 회화적 2D 파노라마, 풍경과 생활사 중심.
- 컬러: 사암/황토/남청/짙은 녹청/양피지; 제국/시대별 시각 차이. 역사 고증과 확실성 표시가 우선.
- 규격 후보: 마스터 3840×2160, 실제 빌드 자원은 1920/1280/768 폭 responsive, 16:9 풍경, 4:5 세로 크롭 안전구역 설정.
- 각 에셋은 `assetId`, `subjectEventId`, `composition`, `scriptureRefs`, `historicalRefs`, `fictionalElements`, `rightsStatus`, `author`, `createdWithAI`, `reviewer`, `publishedAt` 보유.

## 2. 사건 화면의 두 종류 이미지

1. **역사 삽화**: 자체 제작 회화적 재구성. 항상 '상상 재현/일러스트'로 표시, 제작과 고증 근거 제공.
2. **유물/사료 사진**: 물리적 유물·박물관 소장 이미지. 사진별 재사용 권한 확인 시에만 앱에 수록; 그렇지 않으면 공식 소장품 링크로 외부 이동.

유물 자체가 고대라고 해서 21세기 촬영 사진을 자유롭게 재배포할 수 있다는 뜻은 아니다.

## 3. 제작 우선순위 (컨셉 아트 브리프; 실제 이미지 미포함)

| asset ID | 장면 | 교육 포인트 | 사실성 제약 |
|---|---|---|---|
| ART-001 | 라기스 공성전의 시야 | 기원전 701년 앗수르/유다 전쟁 배경 | 부조에서 확인된 공성 무기/성벽을 우선 반영; 유물 사진과 구분 |
| ART-002 | 예루살렘 원정과 포로 | 기원전 597년 바벨론의 군사 원정 | 597년 원정과 587/586년 파괴 장면 혼동 금지 |
| ART-003 | 왕국 분열 개념도 | 북이스라엘과 남유다 정치적 분리 | 추정 국경을 확정 실선으로 사용 금지 |
| ART-004 | 출애굽/광야 회화 | 성경 전승의 진행과 공동체 | 고정 절대연대/이동 경로 사실화 금지 |
| ART-005 | 갈릴리·예루살렘 | 복음서 지역 구별 | 시대별 지명/건축·종교 구조 검토 |
| ART-006 | 바울 항해와 도시 | 사도행전 지리적 맥락 | 직접 기록된 방문지와 추정 항로 구분 |
| ART-007 | 계시록 상징 회화 | 문학·상징의 시각화 | 미래 세계지도의 실제 지리 영토처럼 표현 금지 |

## 4. 일러스트 제작 프롬프트 템플릿

```text
Create an ORIGINAL historical educational painting, widescreen 16:9.
Subject: [이벤트]
Period and place: [출처 확인된 정보 / uncertain if debated]
Visible material culture: [verified elements only]
Narrative focus: [learning objective]
Composition: cinematic panoramic illustration, parchment/sandstone palette,
legible architecture, no captions, no modern items, no cloned videogame UI.
Uncertain details MUST remain non-specific and be declared as reconstruction.
This is an imagined educational illustration, not archaeological photography.
```

프롬프트와 이미지 생성 기록만으로 고증 통과 상태를 부여할 수 없다. 최종 전시용 이미지에는 문화·신학·역사 검토 절차가 필요.

## 5. 이미지 권한

- 직접 제작/자체 소유: 저작권·AI 생성물 이용조건/귀속을 프로젝트 `ASSET_LEDGER`에 기록.
- 박물관 오픈 액세스: 작품 **개별 페이지**에서 CC0/Public Domain 태그 확인. Met의 오픈 액세스 정책은 https://www.metmuseum.org/ko/perspectives/open-access-at-the-met
- Wikimedia Commons: 파일 페이지별 라이선스/사진 저작자/조건 확인 후 취급. 검색 썸네일만 보고 무단 포함 금지.
- 문명 게임의 UI 이미지를 트레이싱하거나 게임 내 리소스를 추출해 재사용하지 않음.

## 6. 그래픽 검수 체크

- 복장·건축·문자·유물 형태가 시대를 혼용하지 않는가?
- 가공한 얼굴·말·인물 심리를 성경에 명시된 듯 보이게 하는가?
- 그림이 근거 없는 정확한 도시 구조/제국 영토를 확정하여 보여주는가?
- 혐오·잔혹 장면은 연령 설정에서 충분히 완화되는가?
- 원본/크롭/모바일 세로 버전 모두 핵심 맥락이 보이는가?
