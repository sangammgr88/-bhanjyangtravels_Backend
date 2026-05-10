import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { ApiResponseDto, PaginatedResponseDto, PaginationDto, ErrorResponseDto, SuccessResponseDto } from '../dto/api-response.dto';
import { UserResponseDto, AuthResponseDto } from '../../users/dto/user-response.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { LoginDto } from '../../users/dto/login.dto';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Travel Bhayang API')
  .setDescription('The Travel Bhayang API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

export const swaggerOptions: SwaggerDocumentOptions = {
  extraModels: [
    ApiResponseDto,
    PaginatedResponseDto,
    PaginationDto,
    ErrorResponseDto,
    SuccessResponseDto,
    UserResponseDto,
    AuthResponseDto,
    CreateUserDto,
    UpdateUserDto,
    LoginDto,
  ],
}; 