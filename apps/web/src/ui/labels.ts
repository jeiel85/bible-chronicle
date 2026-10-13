const BOOK_KO: Record<string, string> = { GEN: '창세기' };

/** "GEN.37.1-GEN.37.4" -> "창세기 37:1–4", "GEN.37.36-GEN.38.2" -> "창세기 37:36–38:2". */
export function osisToKo(osis: string): string {
  const [start, end] = osis.split('-');
  const [book, chapter, verse] = start.split('.');
  const name = BOOK_KO[book] ?? book;
  if (!end) return `${name} ${chapter}:${verse}`;
  const [, endChapter, endVerse] = end.split('.');
  return endChapter === chapter ? `${name} ${chapter}:${verse}–${endVerse}` : `${name} ${chapter}:${verse}–${endChapter}:${endVerse}`;
}

/** Content advisories shown on an episode (docs/16, S01D sensitive content review). Tags not listed are not shown. */
export const SENSITIVITY_KO: Record<string, string> = {
  child_trafficking: '주의: 인신매매',
  sexual_coercion: '주의: 성적 강요',
  sexual_ethics: '주의: 성 윤리',
  adult_theme: '주의: 성인 주제',
  violence: '주의: 폭력',
  execution: '주의: 처형',
  death_sentence: '주의: 사형 선고',
  threatened_execution: '주의: 처형 위협',
  death: '죽음',
  grief: '슬픔',
  famine: '기근',
  imprisonment: '투옥',
  false_accusation: '거짓 고발',
  coercive_power: '권력의 강압',
};
