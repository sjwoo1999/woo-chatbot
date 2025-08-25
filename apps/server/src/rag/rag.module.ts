import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { IngestService } from './ingest.service';
import { Chunker } from './chunker';
import { EmbedderOpenAI } from './embedder.openai';
import { RagRepository } from './repository';

@Module({
  controllers: [RagController],
  providers: [IngestService, Chunker, EmbedderOpenAI, RagRepository],
  exports: [RagRepository],
})
export class RagModule {}
