import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ description: 'Blog title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @ApiProperty({ description: 'URL-friendly slug for the blog' })
  @IsNotEmpty({ message: 'Slug is required' })
  @IsString({ message: 'Slug must be a string' })
  @MinLength(1, { message: 'Slug cannot be empty' })
  @MaxLength(200, { message: 'Slug cannot exceed 200 characters' })
  slug: string;

  @ApiProperty({ description: 'Blog content or description' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @ApiProperty({ required: false, description: 'Cover photo image URL' })
  @IsOptional()
  @IsString({ message: 'Photo URL must be a string' })
  @MaxLength(500, { message: 'Photo URL cannot exceed 500 characters' })
  photo?: string;
}
