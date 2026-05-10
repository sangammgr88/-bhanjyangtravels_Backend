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
import { TreksService } from './treks.service';
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTrekDto } from './dto/create-trek.dto';
import { UpdateTrekDto } from './dto/update-trek.dto';
import { TrekResponseDto } from './dto/trek-response.dto';
import {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
} from '../common/decorators/api-response.decorator';

@ApiTags('Treks')
@Controller('treks')
export class TreksController {
  constructor(
    private readonly treksService: TreksService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  @Post()
  @ApiBody({ type: CreateTrekDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new trek' })
  @ApiSuccessResponse(TrekResponseDto, 'Trek successfully created', 201)
  @ApiErrorResponse(400, 'Validation failed')
  async create(@Body() body: CreateTrekDto, @Request() req): Promise<any> {
    const trek = await this.treksService.create(body);
    return this.responseFormatter.formatSuccess(
      trek,
      'Trek successfully created',
      req,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all treks with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiPaginatedResponse(TrekResponseDto, 'Treks retrieved successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ): Promise<any> {
    const treks = await this.treksService.findAll();
    const total = treks.length;
    const pagination = this.responseFormatter.calculatePagination(
      page,
      limit,
      total,
    );
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTreks = treks.slice(startIndex, endIndex);
    return this.responseFormatter.formatPaginated(
      paginatedTreks,
      pagination,
      'Treks retrieved successfully',
      req,
    );
  }

  @Get('/slug/:slug')
  @ApiOperation({ summary: 'Get trek by slug' })
  @ApiParam({ name: 'slug', description: 'Trek slug' })
  @ApiSuccessResponse(TrekResponseDto, 'Trek retrieved successfully')
  @ApiErrorResponse(404, 'Trek not found')
  async findBySlug(@Param('slug') slug: string, @Request() req): Promise<any> {
    const trek=await this.treksService.findBySlug(slug);
    return this.responseFormatter.formatSuccess(
      trek,
      'Trek retrieved successfully',
      req,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trek by ID' })
  @ApiParam({ name: 'id', description: 'Trek ID' })
  @ApiSuccessResponse(TrekResponseDto, 'Trek retrieved successfully')
  @ApiErrorResponse(404, 'Trek not found')
  async findOne(@Param('id') id: string, @Request() req): Promise<any> {
    const trek = await this.treksService.findOne(id);
    return this.responseFormatter.formatSuccess(
      trek,
      'Trek retrieved successfully',
      req,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateTrekDto })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update trek by ID' })
  @ApiParam({ name: 'id', description: 'Trek ID' })
  @ApiSuccessResponse(TrekResponseDto, 'Trek successfully updated')
  @ApiErrorResponse(404, 'Trek not found')
  @ApiErrorResponse(400, 'Validation failed')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTrekDto,
    @Request() req,
  ): Promise<any> {
    const trek = await this.treksService.update(id, body);
    return this.responseFormatter.formatSuccess(
      trek,
      'Trek successfully updated',
      req,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete trek by ID' })
  @ApiParam({ name: 'id', description: 'Trek ID' })
  @ApiSuccessResponse(TrekResponseDto, 'Trek successfully deleted')
  @ApiErrorResponse(404, 'Trek not found')
  async remove(@Param('id') id: string, @Request() req): Promise<any> {
    const trek = await this.treksService.delete(id);
    return this.responseFormatter.formatSuccess(
      trek,
      'Trek successfully deleted',
      req,
    );
  }
}
