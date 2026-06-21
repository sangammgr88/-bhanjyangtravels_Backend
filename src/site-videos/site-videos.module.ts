import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteVideosController } from './site-videos.controller';
import { SiteVideosService } from './site-videos.service';
import { memoryStorage } from 'multer';
import { SiteVideo, SiteVideoSchema } from './schemas/site-video.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SiteVideo.name, schema: SiteVideoSchema }]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(mp4|webm|ogg|mov)$/i)) {
          return cb(new Error('Only video files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [SiteVideosController],
  providers: [SiteVideosService],
  exports: [SiteVideosService],
})
export class SiteVideosModule {}
