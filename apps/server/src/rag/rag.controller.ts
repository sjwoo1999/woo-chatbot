import { Controller, Get, Param } from '@nestjs/common';
import { RagRepository } from './repository';

@Controller('rag')
export class RagController {
  constructor(private readonly repo: RagRepository) {}

  @Get('chunks/:id')
  async getChunk(@Param('id') id: string) {
    const row = await this.repo.getChunkById(id);
    if (!row) return { ok: false };
    return { ok: true, chunk: row };
  }
}
