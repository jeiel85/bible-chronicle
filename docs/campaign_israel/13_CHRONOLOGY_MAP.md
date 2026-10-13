# 역사 연대·지도·왕조/선지자 병렬 시스템 설계

## 시간 모델

```ts
type Chronology =
 | {kind:'anchor';bceStart:number;bceEnd?:number;sourceIds:string[];confidence:'strong'|'moderate'}
 | {kind:'date_range';earliestBce:number;latestBce:number;sourceIds:string[];debateNoteKo:string}
 | {kind:'relative_only';beforeIds:string[];afterIds:string[];biblicalOrderSource:string}
 | {kind:'undated';reasonKo:string;displayInChronologicalTimeline:false};

type TimelineLane = 'united'|'north'|'south'|'egypt'|'aram'|'assyria'|'babylon'|'prophetic'|'undated';
interface Reign { rulerId:string;kingdom:'united'|'north'|'south';period:Chronology;coregency?:boolean;}
interface Boundary {
 factionId:string;validFromEventId?:string;validToEventId?:string;
 shapeAssetId:string;sourceIds:string[];
 representation:'schematic'|'estimated_extent'|'archaeological_hypothesis';
 certainty:'low'|'moderate'|'high';
}
```

- BCE 숫자는 단순 음수 연도에서 달력 계산이 혼동되므로 **자기 도메인 값(bce)** 으로 저장. 별도의 정규화 함수만 기원전→astronomical(1 BCE=0)을 처리.
- 불확실한 것은 즉시 단일 숫자로 내보내지 말고 `relative_only`/`undated` 유지.
- 왕실 동시 재위·북남 왕의 겹친 통치 시점을 UI에 허용한다. 출처 없는 임의 선후를 금지.
- `displayOrder`는 **이야기 탐험 순서**이지 검증된 고대 날짜 순서가 아니다. 선지서 병렬카드는 이야기 흐름과 별도의 기간/관련 사건으로 접속한다.

## 반드시 준비할 제국/지리 레이어

| 레이어 | 주요 지점 | 표현 및 제약 |
|---|---|---|
| 족장 시대 | 하란, 가나안, 헤브론, 브엘세바, 애굽 | 이동은 본문 중심으로, 고정 국경 금지 |
| 출애굽·광야 | 애굽, 시내 광야, 모압 평지 | 시내산·홍해 건널 위치와 출애굽 경로는 미확정으로 표시 |
| 지파 정착 | 길갈, 여리고, 세겜, 요단, 실로 | 지파 경계는 성경의 서술/학계 해석을 구별 |
| 통일왕국 | 헤브론, 예루살렘, 블레셋 도시들 | 국가 영향권과 직접 점령/지배를 혼합 금지 |
| 분열왕국 | 예루살렘·사마리아·단·벧엘 | P10 첫 컷에서 북/남 색상 분리 |
| 아람·모압 | 다메섹, 길르앗, 모압 | 출처에 근거한 전투/동맹만 연결 |
| 앗수르 | 니므롯/갈라, 니느웨, 라기스, 사마리아 | 9–8세기 앗수르 대외 팽창 단계별 |
| 바벨론 | 예루살렘, 바벨론, 미스바, 애굽 | 597와 최종 함락·포로 이동을 서로 다른 컷으로 |

**기본 지도 좌표 정책:** 장소 식별은 Pleiades/WHG 등 검증 가능한 가제티어에 대한 매핑 프로젝트를 따로 생성한다. 현재 ZIP의 `places.sample.geojson`은 검증 전이므로 프로덕션에 렌더링 금지. 레이어의 좌표·폴리곤·국경은 이번 보강에도 **실데이터를 만들어 넣지 않았다**.

## 시대별 랜더링 계약

```ts
interface MapEpochFrame {
 epochId:string;
 baseMapStyle:'terrain'|'parchment'|'modern_reference';
 places: {placeId:string;accuracy:'verified'|'approximate'|'unknown';labelKo:string}[];
 factions: Boundary[];
 movements: {fromPlaceId:string;toPlaceId:string;sourceIds:string[];routeConfidence:'explicit'|'reconstructed'|'undetermined'}[];
 artifacts: {artifactId:string;sourceIds:string[];imageLicenseVerified:boolean}[];
 legend: {layerType:string;sourceConfidence:string;methodNoteKo:string}[];
}
```

- 매 시대 시작에 지도 카메라가 해당 도시로 이동, 세력권이 추정이면 옅은 점선. 실제 역사적 유물의 캡션·원어 자료 링크를 제공.
- 북이스라엘의 마지막 시대에는 앗수르의 강제 이주 정책을 표시하지만 이주 인원이 전원인지 단정하지 않는다.
- `P16/P17/P18` 교육 모드에서는 현재 왕, 북·남 상태, 강대국, 예언서 제목을 상단에 항상 표시.

## 적용할 사실 확인 앵커

| 사건 | 날짜 UI | 출처 | 주의할 부분 |
|---|---|---|---|
| 사마리아 함락 | 기원전 722/721년경 | Metropolitan Museum 역사 연표 | 완전히 동시적인 민족 소멸이 아님 |
| 예후 조공 | 기원전 841년 | British Museum 검은 오벨리스크 | 외부 명문이 예후 사역의 종교적 평가를 입증하지 않음 |
| 라기스 공성전 | 기원전 701년 | British Museum 부조·상설 전시 | 예루살렘 함락과 혼동 금지 |
| 바벨론의 예루살렘 원정 | 기원전 597년 | British Museum BM 21946 | 성전 소실(587/586경)과 분리 |
| 예루살렘 파괴 | 기원전 587/586년경 | Jerusalem archaeology 2023 연구 등 | 정확 연도 이견 표시 |
| 통일왕국의 정확한 영토 | **미확정** | Keimer (2021) 통일왕국 논쟁 | 제국 크기를 확정 경계로 그리지 않음 |
| 실로암 수로의 착공 시기 | **쟁점 존재** | UMich 명문 + Reich & Shukron 논문 | 히스기야로의 단독 확정 귀속 피함 |

## 자료 시각화 vs 문명 게임

- 군사력 수치, 국가별 자원 생산율 같은 수치는 역사 자료 없으면 **생성 금지**. 추정 숫자를 가상의 게이지로 만들고 싶다면 `illustrative_only`, 숫자 단위 없음, 학습 설명 필수.
- 게임의 심리적 몰입은 **증거를 찾아 해석을 완성**하는 방식으로 만들 것. 예: 라기스 부조 디테일 확대, 두 연대기 병렬 보기.
- 앗수르·바벨론 공성 장면의 잔혹한 묘사는 미성년자/교회용 UI에서 기본값으로 비노출.
