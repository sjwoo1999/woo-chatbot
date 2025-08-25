import type { ChatMessage, ChatOptions, ModelProvider, StreamChunk } from '@woo/shared';

export class OpenAIProvider implements ModelProvider {
  public readonly name = 'openai';

  async *streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<StreamChunk> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      yield { type: 'error', content: 'Missing API_KEY' };
      return;
    }

    const body = {
      model: options?.model ?? process.env.MODEL_NAME ?? 'gpt-4o-mini',
      messages,
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 512,
      stream: true,
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok || !resp.body) {
      const text = await resp.text();
      yield { type: 'error', content: `OpenAI error: ${text}` };
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const part = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        if (!part) continue;
        if (!part.startsWith('data:')) continue;
        const data = part.replace(/^data:\s*/, '');
        if (data === '[DONE]') {
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta: string | undefined = json.choices?.[0]?.delta?.content;
          if (delta) {
            yield { type: 'text', content: delta };
          }
        } catch {
          // ignore chunk parse errors
        }
      }
    }
  }
}
