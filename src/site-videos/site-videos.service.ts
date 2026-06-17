import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { SiteVideo } from '@prisma/client';

@Injectable()
export class SiteVideosService {
  private isConfigured = false;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.configureCloudinary();
  }

  private configureCloudinary() {
    if (this.isConfigured) return;

    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');
    if (cloudinaryUrl) {
      const match = cloudinaryUrl.trim().match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
      if (match) {
        cloudinary.config({
          cloud_name: match[3].trim(),
          api_key: match[1].trim(),
          api_secret: match[2].trim(),
          secure: true,
        });
        this.isConfigured = true;
        return;
      }
    }

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.trim();
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary is not configured.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    this.isConfigured = true;
  }

  private async uploadVideoToCloudinary(file: Express.Multer.File): Promise<UploadApiResponse> {
    this.configureCloudinary();
    const folder = this.configService.get<string>('CLOUDINARY_FOLDER');

    const uploadOptions = {
      resource_type: 'video' as const,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      folder: folder ? `${folder}/site-videos` : 'site-videos',
    };

    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary video upload error:', JSON.stringify(error));
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error('Cloudinary did not return an upload result.'));
            return;
          }
          console.log('Cloudinary video upload success:', result.secure_url);
          resolve(result);
        },
      );

      const bufferStream = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

      bufferStream.pipe(uploadStream);
    });
  }

  private async deleteVideoFromCloudinary(publicId: string): Promise<void> {
    this.configureCloudinary();
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    } catch (error) {
      console.error('Failed to delete video from Cloudinary:', error);
    }
  }

  async findAll(): Promise<SiteVideo[]> {
    return this.prisma.siteVideo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySection(section: string): Promise<SiteVideo | null> {
    return this.prisma.siteVideo.findUnique({
      where: { section },
    });
  }

  async upsert(
    section: string,
    title: string | undefined,
    file: Express.Multer.File,
  ): Promise<SiteVideo> {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only MP4, WebM, OGG, and MOV videos are allowed.',
      );
    }

    // Validate file size (100MB max for videos)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 100MB.');
    }

    // Check if a video already exists for this section
    const existing = await this.prisma.siteVideo.findUnique({
      where: { section },
    });

    // Delete old video from Cloudinary if replacing
    if (existing) {
      await this.deleteVideoFromCloudinary(existing.publicId);
    }

    // Upload new video to Cloudinary
    const uploaded = await this.uploadVideoToCloudinary(file);

    // Upsert the database record
    return this.prisma.siteVideo.upsert({
      where: { section },
      update: {
        title: title || existing?.title || section,
        videoUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        isActive: true,
      },
      create: {
        section,
        title: title || section,
        videoUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        isActive: true,
      },
    });
  }

  async delete(section: string): Promise<SiteVideo> {
    const video = await this.prisma.siteVideo.findUnique({
      where: { section },
    });

    if (!video) {
      throw new NotFoundException(`No video found for section "${section}"`);
    }

    // Delete from Cloudinary
    await this.deleteVideoFromCloudinary(video.publicId);

    // Delete from database
    return this.prisma.siteVideo.delete({
      where: { section },
    });
  }
}
