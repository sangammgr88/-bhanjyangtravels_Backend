import { ApiProperty } from '@nestjs/swagger';

export class BlogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty({ required: false, type: [String] })
  images?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
