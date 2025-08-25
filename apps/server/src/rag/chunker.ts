import { Injectable } from '@nestjs/common';

interface Chunk { chunkIndex: number; content: string }

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

@Injectable()
export class Chunker {
  split(text: string, opts: { size: number; overlap: number }): Chunk[] {
    const target = opts.size;
    const overlap = opts.overlap;
    const sentences = text.split(/(?<=[.!?\n])\s+/);

    const chunks: Chunk[] = [];
    let buffer = '';
    let idx = 0;

    const flush = () => {
      if (buffer.trim().length === 0) return;
      chunks.push({ chunkIndex: idx++, content: buffer.trim() });
      buffer = '';
    };

    for (const s of sentences) {
      const next = buffer + (buffer ? ' ' : '') + s;
      if (estimateTokens(next) > target) {
        flush();
        buffer = s;
      } else {
        buffer = next;
      }
    }
    flush();

    if (chunks.length === 1 && estimateTokens(chunks[0].content) > target * 1.5) {
      const content = chunks[0].content;
      chunks.pop();
      let start = 0;
      while (start < content.length) {
        let end = start + target * 4;
        if (end > content.length) end = content.length;
        chunks.push({ chunkIndex: idx++, content: content.substring(start, end).trim() });
        start = end;
      }
    }

    if (overlap > 0) {
      for (let i = 1; i < chunks.length; i++) {
        const prev = chunks[i - 1].content;
        const tail = prev.slice(Math.max(0, prev.length - overlap * 4));
        chunks[i].content = (tail + ' ' + chunks[i].content).trim();
      }
    }
    return chunks;
  }
}
