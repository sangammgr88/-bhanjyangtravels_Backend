import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogResponseDto } from './dto/blog-response.dto';
import {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
} from '../common/decorators/api-response.decorator';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  @Post()
  @ApiBody({ type: CreateBlogDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiSuccessResponse(BlogResponseDto, 'Blog successfully created', 201)
  @ApiErrorResponse(400, 'Validation failed')
  async create(@Body() body: CreateBlogDto, @Request() req): Promise<any> {
    const blog = await this.blogsService.create(body);
    return this.responseFormatter.formatSuccess(
      blog,
      'Blog successfully created',
      req,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiPaginatedResponse(BlogResponseDto, 'Blogs retrieved successfully')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ): Promise<any> {
    const blogs = await this.blogsService.findAll();
    const total = blogs.length;
    const pagination = this.responseFormatter.calculatePagination(
      page,
      limit,
      total,
    );
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBlogs = blogs.slice(startIndex, endIndex);
    return this.responseFormatter.formatPaginated(
      paginatedBlogs,
      pagination,
      'Blogs retrieved successfully',
      req,
    );
  }

  @Get('/slug/:slug')
  @ApiOperation({ summary: 'Get blog by slug' })
  @ApiParam({ name: 'slug', description: 'Blog slug' })
  @ApiSuccessResponse(BlogResponseDto, 'Blog retrieved successfully')
  @ApiErrorResponse(404, 'Blog not found')
  async findBySlug(@Param('slug') slug: string, @Request() req): Promise<any> {
    const blog = await this.blogsService.findBySlug(slug);
    return this.responseFormatter.formatSuccess(
      blog,
      'Blog retrieved successfully',
      req,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog by ID' })
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiSuccessResponse(BlogResponseDto, 'Blog retrieved successfully')
  @ApiErrorResponse(404, 'Blog not found')
  async findOne(@Param('id') id: string, @Request() req): Promise<any> {
    const blog = await this.blogsService.findOne(id);
    return this.responseFormatter.formatSuccess(
      blog,
      'Blog retrieved successfully',
      req,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateBlogDto })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog by ID' })
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiSuccessResponse(BlogResponseDto, 'Blog successfully updated')
  @ApiErrorResponse(404, 'Blog not found')
  @ApiErrorResponse(400, 'Validation failed')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBlogDto,
    @Request() req,
  ): Promise<any> {
    const blog = await this.blogsService.update(id, body);
    return this.responseFormatter.formatSuccess(
      blog,
      'Blog successfully updated',
      req,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog by ID' })
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiSuccessResponse(BlogResponseDto, 'Blog successfully deleted')
  @ApiErrorResponse(404, 'Blog not found')
  async remove(@Param('id') id: string, @Request() req): Promise<any> {
    const blog = await this.blogsService.delete(id);
    return this.responseFormatter.formatSuccess(
      blog,
      'Blog successfully deleted',
      req,
    );
  }
}
