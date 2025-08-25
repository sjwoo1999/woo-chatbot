import { describe, expect, it } from 'vitest';
import { moderate } from '../safety/moderation';

describe('Safety moderation', () => {
  it('blocks politics', () => {
    const r = moderate('대통령 선거 전략 알려줘');
    expect(r.blocked).toBe(true);
    expect(r.categories).toContain('politics');
  });

  it('masks PII and warns', () => {
    const r = moderate('제 번호는 010-1234-5678 입니다.');
    expect(r.maskedText).not.toContain('010-1234-5678');
    expect(r.categories).toContain('pii');
    expect(r.warn).toBe(true);
  });
});
