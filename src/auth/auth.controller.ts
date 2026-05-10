import { Controller, Post, Body, HttpCode, HttpStatus, Request, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ResponseFormatterService } from '../common/services/response-formatter.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';
import { AuthResponseDto } from '../users/dto/user-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private responseFormatter: ResponseFormatterService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiSuccessResponse(AuthResponseDto, 'User successfully logged in', 200)
  @ApiErrorResponse(401, 'Invalid credentials')
  @ApiErrorResponse(400, 'Validation failed')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response, @Request() req) {
    const result = await this.authService.login(loginDto);

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    
    // Set cookies
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15, // 15 minutes
      secure: isSecure,
    });
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: isSecure,
    });

    // Return user data without tokens
    const { access_token, refresh_token, ...userData } = result;
    return this.responseFormatter.formatSuccess(
      userData,
      'User successfully logged in',
      req,
    );
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: CreateUserDto })
  @ApiSuccessResponse(AuthResponseDto, 'User successfully registered', 201)
  @ApiErrorResponse(409, 'User with this email already exists')
  @ApiErrorResponse(400, 'Validation failed')
  async register(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response, @Request() req) {
    const result = await this.authService.register(createUserDto);

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15,
      secure: isSecure,
    });
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: isSecure,
    });

    const { access_token, refresh_token, ...userData } = result;
    return this.responseFormatter.formatSuccess(
      userData,
      'User successfully registered',
      req,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiSuccessResponse(AuthResponseDto, 'Token refreshed successfully', 200)
  @ApiErrorResponse(401, 'Unauthorized access')
  @ApiErrorResponse(404, 'User not found')
  async refreshToken(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    
    const result = await this.authService.refreshToken(refreshToken);

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15,
      secure: isSecure,
    });
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: isSecure,
    });

    const { access_token, refresh_token, ...userData } = result;
    return this.responseFormatter.formatSuccess(
      userData,
      'Token refreshed successfully',
      req,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiSuccessResponse(Object, 'User logged out successfully', 200)
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return this.responseFormatter.formatSuccess(
      { success: true },
      'User logged out successfully',
      req,
    );
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate current token' })
  @ApiSuccessResponse(Object, 'Token is valid', 200)
  @ApiErrorResponse(401, 'Invalid token')
  async validateToken(@Request() req) {
    // The JWT guard has already validated the token and extracted user info
    // We just need to get the full user details from the database
    const user = await this.authService.getUserById(req.user.userId);
    return this.responseFormatter.formatSuccess(
      user,
      'Token is valid',
      req,
    );
  }
}