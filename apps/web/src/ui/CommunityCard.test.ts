import { describe, expect, it } from 'vitest';
import { lifeNoteLabel } from './CommunityCard';

describe('life note badge', () => {
  it('names only the evidence the note has', () => {
    expect(lifeNoteLabel('life_history', false, true)).toBe('생활사 · 외부 자료 근거');
    expect(lifeNoteLabel('life_history', true, true)).toBe('생활사 · 외부 자료와 성경 본문 근거');
    expect(lifeNoteLabel('text_background', true, false)).toBe('성경 속 배경 · 성경 본문 근거');
  });
});
