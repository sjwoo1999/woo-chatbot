import { Injectable } from '@nestjs/common';
import * as pdfjs from 'pdf-parse/lib/pdf-parse.js';
import { promises as fs } from 'fs';

@Injectable()
export class PdfExtractor {
  async extractText(filePath: string): Promise<string> {
    const buf = await fs.readFile(filePath);
    const data = await (pdfjs as any)(buf);
    return String(data.text || '').trim();
  }
}
