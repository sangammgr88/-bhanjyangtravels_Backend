import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ description: 'Full name of the person contacting' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name cannot be empty' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({ description: 'Email address of the person contacting' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ required: false, description: 'Phone number of the person contacting' })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;

  @ApiProperty({ required: false, description: 'Subject of the contact message' })
  @IsOptional()
  @IsString({ message: 'Subject must be a string' })
  @MaxLength(200, { message: 'Subject cannot exceed 200 characters' })
  subject?: string;

  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters' })
  message: string;
}
