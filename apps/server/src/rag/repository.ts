import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const pool = new Pool({ connectionString: process.env.DB_URL });

@Injectable()
export class RagRepository {
  async createDocument({ title, size, tags }: { title: string; size: number; tags?: string[] }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO documents(id, user_id, name, mime_type, size_bytes, status, meta)
       VALUES ($1, $2, $3, $4, $5, 'ready', $6)`,
      [id, null, title, 'text/plain', size, JSON.stringify({ tags: tags ?? [] })]
    );
    return { id };
  }

  async upsertChunks(documentId: string, chunks: { chunkIndex: number; content: string; embedding: number[] }[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let count = 0;
      for (const c of chunks) {
        await client.query(
          `INSERT INTO chunks(id, document_id, chunk_index, content, embedding, meta)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [randomUUID(), documentId, c.chunkIndex, c.content, c.embedding, JSON.stringify({})]
        );
        count++;
      }
      await client.query('COMMIT');
      return count;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async searchEmbeddings(query: string, topK: number): Promise<Array<{ id: string; document_id: string; chunk_index: number; content: string; score: number; title: string }>> {
    const embResp = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small', input: query }),
    });
    const embJson = await embResp.json();
    const vec = embJson.data[0].embedding as number[];

    const { rows } = await pool.query(
      `SELECT c.id, c.document_id, c.chunk_index, c.content,
              1 - (c.embedding <=> $1::vector) AS score,
              d.name as title
       FROM chunks c
       JOIN documents d ON d.id = c.document_id
       WHERE c.deleted_at IS NULL AND d.deleted_at IS NULL
       ORDER BY c.embedding <=> $1::vector
       LIMIT $2`,
      [vec, topK]
    );
    return rows;
  }

  async getChunkById(id: string): Promise<{ id: string; document_id: string; chunk_index: number; content: string; title: string } | null> {
    const { rows } = await pool.query(
      `SELECT c.id, c.document_id, c.chunk_index, c.content, d.name as title
       FROM chunks c JOIN documents d ON d.id = c.document_id
       WHERE c.id = $1 AND c.deleted_at IS NULL AND d.deleted_at IS NULL`,
      [id]
    );
    return rows[0] ?? null;
  }
}
