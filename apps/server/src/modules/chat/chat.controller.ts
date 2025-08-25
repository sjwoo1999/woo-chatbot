import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OpenAIProvider } from '../../providers/openai.provider';
import type { ChatMessage, ChatOptions } from '@woo/shared';
import { RagRepository } from '../../rag/repository';

@Controller('chat')
export class ChatController {
  constructor(private readonly provider: OpenAIProvider, private readonly rag: RagRepository) {}

  @Post('stream')
  async stream(
    @Body() body: { messages: ChatMessage[]; options?: ChatOptions; knowledgeBase?: boolean },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const send = (event: unknown) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      const messages = [...body.messages];
      let sources: any[] = [];

      if (body.knowledgeBase) {
        const last = messages[messages.length - 1];
        const q = last?.content ?? '';
        const top = await this.rag.searchEmbeddings(q, 6);
        sources = top.map((r) => ({ docId: r.document_id, title: r.title, chunkId: r.id, index: r.chunk_index }));
        const knowledge = top.map((r) => `# ${r.title} [chunk:${r.chunk_index}]\n${r.content}`).join('\n\n---\n\n');
        const sys: ChatMessage = { role: 'system', content: `retrieved_knowledge:\n\n${knowledge}` };
        messages.unshift(sys);
      }

      if (sources.length) {
        send({ type: 'tool', toolName: 'sources', toolPayload: sources });
      }

      for await (const chunk of this.provider.streamChat(messages, body.options)) {
        send(chunk);
      }
      send({ type: 'done' });
    } catch (e: any) {
      send({ type: 'error', content: e?.message ?? 'stream error' });
    } finally {
      res.end();
    }
  }
}
