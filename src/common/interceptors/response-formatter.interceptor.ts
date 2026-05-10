import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ResponseFormatterService } from '../services/response-formatter.service';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor {
  constructor(private responseFormatter: ResponseFormatterService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If the response is already formatted, return it as is
        if (this.isFormattedResponse(data)) {
          return data;
        }

        // If the response is null or undefined, format as message
        if (data === null || data === undefined) {
          return this.responseFormatter.formatMessage(
            'Operation completed successfully',
            request,
          );
        }

        // If the response is a string, format as message
        if (typeof data === 'string') {
          return this.responseFormatter.formatMessage(data, request);
        }

        // If the response is an array, check if it has pagination metadata
        if (Array.isArray(data) && data.length > 0 && data[0]?.pagination) {
          const pagination = data[0].pagination;
          const items = data.map(item => {
            const { pagination, ...rest } = item;
            return rest;
          });
          return this.responseFormatter.formatPaginated(
            items,
            pagination,
            'Data retrieved successfully',
            request,
          );
        }

        // If the response is an array, format as success with array data
        if (Array.isArray(data)) {
          return this.responseFormatter.formatSuccess(
            data,
            'Data retrieved successfully',
            request,
          );
        }

        // Default: format as success response
        return this.responseFormatter.formatSuccess(
          data,
          'Operation completed successfully',
          request,
        );
      }),
      catchError((error) => {
        // If it's already a formatted error, return it as is
        if (this.isFormattedError(error)) {
          return throwError(() => error);
        }

        // Handle HttpException
        if (error instanceof HttpException) {
          const status = error.getStatus();
          const message = error.message;
          
          const formattedError = this.responseFormatter.formatError(
            message,
            this.getErrorType(status),
            status,
            request,
            error.getResponse(),
          );

          return throwError(() => new HttpException(formattedError, status));
        }

        // Handle validation errors
        if (error.name === 'ValidationError' || error.name === 'ValidatorError') {
          const formattedError = this.responseFormatter.formatValidationError(
            error.errors || [error.message],
            request,
          );
          return throwError(() => new HttpException(formattedError, HttpStatus.BAD_REQUEST));
        }

        // Handle Prisma errors
        if (error.code) {
          switch (error.code) {
            case 'P2002':
              const formattedError = this.responseFormatter.formatConflict(
                'Resource already exists',
                request,
              );
              return throwError(() => new HttpException(formattedError, HttpStatus.CONFLICT));
            case 'P2025':
              const notFoundError = this.responseFormatter.formatNotFound(
                'Resource',
                request,
              );
              return throwError(() => new HttpException(notFoundError, HttpStatus.NOT_FOUND));
            default:
              const internalError = this.responseFormatter.formatInternalError(
                'Database operation failed',
                request,
              );
              return throwError(() => new HttpException(internalError, HttpStatus.INTERNAL_SERVER_ERROR));
          }
        }

        // Default error handling
        const formattedError = this.responseFormatter.formatInternalError(
          error.message || 'Internal server error',
          request,
        );
        return throwError(() => new HttpException(formattedError, HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }

  private isFormattedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'message' in data &&
      'timestamp' in data &&
      'path' in data &&
      'method' in data
    );
  }

  private isFormattedError(error: any): boolean {
    return (
      error &&
      typeof error === 'object' &&
      'success' in error &&
      'message' in error &&
      'error' in error &&
      'timestamp' in error &&
      'path' in error &&
      'method' in error
    );
  }

  private getErrorType(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'ERROR';
    }
  }
} 