import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enquiry, EnquiryDocument } from './schemas/enquiry.schema';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

@Injectable()
export class EnquiriesService {
  constructor(@InjectModel(Enquiry.name) private enquiryModel: Model<EnquiryDocument>) {}

  private mapEnquiryOutput(enquiry: any) {
    if (!enquiry) return null;
    
    let trekObj = null;
    let trekIdStr = enquiry.trekId;
    
    // If populated
    if (enquiry.trekId && typeof enquiry.trekId === 'object' && enquiry.trekId._id) {
      trekObj = { ...enquiry.trekId, id: enquiry.trekId._id.toString(), _id: undefined };
      trekIdStr = enquiry.trekId._id.toString();
    }
    
    return {
      ...enquiry,
      id: enquiry._id?.toString(),
      _id: undefined,
      trek: trekObj,
      trekId: trekIdStr,
    };
  }

  async findAll() {
    try {
      const enquiries = await this.enquiryModel.find()
        .populate({ path: 'trekId', select: '-overview -description -itinerary -includes -excludes -highlights' })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
        
      return enquiries.map(e => this.mapEnquiryOutput(e));
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      throw new BadRequestException('Failed to fetch enquiries');
    }
  }

  async findOne(id: string) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new BadRequestException('Invalid enquiry ID format');
      }

      const enquiry = await this.enquiryModel.findById(id)
        .populate('trekId')
        .lean()
        .exec();

      if (!enquiry) {
        throw new NotFoundException('Enquiry not found');
      }

      return this.mapEnquiryOutput(enquiry);
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

      if (trekId && !this.isValidObjectId(trekId)) {
        throw new BadRequestException('Invalid trek ID format');
      }

      const newEnquiry = new this.enquiryModel({
        ...enquiryData,
        ...(preferredDifficulty && { preferredDifficulty }),
        ...(trekId && { trekId }),
      });

      const savedEnquiry = await newEnquiry.save();
      const populatedEnquiry = await savedEnquiry.populate('trekId');

      return this.mapEnquiryOutput(populatedEnquiry.toObject());
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
      if (!this.isValidObjectId(id)) {
        throw new BadRequestException('Invalid enquiry ID format');
      }

      const enquiry = await this.enquiryModel.findByIdAndDelete(id).lean().exec();

      if (!enquiry) {
        throw new NotFoundException('Enquiry not found');
      }

      return this.mapEnquiryOutput(enquiry);
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
      if (!this.isValidObjectId(trekId)) {
        throw new BadRequestException('Invalid trek ID format');
      }

      const enquiries = await this.enquiryModel.find({ trekId })
        .populate({ path: 'trekId', select: '-overview -description -itinerary -includes -excludes -highlights' })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return enquiries.map(e => this.mapEnquiryOutput(e));
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
