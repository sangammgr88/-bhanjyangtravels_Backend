# Response Formatter System

This project implements a comprehensive response formatter system that ensures all API responses are consistent and well-structured.

## 🎯 **Overview**

The response formatter system provides:
- **Consistent API responses** across all endpoints
- **Automatic error handling** with standardized error formats
- **Swagger documentation** with proper response schemas
- **Pagination support** for list endpoints
- **Global interceptor** for automatic formatting

## 📋 **Response Format**

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Your actual data here
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users",
  "method": "GET"
}
```

### Error Response
```json
{
  "success": false,
  "message": "User not found",
  "error": "NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/123",
  "method": "GET",
  "statusCode": 404,
  "details": {
    // Additional error details (optional)
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users",
  "method": "GET"
}
```

## 🛠️ **Components**

### 1. **ResponseFormatterService**
Located in `src/common/services/response-formatter.service.ts`

**Key Methods:**
- `formatSuccess()` - Format successful responses
- `formatError()` - Format error responses
- `formatPaginated()` - Format paginated responses
- `formatMessage()` - Format simple message responses
- `calculatePagination()` - Calculate pagination metadata

### 2. **ResponseFormatterInterceptor**
Located in `src/common/interceptors/response-formatter.interceptor.ts`

**Features:**
- Automatically formats all responses
- Handles different data types (objects, arrays, strings)
- Processes errors and exceptions
- Integrates with Prisma error handling

### 3. **Custom Decorators**
Located in `src/common/decorators/api-response.decorator.ts`

**Available Decorators:**
- `@ApiSuccessResponse()` - For successful responses
- `@ApiPaginatedResponse()` - For paginated responses
- `@ApiErrorResponse()` - For error responses

## 📝 **Usage Examples**

### In Controllers

```typescript
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import { ApiSuccessResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private responseFormatter: ResponseFormatterService,
  ) {}

  @Get(':id')
  @ApiSuccessResponse(UserResponseDto, 'User retrieved successfully')
  @ApiErrorResponse(404, 'User not found', 'NOT_FOUND')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(id);
    return this.responseFormatter.formatSuccess(
      user,
      'User retrieved successfully',
      req,
    );
  }

  @Get()
  @ApiPaginatedResponse(UserResponseDto, 'Users retrieved successfully')
  async findAll(@Request() req) {
    const users = await this.usersService.findAll();
    const pagination = this.responseFormatter.calculatePagination(1, 10, users.length);
    
    return this.responseFormatter.formatPaginated(
      users,
      pagination,
      'Users retrieved successfully',
      req,
    );
  }
}
```

### Error Handling

```typescript
// The interceptor automatically handles these errors:
throw new NotFoundException('User not found');
throw new UnauthorizedException('Invalid credentials');
throw new ConflictException('User already exists');

// Custom error formatting:
return this.responseFormatter.formatNotFound('User', req);
return this.responseFormatter.formatUnauthorized('Invalid token', req);
return this.responseFormatter.formatConflict('Email already taken', req);
```

## 🔧 **Configuration**

### Global Setup
The response formatter is automatically applied globally in `main.ts`:

```typescript
// Global response formatter interceptor
const responseFormatter = app.get(ResponseFormatterInterceptor);
app.useGlobalInterceptors(responseFormatter);
```

### Module Setup
The `CommonModule` is marked as `@Global()` and imported in `AppModule`:

```typescript
@Global()
@Module({
  providers: [ResponseFormatterService, ResponseFormatterInterceptor],
  exports: [ResponseFormatterService, ResponseFormatterInterceptor],
})
export class CommonModule {}
```

## 🎨 **Customization**

### Custom Response Messages
```typescript
return this.responseFormatter.formatSuccess(
  data,
  'Custom success message',
  req,
);
```

### Custom Error Types
```typescript
return this.responseFormatter.formatError(
  'Custom error message',
  'CUSTOM_ERROR_TYPE',
  400,
  req,
  { additional: 'details' },
);
```

### Custom Pagination
```typescript
const pagination = {
  page: 1,
  limit: 20,
  total: 150,
  totalPages: 8,
  hasNext: true,
  hasPrev: false,
};

return this.responseFormatter.formatPaginated(
  data,
  pagination,
  'Custom pagination message',
  req,
);
```

## 📊 **Error Types**

The system recognizes these standard error types:

- `BAD_REQUEST` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Access denied
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict
- `VALIDATION_ERROR` (422) - Validation failed
- `INTERNAL_SERVER_ERROR` (500) - Server error

## 🔍 **Prisma Integration**

The interceptor automatically handles Prisma errors:

- `P2002` - Unique constraint violation → 409 Conflict
- `P2025` - Record not found → 404 Not Found
- Other Prisma errors → 500 Internal Server Error

## 🚀 **Benefits**

1. **Consistency** - All responses follow the same structure
2. **Developer Experience** - Clear, predictable API responses
3. **Frontend Integration** - Easy to handle responses in frontend applications
4. **Error Handling** - Standardized error responses
5. **Documentation** - Automatic Swagger documentation
6. **Maintainability** - Centralized response formatting logic

## 📚 **Best Practices**

1. **Always use the formatter** in controllers for custom responses
2. **Use custom decorators** for Swagger documentation
3. **Let the interceptor handle** automatic formatting
4. **Provide meaningful messages** for better user experience
5. **Use appropriate error types** for different scenarios
6. **Include request context** for debugging purposes

## 🔧 **Troubleshooting**

### Common Issues

1. **Response not formatted**
   - Ensure the interceptor is properly registered
   - Check that the CommonModule is imported

2. **Swagger documentation issues**
   - Use the custom decorators instead of standard @ApiResponse
   - Ensure DTOs are properly decorated with @ApiProperty

3. **Error handling not working**
   - Throw proper NestJS exceptions (NotFoundException, etc.)
   - Use the formatter service for custom error responses

### Debugging

Enable debug logging to see how responses are being processed:

```typescript
// In your controller
console.log('Raw response:', data);
const formatted = this.responseFormatter.formatSuccess(data, 'Success', req);
console.log('Formatted response:', formatted);
``` 