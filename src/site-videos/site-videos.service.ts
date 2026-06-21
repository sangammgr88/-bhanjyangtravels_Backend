import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { SiteVideo, SiteVideoDocument } from './schemas/site-video.schema';

@Injectable()
export class SiteVideosService {
  private isConfigured = false;

  constructor(
    @InjectModel(SiteVideo.name) private siteVideoModel: Model<SiteVideoDocument>,
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
      console.warn('Cloudinary is not configured.');
      return;
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

  private mapOutput(video: any) {
    if (!video) return null;
    return {
      ...video,
      id: video._id?.toString(),
      _id: undefined,
    };
  }

  async findAll() {
    const videos = await this.siteVideoModel.find().sort({ createdAt: -1 }).lean().exec();
    return videos.map(v => this.mapOutput(v));
  }

  async findBySection(section: string) {
    const video = await this.siteVideoModel.findOne({ section }).lean().exec();
    return this.mapOutput(video);
  }

  async upsert(
    section: string,
    title: string | undefined,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }

    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only MP4, WebM, OGG, and MOV videos are allowed.',
      );
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 100MB.');
    }

    const existing = await this.siteVideoModel.findOne({ section }).exec();

    if (existing) {
      await this.deleteVideoFromCloudinary(existing.publicId);
    }

    const uploaded = await this.uploadVideoToCloudinary(file);

    const updateData = {
      section,
      title: title || existing?.title || section,
      videoUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      isActive: true,
    };

    const updated = await this.siteVideoModel.findOneAndUpdate(
      { section },
      updateData,
      { new: true, upsert: true }
    ).lean().exec();

    return this.mapOutput(updated);
  }

  async delete(section: string) {
    const video = await this.siteVideoModel.findOneAndDelete({ section }).lean().exec();

    if (!video) {
      throw new NotFoundException(`No video found for section "${section}"`);
    }

    await this.deleteVideoFromCloudinary(video.publicId);

    return this.mapOutput(video);
  }
}
