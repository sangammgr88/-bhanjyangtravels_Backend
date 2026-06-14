import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
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
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return this.usersService.validateUser(email, password);
  }

async generateTokens(user: any) {
  try {
    console.log("START TOKEN");

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    console.log("JWT CREATED");

    const refresh_token = uuidv4();

    await this.prisma.refreshToken.create({
      data: {
        token: refresh_token,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7,
        ),
      },
    });

    console.log("REFRESH TOKEN SAVED");

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

    console.log("USER:", user);

    const tokens = await this.generateTokens(user);

    console.log("TOKENS CREATED");

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
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
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({ 
      where: { token: refreshToken },
      include: { user: true }
    });
    
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    // Invalidate old refresh token and issue a new one
    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    const tokens = await this.generateTokens(tokenRecord.user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        name: tokenRecord.user.name,
        role: tokenRecord.user.role,
        createdAt: tokenRecord.user.createdAt,
        updatedAt: tokenRecord.user.updatedAt,
      },
    };
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
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
        id: user.id,
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
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}