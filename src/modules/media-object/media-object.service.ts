// src/media-object/media-object.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { join, extname } from 'path';
import { mkdirSync } from 'fs';
import { promises as fs } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaObject } from './entities/media-object.entity';

@Injectable()
export class MediaObjectService {
  private readonly baseUploadDir = join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(MediaObject)
    private readonly mediaRepo: Repository<MediaObject>,
  ) {}

  async create(
    file: Express.Multer.File,
    source?: string,
  ): Promise<MediaObject> {
    const src = (source || 'default').toString().trim();
    const uploadPath = join(this.baseUploadDir, src);
    mkdirSync(uploadPath, { recursive: true });

    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext    = extname(file.originalname);
    const filename = `${file.fieldname}-${unique}${ext}`;
    const fullPath = join(uploadPath, filename);

    await fs.writeFile(fullPath, file.buffer);

    const relativePath = `${src}/${filename}`;
    const contentUrl   = `/uploads/${relativePath}`;

    const media = this.mediaRepo.create({
      filePath:   relativePath,
      contentUrl,
      source:     src,
    });
    return this.mediaRepo.save(media);
  }

  async getFile(source: string, filename: string): Promise<Buffer> {
    const filePath = join(this.baseUploadDir, source, filename);
    try {
      return await fs.readFile(filePath);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
