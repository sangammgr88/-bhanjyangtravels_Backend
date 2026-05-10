import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsBoolean, 
  IsEnum, 
  ValidateNested,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Difficulty } from '@prisma/client';
import { Type } from 'class-transformer';

export class ItineraryItemDto {
  @ApiProperty({ description: 'Day number or identifier' })
  @IsNotEmpty({ message: 'Day is required' })
  @IsString({ message: 'Day must be a string' })
  @MaxLength(10, { message: 'Day cannot exceed 10 characters' })
  day: string;

  @ApiProperty({ description: 'Title for the day' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @ApiProperty({ description: 'Description of activities for the day' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description cannot be empty' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description: string;
}

export class CreateTrekDto {
  @ApiProperty({ description: 'Trek title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @ApiProperty({ description: 'URL-friendly slug for the trek' })
  @IsNotEmpty({ message: 'Slug is required' })
  @IsString({ message: 'Slug must be a string' })
  @MinLength(1, { message: 'Slug cannot be empty' })
  @MaxLength(200, { message: 'Slug cannot exceed 200 characters' })
  slug: string;

  @ApiProperty({ isArray: true, required: false, example: [{ day: '1', description: 'Day 1 description', title: 'Day 1 title' }] })
  @IsOptional()
  @IsArray({ message: 'Itinerary must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ItineraryItemDto)
  itinerary?: ItineraryItemDto[];

  @ApiProperty({ required: false, description: 'Trek description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  description?: string;
  
  @ApiProperty({ required: false, description: 'Trek overview' })
  @IsOptional()
  @IsString({ message: 'Overview must be a string' })
  @MaxLength(2000, { message: 'Overview cannot exceed 2000 characters' })
  overview?: string;

  @ApiProperty({ description: 'Trek duration in days' })
  @IsNotEmpty({ message: 'Duration is required' })
  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(1, { message: 'Duration must be at least 1 day' })
  @Max(365, { message: 'Duration cannot exceed 365 days' })
  duration: number;

  @ApiProperty({ enum: Difficulty, required: false, description: 'Trek difficulty level' })
  @IsOptional()
  @IsEnum(Difficulty, { message: 'Difficulty must be a valid difficulty level' })
  difficulty?: Difficulty;

  @ApiProperty({ required: false, description: 'Maximum altitude in meters' })
  @IsOptional()
  @IsNumber({}, { message: 'Max altitude must be a number' })
  @Min(0, { message: 'Max altitude cannot be negative' })
  @Max(10000, { message: 'Max altitude cannot exceed 10000 meters' })
  maxAltitude?: number;

  @ApiProperty({ required: false, description: 'Group size information' })
  @IsOptional()
  @IsString({ message: 'Group size must be a string' })
  @MaxLength(50, { message: 'Group size cannot exceed 50 characters' })
  groupSize?: string;

  @ApiProperty({ isArray: true, required: false, description: 'Trek highlights' })
  @IsOptional()
  @IsArray({ message: 'Highlights must be an array' })
  @IsString({ each: true, message: 'Each highlight must be a string' })
  highlights?: string[];

  @ApiProperty({ required: false, description: 'Trek location' })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(100, { message: 'Location cannot exceed 100 characters' })
  location?: string;

  @ApiProperty({ required: false, description: 'Trek region' })
  @IsOptional()
  @IsString({ message: 'Region must be a string' })
  @MaxLength(100, { message: 'Region cannot exceed 100 characters' })
  region?: string;

  @ApiProperty({ isArray: true, required: false, description: 'What is included in the trek' })
  @IsOptional()
  @IsArray({ message: 'Includes must be an array' })
  @IsString({ each: true, message: 'Each include item must be a string' })
  includes?: string[];

  @ApiProperty({ isArray: true, required: false, description: 'What is excluded from the trek' })
  @IsOptional()
  @IsArray({ message: 'Excludes must be an array' })
  @IsString({ each: true, message: 'Each exclude item must be a string' })
  excludes?: string[];

  @ApiProperty({ required: false, description: 'Display order for sorting' })
  @IsOptional()
  @IsNumber({}, { message: 'Display order must be a number' })
  @Min(1, { message: 'Display order must be at least 1' })
  displayOrder?: number;

  @ApiProperty({ required: false, description: 'SEO meta title' })
  @IsOptional()
  @IsString({ message: 'Meta title must be a string' })
  @MaxLength(60, { message: 'Meta title cannot exceed 60 characters' })
  metaTitle?: string;

  @ApiProperty({ required: false, description: 'SEO meta description' })
  @IsOptional()
  @IsString({ message: 'Meta description must be a string' })
  @MaxLength(160, { message: 'Meta description cannot exceed 160 characters' })
  metaDescription?: string;

  @ApiProperty({ required: false, description: 'SEO keywords' })
  @IsOptional()
  @IsString({ message: 'Keywords must be a string' })
  @MaxLength(200, { message: 'Keywords cannot exceed 200 characters' })
  keywords?: string;

  @ApiProperty({ required: false, description: 'Thumbnail image URL' })
  @IsOptional()
  @IsString({ message: 'Thumbnail must be a string' })
  @MaxLength(500, { message: 'Thumbnail URL cannot exceed 500 characters' })
  thumbnail?: string;

  @ApiProperty({ isArray: true, required: false, description: 'Trek image URLs' })
  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  images?: string[];

  @ApiProperty({ required: false, description: 'Whether the trek is active' })
  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'Whether the trek is featured' })
  @IsOptional()
  @IsBoolean({ message: 'IsFeatured must be a boolean' })
  isFeatured?: boolean;
} 