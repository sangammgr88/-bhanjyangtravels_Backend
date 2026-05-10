import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  message: string = 'Success',
  status: number = 200,
) => {
  return applyDecorators(
    ApiResponse({
      status,
      description: message,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: message },
          data: { $ref: `#/components/schemas/${model.name}` },
          timestamp: { type: 'string', example: new Date().toISOString() },
          path: { type: 'string', example: '/api/endpoint' },
          method: { type: 'string', example: 'GET' },
        },
        required: ['success', 'message', 'data', 'timestamp', 'path', 'method'],
      },
    }),
  );
};

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  message: string = 'Success',
  status: number = 200,
) => {
  return applyDecorators(
    ApiResponse({
      status,
      description: message,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: message },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${model.name}` },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              total: { type: 'number', example: 100 },
              totalPages: { type: 'number', example: 10 },
              hasNext: { type: 'boolean', example: true },
              hasPrev: { type: 'boolean', example: false },
            },
            required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev'],
          },
          timestamp: { type: 'string', example: new Date().toISOString() },
          path: { type: 'string', example: '/api/endpoint' },
          method: { type: 'string', example: 'GET' },
        },
        required: ['success', 'message', 'data', 'pagination', 'timestamp', 'path', 'method'],
      },
    }),
  );
};

export const ApiErrorResponse = (
  status: number,
  message: string = 'Error occurred',
  error: string = 'Internal server error',
) => {
  return applyDecorators(
    ApiResponse({
      status,
      description: message,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: message },
          error: { type: 'string', example: error },
          timestamp: { type: 'string', example: new Date().toISOString() },
          path: { type: 'string', example: '/api/endpoint' },
          method: { type: 'string', example: 'GET' },
          statusCode: { type: 'number', example: status },
        },
        required: ['success', 'message', 'error', 'timestamp', 'path', 'method', 'statusCode'],
      },
    }),
  );
}; 