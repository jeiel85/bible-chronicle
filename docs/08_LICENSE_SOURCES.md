# 08. 확인된 근거 URL 및 저작권 검토

> 확인일: 2026-10-12. 아래는 설계를 뒷받침하는 특정 공개 출처의 URL이다. '모든 성경사 사건 검증 완료'를 의미하지 않는다. 원문 복제/허가 범위는 실제 사용 방식에 따라 재확인.

## 1. 성경 번역 판본

| 항목 | 1차 확인 근거 | 설계 결론 |
|---|---|---|
| 대한성서공회의 저작권 보유 한국어 번역 | https://bskorea.or.kr/bbs/board.php?bo_table=copyright_faq&device=mobile&wr_id=1 | 해당 본문의 앱·컴퓨터 데이터 사용에 허가 필요 |
| 역본별 보호기간 / 개역한글판 | https://www.bskorea.or.kr/bbs/content.php?co_id=subpage2_3_4_1 | 공회 안내상 개역한글판(1961)의 저작재산권 보호기간은 2011년 말 종료; 정확한 판본 구분 및 기타 권리 검토 필요 |
| 역본 정보 및 저작권 표시 | https://bible.bskorea.or.kr/copyright_notice | 개역개정(1998), 새번역(2001) 등 사용권 검토 필요 |
| 66권 WEB 2020 stable | https://ebible.org/engwebp/copyright.htm | WEB(해당 66권판)은 퍼블릭 도메인; 제목 상표·수정본 표기 유의 |

**기본 구현 정책**: JSON 장 색인·자체 저술 요약 우선. 한국어 성경 전체 본문 포함 여부는 **법적 검토 완료 후 별도 패키지**로 결정. 개역한글판을 채택해도 판본 차이/저작인격권 등 확인하고 복제 원천/정확성을 검토한다. 외부 성경 플랫폼의 HTML을 무단 스크래핑하지 않는다.

## 2. 지도, 역사 지명

| 항목 | 근거 | 라이선스/한계 |
|---|---|---|
| Natural Earth | https://www.naturalearthdata.com/about/terms-of-use/ | 지형 데이터 public domain, **고대 정치 국경 아님** |
| Pleiades | https://pleiades.stoa.org/participate | CC BY 3.0 귀속; 지명별 출처·좌표의 신뢰성 조사 |
| Pleiades 다운로드 | https://pleiades.stoa.org/downloads | 데이터 버전/출처/라이선스 메타데이터 보존 |
| MapLibre GL JS | https://maplibre.org/maplibre-gl-js/docs/ , https://github.com/maplibre/maplibre-gl-js | 인터랙티브 지도 라이브러리, BSD-3-Clause; 타일 데이터/스타일은 별도 권리 확인 |

## 3. 외부 사료/학술 자료

| 주제 | 확인 URL | 이 자료가 직접 뒷받침하는 범위 |
|---|---|---|
| 라기스 공성 701 BC | https://www.britishmuseum.org/collection/galleries/assyria-lion-hunts | 영국박물관 전시 설명의 공성 연대와 역사 맥락 |
| 라기스 부조 | https://www.britishmuseum.org/collection/object/W_1856-0909-14_2 | 산헤립의 라기스 공격 부조의 형상/소장 기록 |
| 바벨론 연대기 BM 21946 | https://www.britishmuseum.org/collection/object/W_1896-0409-51 | 597 BC 느부갓네살 예루살렘 원정 기록 |
| 텔 단 비문 | https://thejewishmuseum.org/exhibitions/tel-dan-stele/ | 후대 '다윗의 집' 표현에 대한 유물 소개 |
| 출애굽 학술 논의 관점 1 | https://doi.org/10.1093/acprof:oso/9780195130881.001.0001 | 이집트 연구와 전승의 역사성에 우호적 연구 |
| 출애굽 학술 논의 관점 2 | https://doi.org/10.5325/j.ctv1bxgxxt | 외부 직접기록 부족/전승 기억 가설 등을 소개한 학술 편집서 |
| 출애굽 학술 논의 관점 3 | https://doi.org/10.2307/j.ctv13pk6xg | 역사적/문헌적 연구의 또 다른 접근 |

박물관 목록과 학술 출판의 초록/소개까지 확인한 자료가 포함되어 있으며 **모든 논문/단행본의 전문을 대조해 검증했다는 뜻은 아니다**. 실제 이벤트별로 원전 직접 판독 또는 학술자료의 해당 페이지 검토가 필요.

## 4. 외부 역사 사진 정책

- 영국박물관 유물 사진은 해당 이미지의 재배포 라이선스를 확인할 때까지 앱에 번들하지 않음.
- The Met Open Access는 CC0를 명시한 **개별 작품** 이미지만 퍼블릭 도메인 정책 적용: https://www.metmuseum.org/ko/perspectives/open-access-at-the-met
- Google/Wikimedia 검색 결과는 인용 소스가 아니라 발견 방법; 사진별 저작권 처리 필수.

## 5. 추후 반드시 조사할 1차/2차 사료군

- 앗수르 왕실 비문 및 부조 기록(사본 간 비교)
- 바벨론 연대기/행정문서 및 6세기 BCE 유다 관련 문서
- 페르시아 제국 비문, 고레스 원통(성경의 귀환 서술과 과도한 일치 주장 금지)
- 헬레니즘/로마 시대 역사가(요세푸스, 타키투스 등) 및 시대/집필 목적 편향 검토
- 신약시대 도시·도로 고고학 및 바울 여행 지명 논문
- 관련 본문 본문비평/주석서 다수 (학파별 차이 명시)

이 목록은 추가 검증 계획이다. 미확인 항목을 이미 검증된 것처럼 취급하면 안 된다.
