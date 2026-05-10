import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  @ApiProperty({ example: '/api/endpoint' })
  path: string;

  @ApiProperty({ example: 'GET' })
  method: string;
}

export class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T = any> extends ApiResponseDto<T[]> {
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class ErrorResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ required: false })
  details?: any;
}

export class SuccessResponseDto<T = any> extends ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty()
  data: T;
} 