import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbedderOpenAI {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
  }

  async embed(texts: string[]): Promise<number[][]> {
    const res = await this.client.embeddings.create({
      model: this.model,
      input: texts,
    });
    return res.data.map((d) => d.embedding as unknown as number[]);
  }
}
