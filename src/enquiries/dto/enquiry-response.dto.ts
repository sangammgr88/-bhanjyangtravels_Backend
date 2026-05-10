import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';

export class EnquiryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ required: false })
  nationality?: string;

  @ApiProperty({ required: false })
  age?: number;

  @ApiProperty()
  preferredTrek: string;

  @ApiProperty({ enum: Difficulty })
  preferredDifficulty: Difficulty;

  @ApiProperty()
  preferredDuration: string;

  @ApiProperty()
  groupSize: string;

  @ApiProperty()
  budgetRange: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  preferredArrivalDate?: Date;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  preferredDepartureDate?: Date;

  @ApiProperty({ isArray: true, required: false })
  additionalServices?: string[];

  @ApiProperty()
  trekkingExperience: string;

  @ApiProperty({ required: false })
  specialRequirements?: string;

  @ApiProperty({ required: false })
  heardFrom?: string;

  @ApiProperty({ required: false })
  trekId?: string;

  @ApiProperty({ required: false, type: () => Object })
  trek?: any;
} 