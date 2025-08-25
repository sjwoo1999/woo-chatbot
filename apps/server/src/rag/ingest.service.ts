import { Injectable } from '@nestjs/common';
import { RagRepository } from './repository';
import { Chunker } from './chunker';
import { EmbedderOpenAI } from './embedder.openai';

@Injectable()
export class IngestService {
  constructor(
    private readonly repo: RagRepository,
    private readonly chunker: Chunker,
    private readonly embedder: EmbedderOpenAI,
  ) {}

  async ingestText({ title, text, tags }: { title: string; text: string; tags?: string[] }) {
    const size = Buffer.byteLength(text, 'utf8');
    const { id: documentId } = await this.repo.createDocument({ title, size, tags });

    const chunkSize = Number(process.env.CHUNK_TOKENS || 400);
    const chunkOverlap = Number(process.env.CHUNK_OVERLAP || 40);
    const chunks = this.chunker.split(text, { size: chunkSize, overlap: chunkOverlap });

    const embeddings = await this.embedder.embed(chunks.map((c) => c.content));
    const rows = chunks.map((c, i) => ({ chunkIndex: c.chunkIndex, content: c.content, embedding: embeddings[i] }));
    const inserted = await this.repo.upsertChunks(documentId, rows);

    return { inserted };
  }
}
