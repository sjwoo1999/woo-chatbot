export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface StreamChunk {
  type: 'text' | 'tool' | 'error' | 'done';
  content?: string;
  toolName?: string;
  toolPayload?: unknown;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
}

export interface ModelProvider {
  name: string;
  streamChat: (
    messages: ChatMessage[],
    options?: ChatOptions
  ) => AsyncIterable<StreamChunk>;
}

export const MODEL_PROVIDER_ENV = {
  provider: process.env.MODEL_PROVIDER ?? 'openai',
  apiKey: process.env.API_KEY ?? '',
  modelName: process.env.MODEL_NAME ?? 'gpt-4o-mini',
} as const;
