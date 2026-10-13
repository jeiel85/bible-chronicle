# 이미지 통합 계약

### 상태 정의

- `prototype_only`: 콘셉트 보드 일부를 분리한 시안. 게임 본문에 사용한다면 명확한 임시 시안 표시.
- `historicalAccuracyStatus: not_verified`: 고증이 확인되지 않음.
- `rightsStatus: usage_terms_check_required`: 최종 배포 조건 검토 필요.
- `isOriginalHighResArtwork: false`: 개별 고해상도 원화가 아님.

### 런타임 예시

```ts
import manifest from './genesis_illustration_pack_v1_10/data/genesis_art_manifest.json';
const byEvent = new Map(manifest.map(asset => [asset.subjectEventId, asset]));
const asset = byEvent.get('ep-gen-023');
if (asset) {
  const src = '/genesis_illustration_pack_v1_10/' + asset.imageFile;
  // <img src={src} alt={asset.altTextKo} />
}
```

### 필수 검토

- 본문의 기적·상징을 실제 고고학적으로 입증된 모습이라고 주장하지 않을 것.
- 창세기 22장은 아동 사용자에게 잔혹한 희생 장면을 노출하지 않을 것.
- 창세기 3장의 벌거벗음 및 34장 민감한 폭력 표현은 별도 안전 지침 준수.
- 누락 154개 이벤트는 반드시 플레이스홀더 표시하고 다른 이벤트 그림을 사실처럼 돌려쓰지 않을 것.
- 얼굴/복식/시대가 샷마다 달라지는 문제는 동일 캐릭터 시트 제작 후 해결.

### 검증

```bash
python genesis_illustration_pack_v1_10/validate_art_pack.py
```
