import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express'; // Import Express for Multer types

@Controller('broadcast')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './Uploads',
        filename: (req, file, cb) => {
          const name = `${Date.now()}-${file.originalname}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'video/mp4',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      },
    }),
  )
  async broadcast(
    @Body('message') message: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.broadcastService.broadcastMessage(message, file);
  }
}
