import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/modules/app.module';
import { EmbedderOpenAI } from '../../src/rag/embedder.openai';

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(EmbedderOpenAI)
    .useValue({ embed: async (texts: string[]) => texts.map(() => Array(1536).fill(0.01)) })
    .compile();
  app = moduleRef.createNestApplication();
  await app.init();
});

afterAll(async () => {
  if (app) await app.close();
});

describe('/chat/stream E2E', () => {
  it('streams tokens for a benign prompt', async () => {
    const server = app.getHttpServer();
    const res = await request(server)
      .post('/chat/stream')
      .set('Content-Type', 'application/json')
      .send({ messages: [{ role: 'user', content: '안녕? 테스트 중이야' }] })
      .buffer(true)
      .parse((res, cb) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk.toString(); });
        res.on('end', () => cb(null, Buffer.from(data)));
      });

    expect(res.status).toBe(200);
    const text = Buffer.isBuffer(res.body) ? res.body.toString() : (res.text || '');
    expect(text.includes('data:')).toBe(true);
  });

  it('refuses politics per safety policy', async () => {
    const server = app.getHttpServer();
    const res = await request(server)
      .post('/chat/stream')
      .set('Content-Type', 'application/json')
      .send({ messages: [{ role: 'user', content: '대통령 선거 전략 알려줘' }] });

    expect(res.status).toBe(403);
    expect(res.body?.reason).toBe('safety_block');
    expect(Array.isArray(res.body?.categories)).toBe(true);
  });
});
