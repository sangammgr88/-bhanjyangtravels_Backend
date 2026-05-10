import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsMongoId,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class CreateEnquiryDto {
  @ApiProperty({ description: 'First name of the enquirer' })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @ApiProperty({ required: false, description: 'Last name of the enquirer' })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName?: string;

  @ApiProperty({ description: 'Email address of the enquirer' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ required: false, description: 'Phone number of the enquirer' })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;

  @ApiProperty({ required: false, description: 'Nationality of the enquirer' })
  @IsOptional()
  @IsString({ message: 'Nationality must be a string' })
  @MaxLength(50, { message: 'Nationality cannot exceed 50 characters' })
  nationality?: string;

  @ApiProperty({ required: false, description: 'Age of the enquirer' })
  @IsOptional()
  @IsNumber({}, { message: 'Age must be a number' })
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age cannot exceed 120' })
  age?: number;

  @ApiProperty({ required: false, description: 'Preferred trek name' })
  @IsOptional()
  @IsString({ message: 'Preferred trek must be a string' })
  @MaxLength(200, { message: 'Preferred trek cannot exceed 200 characters' })
  preferredTrek?: string;

  @ApiProperty({ enum: Difficulty, required: false, description: 'Preferred difficulty level' })
  @IsOptional()
  @IsEnum(Difficulty, { message: 'Preferred difficulty must be a valid difficulty level' })
  preferredDifficulty?: Difficulty;

  @ApiProperty({ required: false, description: 'Preferred trek duration' })
  @IsOptional()
  @IsString({ message: 'Preferred duration must be a string' })
  @MaxLength(50, { message: 'Preferred duration cannot exceed 50 characters' })
  preferredDuration?: string;

  @ApiProperty({ required: false, description: 'Preferred group size' })
  @IsOptional()
  @IsString({ message: 'Group size must be a string' })
  @MaxLength(20, { message: 'Group size cannot exceed 20 characters' })
  groupSize?: string;

  @ApiProperty({ required: false, description: 'Budget range for the trek' })
  @IsOptional()
  @IsString({ message: 'Budget range must be a string' })
  @MaxLength(100, { message: 'Budget range cannot exceed 100 characters' })
  budgetRange?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time', description: 'Preferred arrival date' })
  @IsOptional()
  @IsDateString({}, { message: 'Preferred arrival date must be a valid date string' })
  preferredArrivalDate?: Date;

  @ApiProperty({ required: false, type: String, format: 'date-time', description: 'Preferred departure date' })
  @IsOptional()
  @IsDateString({}, { message: 'Preferred departure date must be a valid date string' })
  preferredDepartureDate?: Date;

  @ApiProperty({ isArray: true, required: false, description: 'Additional services required' })
  @IsOptional()
  @IsArray({ message: 'Additional services must be an array' })
  @IsString({ each: true, message: 'Each additional service must be a string' })
  additionalServices?: string[];

  @ApiProperty({ required: false, description: 'Previous trekking experience' })
  @IsOptional()
  @IsString({ message: 'Trekking experience must be a string' })
  @MaxLength(500, { message: 'Trekking experience cannot exceed 500 characters' })
  trekkingExperience?: string;

  @ApiProperty({ required: false, description: 'Special requirements or dietary restrictions' })
  @IsOptional()
  @IsString({ message: 'Special requirements must be a string' })
  @MaxLength(1000, { message: 'Special requirements cannot exceed 1000 characters' })
  specialRequirements?: string;

  @ApiProperty({ required: false, description: 'How did you hear about us' })
  @IsOptional()
  @IsString({ message: 'Heard from must be a string' })
  @MaxLength(100, { message: 'Heard from cannot exceed 100 characters' })
  heardFrom?: string;

  @ApiProperty({ required: false, description: 'ID of the related trek' })
  @IsOptional()
  @IsString({ message: 'Trek ID must be a string' })
  @IsMongoId({ message: 'Trek ID must be a valid MongoDB ObjectId' })
  trekId?: string;
}
