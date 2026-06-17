import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SiteVideosService } from './site-videos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../common/decorators/api-response.decorator';

@ApiTags('Site Videos')
@Controller('site-videos')
export class SiteVideosController {
  constructor(
    private readonly siteVideosService: SiteVideosService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all site videos' })
  @ApiSuccessResponse(Object, 'Site videos retrieved successfully')
  async findAll(@Request() req): Promise<any> {
    const videos = await this.siteVideosService.findAll();
    return this.responseFormatter.formatSuccess(
      videos,
      'Site videos retrieved successfully',
      req,
    );
  }

  @Get(':section')
  @ApiOperation({ summary: 'Get video by section name' })
  @ApiParam({
    name: 'section',
    description: 'Section name (home, about, treks, tours)',
  })
  @ApiSuccessResponse(Object, 'Site video retrieved successfully')
  async findBySection(
    @Param('section') section: string,
    @Request() req,
  ): Promise<any> {
    const video = await this.siteVideosService.findBySection(section);
    return this.responseFormatter.formatSuccess(
      video,
      'Site video retrieved successfully',
      req,
    );
  }

  @Post(':section')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload or replace video for a section' })
  @ApiParam({
    name: 'section',
    description: 'Section name (home, about, treks, tours)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'Video file (MP4, WebM, OGG, MOV)',
        },
        title: {
          type: 'string',
          description: 'Optional display title',
        },
      },
    },
  })
  @ApiSuccessResponse(Object, 'Video uploaded successfully')
  @ApiErrorResponse(400, 'Invalid file type or size')
  @ApiErrorResponse(401, 'Unauthorized access')
  @UseInterceptors(FileInterceptor('video'))
  async upload(
    @Param('section') section: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Request() req,
  ): Promise<any> {
    const validSections = ['home', 'about', 'trek', 'tour'];
    if (!validSections.includes(section)) {
      return this.responseFormatter.formatError(
        'Invalid section. Must be one of: home, about, trek, tour',
        'BAD_REQUEST',
        400,
        req,
      );
    }

    const video = await this.siteVideosService.upsert(section, title, file);
    return this.responseFormatter.formatSuccess(
      video,
      'Video uploaded successfully',
      req,
    );
  }

  @Delete(':section')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete video for a section' })
  @ApiParam({
    name: 'section',
    description: 'Section name (home, about, trek, tour)',
  })
  @ApiSuccessResponse(Object, 'Video deleted successfully')
  @ApiErrorResponse(404, 'Video not found')
  async remove(
    @Param('section') section: string,
    @Request() req,
  ): Promise<any> {
    const video = await this.siteVideosService.delete(section);
    return this.responseFormatter.formatSuccess(
      video,
      'Video deleted successfully',
      req,
    );
  }
}
