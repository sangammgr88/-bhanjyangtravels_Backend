import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { 
  ApiResponse, 
  SuccessResponse, 
  ErrorResponse, 
  PaginatedResponse 
} from '../interfaces/api-response.interface';

@Injectable()
export class ResponseFormatterService {
  
  /**
   * Format a successful response
   */
  formatSuccess<T>(
    data: T,
    message: string = 'Operation completed successfully',
    request?: Request,
  ): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
    };
  }

  /**
   * Format an error response
   */
  formatError(
    message: string,
    error: string,
    statusCode: number = 500,
    request?: Request,
    details?: any,
  ): ErrorResponse {
    return {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
      statusCode,
      details,
    };
  }

  /**
   * Format a paginated response
   */
  formatPaginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    },
    message: string = 'Data retrieved successfully',
    request?: Request,
  ): PaginatedResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
    };
  }

  /**
   * Format a simple response without data
   */
  formatMessage(
    message: string,
    request?: Request,
  ): ApiResponse {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
    };
  }

  /**
   * Calculate pagination metadata
   */
  calculatePagination(
    page: number,
    limit: number,
    total: number,
  ) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Format validation errors
   */
  formatValidationError(
    errors: any[],
    request?: Request,
  ): ErrorResponse {
    return {
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
      statusCode: 400,
      details: errors,
    };
  }

  /**
   * Format not found error
   */
  formatNotFound(
    resource: string = 'Resource',
    request?: Request,
  ): ErrorResponse {
    return {
      success: false,
      message: `${resource} not found`,
      error: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
      statusCode: 404,
    };
  }

  /**
   * Format unauthorized error
   */
  formatUnauthorized(
    message: string = 'Unauthorized access',
    request?: Request,
  ): ErrorResponse {
    return {
      success: false,
      message,
      error: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
      statusCode: 401,
    };
  }

  /**
   * Format forbidden error
   */
  formatForbidden(
    message: string = 'Access forbidden',
    request?: Request,
  ): ErrorResponse {
    return {
      success: false,
      message,
      error: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
      statusCode: 403,
    };
  }

  /**
   * Format conflict error
   */
  formatConflict(
    message: string = 'Resource conflict',
    request?: Request,
  ): ErrorResponse {
    return {
      success: false,
      message,
      error: 'CONFLICT',
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
      statusCode: 409,
    };
  }

  /**
   * Format internal server error
   */
  formatInternalError(
    message: string = 'Internal server error',
    request?: Request,
  ): ErrorResponse {
    return {
      success: false,
      message,
      error: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      path: request?.url || '/api',
      method: request?.method || 'GET',
      statusCode: 500,
    };
  }
} 