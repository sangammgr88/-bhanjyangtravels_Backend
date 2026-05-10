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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EnquiriesService } from './enquiries.service';
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { EnquiryResponseDto } from './dto/enquiry-response.dto';
import { ApiSuccessResponse, ApiPaginatedResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';

@ApiTags('Enquiries')
@Controller('enquiries')
export class EnquiriesController {
  constructor(
    private readonly enquiriesService: EnquiriesService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit a trek enquiry' })
  @ApiSuccessResponse(EnquiryResponseDto, 'Enquiry submitted successfully', 201)
  @ApiErrorResponse(400, 'Validation failed')
  async create(@Body() body: CreateEnquiryDto, @Request() req): Promise<any> {
    const enquiry = await this.enquiriesService.create(body);
    return this.responseFormatter.formatSuccess(
      enquiry,
      'Enquiry submitted successfully',
      req,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all trek enquiries with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiPaginatedResponse(EnquiryResponseDto, 'Enquiries retrieved successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ): Promise<any> {
    try {
      const enquiries = await this.enquiriesService.findAll();
      const total = enquiries.length;
      const pagination = this.responseFormatter.calculatePagination(page, limit, total);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEnquiries = enquiries.slice(startIndex, endIndex);
      return this.responseFormatter.formatPaginated(
        paginatedEnquiries,
        pagination,
        'Enquiries retrieved successfully',
        req,
      );
    } catch (error) {
      console.error('Controller error fetching enquiries:', error);
      throw new HttpException(
        this.responseFormatter.formatError(
          error.message || 'Failed to fetch enquiries',
          'ENQUIRIES_FETCH_ERROR',
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          req,
        ),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiry by ID' })
  @ApiParam({ name: 'id', description: 'Enquiry ID' })
  @ApiSuccessResponse(EnquiryResponseDto, 'Enquiry retrieved successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'Enquiry not found')
  async findOne(@Param('id') id: string, @Request() req): Promise<any> {
    try {
      const enquiry = await this.enquiriesService.findOne(id);
      return this.responseFormatter.formatSuccess(
        enquiry,
        'Enquiry retrieved successfully',
        req,
      );
    } catch (error) {
      console.error('Controller error fetching enquiry:', error);
      throw new HttpException(
        this.responseFormatter.formatError(
          error.message || 'Failed to fetch enquiry',
          'ENQUIRY_FETCH_ERROR',
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          req,
        ),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete enquiry by ID' })
  @ApiParam({ name: 'id', description: 'Enquiry ID' })
  @ApiSuccessResponse(EnquiryResponseDto, 'Enquiry successfully deleted')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'Enquiry not found')
  async remove(@Param('id') id: string, @Request() req): Promise<any> {
    try {
      const enquiry = await this.enquiriesService.delete(id);
      return this.responseFormatter.formatSuccess(
        enquiry,
        'Enquiry successfully deleted',
        req,
      );
    } catch (error) {
      console.error('Controller error deleting enquiry:', error);
      throw new HttpException(
        this.responseFormatter.formatError(
          error.message || 'Failed to delete enquiry',
          'ENQUIRY_DELETE_ERROR',
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          req,
        ),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}