import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength, IsArray } from 'class-validator';

export class UpdateBlogDto {
  @ApiProperty({ required: false, description: 'Blog title' })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title?: string;

  @ApiProperty({ required: false, description: 'URL-friendly slug for the blog' })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @MinLength(1, { message: 'Slug cannot be empty' })
  @MaxLength(200, { message: 'Slug cannot exceed 200 characters' })
  slug?: string;

  @ApiProperty({ required: false, description: 'Blog content or description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description?: string;

  @ApiProperty({ required: false, description: 'Cover photo image URL' })
  @IsOptional()
  @IsString({ message: 'Photo URL must be a string' })
  @MaxLength(500, { message: 'Photo URL cannot exceed 500 characters' })
  photo?: string;

  @ApiProperty({ required: false, description: 'Array of additional image URLs', type: [String] })
  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image must be a string URL' })
  images?: string[];
}
