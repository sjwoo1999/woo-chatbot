import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { OpenAIProvider } from '../../providers/openai.provider';
import { APP_GUARD } from '@nestjs/core';
import { SafetyGuard } from '../../safety/guard';

@Module({
  controllers: [ChatController],
  providers: [
    OpenAIProvider,
    { provide: APP_GUARD, useClass: SafetyGuard },
  ],
})
export class ChatModule {}
