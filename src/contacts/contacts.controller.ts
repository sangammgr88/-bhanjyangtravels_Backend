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
  ApiResponse,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { ApiSuccessResponse, ApiPaginatedResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact form' })
  @ApiSuccessResponse(ContactResponseDto, 'Contact form submitted successfully', 201)
  @ApiErrorResponse(400, 'Validation failed')
  async create(@Body() body: CreateContactDto, @Request() req): Promise<any> {
    const contact = await this.contactsService.create(body);
    return this.responseFormatter.formatSuccess(
      contact,
      'Contact form submitted successfully',
      req,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact submissions with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiPaginatedResponse(ContactResponseDto, 'Contacts retrieved successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ): Promise<any> {
    const contacts = await this.contactsService.findAll();
    const total = contacts.length;
    const pagination = this.responseFormatter.calculatePagination(page, limit, total);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContacts = contacts.slice(startIndex, endIndex);
    return this.responseFormatter.formatPaginated(
      paginatedContacts,
      pagination,
      'Contacts retrieved successfully',
      req,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiSuccessResponse(ContactResponseDto, 'Contact retrieved successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'Contact not found')
  async findOne(@Param('id') id: string, @Request() req): Promise<any> {
    const contact = await this.contactsService.findOne(id);
    return this.responseFormatter.formatSuccess(
      contact,
      'Contact retrieved successfully',
      req,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiSuccessResponse(ContactResponseDto, 'Contact successfully deleted')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'Contact not found')
  async remove(@Param('id') id: string, @Request() req): Promise<any> {
    const contact = await this.contactsService.delete(id);
    return this.responseFormatter.formatSuccess(
      contact,
      'Contact successfully deleted',
      req,
    );
  }
} 