import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import { ApiSuccessResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly responseFormatter: ResponseFormatterService,
  ) { }

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
    },
  })
  @ApiSuccessResponse(Object, 'Image uploaded successfully')
  @ApiErrorResponse(400, 'Invalid file type or size')
  @ApiErrorResponse(401, 'Unauthorized access')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const result = await this.uploadService.uploadImage(file);
    return this.responseFormatter.formatSuccess(
      result,
      'Image uploaded successfully',
      req,
    );
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple image files to upload',
        },
      },
    },
  })
  @ApiSuccessResponse(Object, 'Images uploaded successfully')
  @ApiErrorResponse(400, 'Invalid file type or size')
  @ApiErrorResponse(401, 'Unauthorized access')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const result = await this.uploadService.uploadMultipleImages(files);
    return this.responseFormatter.formatSuccess(
      result,
      'Images uploaded successfully',
      req,
    );
  }

  @Delete('image/:filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an image' })
  @ApiSuccessResponse(Object, 'Image deleted successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'Image not found')
  async deleteImage(
    @Param('filename') filename: string,
    @Request() req,
  ) {
    const result = await this.uploadService.deleteImage(filename);
    return this.responseFormatter.formatSuccess(
      result,
      'Image deleted successfully',
      req,
    );
  }
} 