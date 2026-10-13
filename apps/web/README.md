# Bible Chronicle 웹 앱 (요셉의 시대 슬라이스)

docs/18_JOSEPH_SLICE_PLAN.md의 첫 플레이 구간입니다. 콘텐츠는 `phases/S01D/data`를 고치지 않고 그대로 읽습니다.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 이야기 엔진 불변식: 어떤 선택 순서로도 같은 정경 결과
npm run typecheck
npm run build      # dist/
```

- `src/content/joseph.ts`: S01D 로더. 사슬이 끊기거나 결과가 맞지 않는 콘텐츠는 불러오지 않는다.
- `src/engine/story.ts`: 수렴형 이야기 엔진(허브 → 갈래 → 확정 결과 → 다음 에피소드).
- `src/storage/progress.ts`: IndexedDB 진행 저장(정경 결과는 저장하지 않음).
- `src/ui/`: 화면. 세로·가로·PC 세 가지 배치.

알려진 한계: 진행 저장은 비동기라, 클릭 후 수 밀리초 안에 창을 닫으면 마지막 한 걸음이 저장되지 않을 수 있다.
