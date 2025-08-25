import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RagRepository } from './repository';
import { IngestService } from './ingest.service';

@Controller('rag')
export class RagController {
  constructor(private readonly repo: RagRepository, private readonly ingest: IngestService) {}

  @Get('chunks/:id')
  async getChunk(@Param('id') id: string) {
    const row = await this.repo.getChunkById(id);
    if (!row) return { ok: false };
    return { ok: true, chunk: row };
  }

  @Post('ingest')
  async ingest(@Body() body: { title: string; text: string; tags?: string[] }) {
    const { title, text, tags } = body;
    const { inserted } = await this.ingest.ingestText({ title, text, tags });
    return { ok: true, inserted };
  }
}
