import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { LoginDto } from '../users/dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return this.usersService.validateUser(email, password);
  }

  async generateTokens(user: any) {
    try {
      const payload = {
        email: user.email,
        sub: user.id || user._id?.toString(),
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });

      const refresh_token = uuidv4();

      await this.refreshTokenModel.create({
        token: refresh_token,
        userId: user.id || user._id?.toString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });

      return { access_token, refresh_token };
    } catch (error) {
      console.error("GENERATE TOKEN ERROR:", error);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.validateUser(
        loginDto.email,
        loginDto.password,
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user.id || user._id?.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      throw error;
    }
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(createUserDto);
    const tokens = await this.generateTokens(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id || user._id?.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const tokenRecord = await this.refreshTokenModel.findOne({ token: refreshToken }).populate('userId').exec();
    
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    await this.refreshTokenModel.deleteOne({ token: refreshToken }).exec();
    
    const user: any = tokenRecord.userId;
    const userObj = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    const tokens = await this.generateTokens(userObj);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: userObj,
    };
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.refreshTokenModel.deleteMany({ token: refreshToken }).exec();
    return { success: true };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id || user._id?.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserById(userId: string): Promise<any> {
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id || user._id?.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}