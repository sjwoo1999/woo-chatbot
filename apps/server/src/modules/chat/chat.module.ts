import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { OpenAIProvider } from '../../providers/openai.provider';
import { APP_GUARD } from '@nestjs/core';
import { SafetyGuard } from '../../safety/guard';
import { RagRepository } from '../../rag/repository';

@Module({
  controllers: [ChatController],
  providers: [
    OpenAIProvider,
    RagRepository,
    { provide: APP_GUARD, useClass: SafetyGuard },
  ],
})
export class ChatModule {}
