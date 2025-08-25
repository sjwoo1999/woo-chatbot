import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { RagRepository } from './repository';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { promises as fs } from 'fs';
import { PdfExtractor } from './pdf';
import { IngestService } from './ingest.service';

@Controller('rag')
export class RagController {
  constructor(private readonly repo: RagRepository, private readonly pdf: PdfExtractor, private readonly ingest: IngestService) {}

  @Get('chunks/:id')
  async getChunk(@Param('id') id: string) {
    const row = await this.repo.getChunkById(id);
    if (!row) return { ok: false };
    return { ok: true, chunk: row };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: async (req, file, cb) => {
        try {
          const dir = process.env.UPLOAD_DIR || '.uploads';
          await fs.mkdir(dir, { recursive: true });
          cb(null, dir);
        } catch (e) {
          cb(e as any, '');
        }
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    })
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const path = file.path;
    const name = file.originalname;
    const ext = extname(name).toLowerCase();

    let text = '';
    if (ext === '.md' || ext === '.txt') {
      text = await fs.readFile(path, 'utf8');
    } else if (ext === '.pdf') {
      text = await this.pdf.extractText(path);
    } else {
      return { ok: false, error: 'unsupported_file_type' };
    }

    const { inserted } = await this.ingest.ingestText({ title: name, text });
    return { ok: true, inserted };
  }
}
