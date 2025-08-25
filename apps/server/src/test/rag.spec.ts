import { describe, expect, it } from 'vitest';
import { Chunker } from '../rag/chunker';

describe('RAG chunker', () => {
  it('splits long text into multiple chunks with overlap', () => {
    const chunker = new Chunker();
    const text = '문장1. 문장2. 문장3. 문장4. 문장5. 문장6. 문장7. 문장8.';
    const chunks = chunker.split(text, { size: 8, overlap: 2 });
    expect(chunks.length).toBeGreaterThan(1);
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].content).toMatch(/문장\d+/);
    }
  });
});
