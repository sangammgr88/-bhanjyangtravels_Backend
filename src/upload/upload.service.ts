import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.configureCloudinary();
  }

  private configureCloudinary() {
    if (this.isConfigured) return;

    // Try CLOUDINARY_URL first (most reliable, single env var)
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');
    if (cloudinaryUrl) {
      const trimmedUrl = cloudinaryUrl.trim();
      // Parse the URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
      const match = trimmedUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
      if (match) {
        cloudinary.config({
          cloud_name: match[3].trim(),
          api_key: match[1].trim(),
          api_secret: match[2].trim(),
          secure: true,
        });
        console.log('Cloudinary configured via CLOUDINARY_URL for cloud:', match[3].trim());
        this.isConfigured = true;
        return;
      }
    }

    // Fallback to individual env vars
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.trim();
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary is not configured. Set CLOUDINARY_URL or individual CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log('Cloudinary configured via individual env vars for cloud:', cloudName);
    this.isConfigured = true;
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<UploadApiResponse> {
    this.configureCloudinary();
    const folder = this.configService.get<string>('CLOUDINARY_FOLDER');
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    console.log('Uploading to Cloudinary cloud:', cloudName);

    const uploadOptions = {
      resource_type: 'image' as const,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...(folder ? { folder } : {}),
    };

    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', JSON.stringify(error));
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary did not return an upload result.'));
            return;
          }

          console.log('Cloudinary upload success:', result.secure_url);
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

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    const uploadedFile = await this.uploadToCloudinary(file);

    return {
      filename: uploadedFile.public_id,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: uploadedFile.secure_url,
      secureUrl: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      assetId: uploadedFile.asset_id,
      format: uploadedFile.format,
      width: uploadedFile.width,
      height: uploadedFile.height,
    };
  }

  async uploadMultipleImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file type
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type for ${file.originalname}. Only images are allowed.`);
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new BadRequestException(`File ${file.originalname} too large. Maximum size is 5MB.`);
      }

      const uploadedFile = await this.uploadToCloudinary(file);
      uploadedFiles.push({
        filename: uploadedFile.public_id,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: uploadedFile.secure_url,
        secureUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        assetId: uploadedFile.asset_id,
        format: uploadedFile.format,
        width: uploadedFile.width,
        height: uploadedFile.height,
      });
    }

    return uploadedFiles;
  }

  async deleteImage(identifier: string) {
    if (!identifier) {
      throw new BadRequestException('No image identifier provided');
    }

    this.configureCloudinary();
    const publicId = this.normalizePublicId(identifier);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new BadRequestException(`Failed to delete image: ${result.result}`);
    }

    return { success: true, message: 'File deleted successfully', publicId };
  }

  private normalizePublicId(identifier: string) {
    const decodedIdentifier = decodeURIComponent(identifier);
    const lastSegment = decodedIdentifier.split('/').pop() || decodedIdentifier;

    return lastSegment.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  }
}   