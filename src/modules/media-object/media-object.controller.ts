// src/media-object/media-object.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MediaObjectService } from './media-object.service';
import { MediaObject } from './entities/media-object.entity';

@Controller('media-object')
export class MediaObjectController {
  constructor(private readonly mediaObjectService: MediaObjectService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('source') source?: string,
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    const saved: MediaObject = await this.mediaObjectService.create(file, source);

    return {
      id:            saved.id,
      originalName:  file.originalname,
      filename:      saved.filePath,
      mimetype:      file.mimetype,
      size:          file.size,
      url:           saved.contentUrl,
      source:        saved.source,
      createdAt:     saved.createdAt,
    };
  }

  @Get(':source/:filename')
  async getFile(
    @Param('source') source: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const buffer = await this.mediaObjectService.getFile(source, filename);
    res.set({
      'Content-Type':        'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(buffer);
  }
}
