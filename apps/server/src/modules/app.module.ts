import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { RagModule } from '../rag/rag.module';
import { TelemetryService } from '../telemetry/telemetry.service';

@Module({
  imports: [ChatModule, RagModule],
  providers: [TelemetryService],
})
export class AppModule {}
