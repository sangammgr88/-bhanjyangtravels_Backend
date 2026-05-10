import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';

export class TrekResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  duration: number;

  @ApiProperty({ enum: Difficulty, required: false })
  difficulty?: Difficulty;

  @ApiProperty({ required: false })
  maxAltitude?: number;

  @ApiProperty({ required: false })
  groupSize?: string;

  @ApiProperty({ isArray: true, required: false })
  highlights?: string[];

  @ApiProperty({ required: false })
  price?: number;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  region?: string;

  @ApiProperty({ isArray: true, required: false })
  includes?: string[];

  @ApiProperty({ isArray: true, required: false })
  excludes?: string[];

  @ApiProperty({ required: false })
  displayOrder?: number;

  @ApiProperty({ required: false })
  metaTitle?: string;

  @ApiProperty({ required: false })
  metaDescription?: string;

  @ApiProperty({ required: false })
  keywords?: string;

  @ApiProperty({ required: false })
  thumbnail?: string;

  @ApiProperty({ isArray: true, required: false })
  images?: string[];

  @ApiProperty({ required: false })
  isActive?: boolean;

  @ApiProperty({ required: false })
  isFeatured?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 