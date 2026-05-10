import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiSuccessResponse, ApiPaginatedResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiSuccessResponse(UserResponseDto, 'User successfully created', 201)
  @ApiErrorResponse(409, 'User with this email already exists')
  @ApiErrorResponse(400, 'Validation failed')
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const user = await this.usersService.create(createUserDto);
    return this.responseFormatter.formatSuccess(
      user,
      'User successfully created',
      req,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiPaginatedResponse(UserResponseDto, 'Users retrieved successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    const users = await this.usersService.findAll();
    
    // Calculate pagination
    const total = users.length;
    const pagination = this.responseFormatter.calculatePagination(page, limit, total);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return this.responseFormatter.formatPaginated(
      paginatedUsers,
      pagination,
      'Users retrieved successfully',
      req,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiSuccessResponse(UserResponseDto, 'Current user profile retrieved successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'User not found')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    return this.responseFormatter.formatSuccess(
      user,
      'Current user profile retrieved successfully',
      req,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiSuccessResponse(UserResponseDto, 'User retrieved successfully')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'User not found')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(id);
    return this.responseFormatter.formatSuccess(
      user,
      'User retrieved successfully',
      req,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiSuccessResponse(UserResponseDto, 'User successfully updated')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'User not found')
  @ApiErrorResponse(409, 'Email already taken')
  @ApiErrorResponse(400, 'Validation failed')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return this.responseFormatter.formatSuccess(
      user,
      'User successfully updated',
      req,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiSuccessResponse(UserResponseDto, 'User successfully deleted')
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'User not found')
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.delete(id);
    return this.responseFormatter.formatSuccess(
      user,
      'User successfully deleted',
      req,
    );
  }
} 