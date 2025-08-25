import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OpenAIProvider } from '../../providers/openai.provider';
import type { ChatMessage, ChatOptions } from '@woo/shared';

@Controller('chat')
export class ChatController {
  constructor(private readonly provider: OpenAIProvider) {}

  @Post('stream')
  async stream(
    @Body() body: { messages: ChatMessage[]; options?: ChatOptions },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const send = (event: unknown) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      for await (const chunk of this.provider.streamChat(body.messages, body.options)) {
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
