import { ApiProperty } from '@nestjs/swagger';
import { ContactStatus } from '../schemas/contact.schema';

export class ContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: ContactStatus })
  status: ContactStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 