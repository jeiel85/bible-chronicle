# Bible Chronicle 웹 앱 (요셉의 시대 슬라이스)

docs/18_JOSEPH_SLICE_PLAN.md의 첫 플레이 구간입니다. 콘텐츠는 `phases/S01D/data`를 고치지 않고 그대로 읽습니다.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 이야기 엔진 불변식: 어떤 선택 순서로도 같은 정경 결과
npm run typecheck
npm run build      # dist/ (서비스 워커 포함, 오프라인 동작)
npm run e2e        # Playwright: 처음부터 플레이·같은 결말·회전·새로고침·오프라인·접근성(axe), PC/휴대폰
```

- `src/content/joseph.ts`: S01D 로더. 사슬이 끊기거나 결과가 맞지 않는 콘텐츠는 불러오지 않는다.
- `src/engine/story.ts`: 수렴형 이야기 엔진(허브 → 갈래 → 확정 결과 → 다음 에피소드).
- `src/storage/progress.ts`: IndexedDB 진행 저장(정경 결과는 저장하지 않음).
- `src/ui/`: 화면. 세로·가로·PC 세 가지 배치.

- 역사적 순간: `content/moments/*.json`, 그림은 `art/moments/<imageId>.webp`(없으면 "일러스트 준비 중"). 새 그림을 넣은 뒤에는 개발 서버를 다시 시작해야 보인다(앱 폴더 밖 파일은 감시하지 않음).

- 이 PC에서는 공용 Playwright 브라우저 폴더가 잠겨 있어 `PLAYWRIGHT_BROWSERS_PATH=%LOCALAPPDATA%/ms-playwright-bible-chronicle`로 따로 설치해 쓴다.

알려진 한계: 진행 저장은 비동기라, 클릭 후 수 밀리초 안에 창을 닫으면 마지막 한 걸음이 저장되지 않을 수 있다.
