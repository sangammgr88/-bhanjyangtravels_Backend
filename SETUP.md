# Travel Bhayang Backend Setup

This project now includes popular NestJS packages for authentication, validation, and API documentation.

## Installed Packages

### 1. **Swagger/OpenAPI Documentation**
- `@nestjs/swagger` - API documentation generation
- `swagger-ui-express` - Swagger UI interface

### 2. **JWT Authentication**
- `@nestjs/jwt` - JWT token handling
- `@nestjs/passport` - Authentication strategies
- `passport` - Authentication middleware
- `passport-jwt` - JWT strategy for Passport

### 3. **Password Hashing**
- `bcryptjs` - Secure password hashing

### 4. **Data Validation**
- `class-validator` - DTO validation decorators
- `class-transformer` - Object transformation

## Features Implemented

### 🔐 **Authentication System**
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Protected routes with JWT guards

### 📝 **API Documentation**
- Swagger UI available at `/api`
- Complete API documentation with examples
- Bearer token authentication support

### ✅ **Data Validation**
- Input validation using class-validator
- Custom error messages
- Type-safe DTOs

## Environment Configuration

Create a `.env` file in the root directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration (if using Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/travel_bhayang?schema=public"

# Application Configuration
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Users (Protected Routes)
- `GET /users` - Get all users
- `GET /users/profile` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Usage

1. **Start the application:**
   ```bash
   npm run start:dev
   ```

2. **Access Swagger Documentation:**
   - Open your browser and go to `http://localhost:3000/api`

3. **Authentication Flow:**
   - Register a new user using `/auth/register`
   - Login using `/auth/login` to get a JWT token
   - Use the token in the Authorization header: `Bearer <your-token>`

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
- **JWT Tokens**: Secure token-based authentication with 24-hour expiration
- **Input Validation**: All inputs are validated using class-validator
- **Protected Routes**: Sensitive endpoints are protected with JWT authentication

## DTOs and Validation

The application includes comprehensive DTOs with validation:

- `CreateUserDto` - User creation with email, name, password, and optional role
- `UpdateUserDto` - User updates with optional fields
- `LoginDto` - Login credentials validation

All DTOs include:
- Email validation
- Password strength requirements
- Role enumeration validation
- Swagger documentation decorators 