import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Difficulty } from '@prisma/client';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

@Injectable()
export class EnquiriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.enquiry.findMany({
        include: {
          trek: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      throw new BadRequestException('Failed to fetch enquiries');
    }
  }

  async findOne(id: string) {
    try {
      // Validate ObjectId format
      if (!this.isValidObjectId(id)) {
        throw new BadRequestException('Invalid enquiry ID format');
      }

      const enquiry = await this.prisma.enquiry.findUnique({
        where: { id },
        include: {
          trek: true,
        },
      });

      if (!enquiry) {
        throw new NotFoundException('Enquiry not found');
      }

      return enquiry;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching enquiry:', error);
      throw new BadRequestException('Failed to fetch enquiry');
    }
  }

  async create(data: CreateEnquiryDto) {
    try {
      const { trekId, preferredDifficulty, ...enquiryData } = data;

      // Validate trekId if provided
      if (trekId && !this.isValidObjectId(trekId)) {
        throw new BadRequestException('Invalid trek ID format');
      }

      // Check if trek exists if trekId is provided
      if (trekId) {
        const trek = await this.prisma.trek.findUnique({
          where: { id: trekId },
        });
        if (!trek) {
          throw new NotFoundException('Trek not found');
        }
      }

      return await this.prisma.enquiry.create({
        data: {
          ...enquiryData,
          ...(preferredDifficulty && { preferredDifficulty: preferredDifficulty as any }),
          ...(trekId && { trek: { connect: { id: trekId } } }),
        },
        include: {
          trek: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating enquiry:', error);
      throw new BadRequestException('Failed to create enquiry');
    }
  }

  async updateStatus(id: string, status: string) {
    throw new BadRequestException('Status update not supported for Enquiry model');
  }

  async delete(id: string) {
    try {
      // Validate ObjectId format
      if (!this.isValidObjectId(id)) {
        throw new BadRequestException('Invalid enquiry ID format');
      }

      const enquiry = await this.prisma.enquiry.findUnique({
        where: { id },
      });

      if (!enquiry) {
        throw new NotFoundException('Enquiry not found');
      }

      return await this.prisma.enquiry.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting enquiry:', error);
      throw new BadRequestException('Failed to delete enquiry');
    }
  }

  async findByTrek(trekId: string) {
    try {
      // Validate ObjectId format
      if (!this.isValidObjectId(trekId)) {
        throw new BadRequestException('Invalid trek ID format');
      }

      return await this.prisma.enquiry.findMany({
        where: { trekId },
        include: {
          trek: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching enquiries by trek:', error);
      throw new BadRequestException('Failed to fetch enquiries for trek');
    }
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}
