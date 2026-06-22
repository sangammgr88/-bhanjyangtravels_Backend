import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trek, TrekDocument } from './schemas/trek.schema';
import { CreateTrekDto } from './dto/create-trek.dto';
import { UpdateTrekDto } from './dto/update-trek.dto';

@Injectable()
export class TreksService {
  constructor(@InjectModel(Trek.name) private trekModel: Model<TrekDocument>) {}

  private getListSelectFields() {
    // Optimization for low-memory: exclude large text arrays and rich text fields
    return '-overview -description -itinerary -includes -excludes -highlights';
  }

  private mapTrekOutput(trek: any): Trek | null {
    if (!trek) return null;
    if (trek.itinerary) {
      trek.itinerary = trek.itinerary.map((item: any) => ({
        ...item,
        id: item._id?.toString(),
        _id: undefined
      }));
    }
    return {
      ...trek,
      id: trek._id?.toString(),
      _id: undefined
    } as unknown as Trek;
  }

  async findAll(): Promise<Trek[]> {
    const treks = await this.trekModel.find()
      .select(this.getListSelectFields())
      .lean()
      .exec();
    const mappedTreks = treks.map(t => this.mapTrekOutput(t)).filter(Boolean) as Trek[];
    return this.sortByDisplayOrder(mappedTreks);
  }

  async findFeatured(): Promise<Trek[]> {
    const treks = await this.trekModel.find({ isActive: true, isFeatured: true })
      .select(this.getListSelectFields())
      .lean()
      .exec();
    return treks.map(t => this.mapTrekOutput(t)).filter(Boolean) as Trek[];
  }

  async findOne(id: string): Promise<Trek | null> {
    const trek = await this.trekModel.findById(id).lean().exec();
    if (!trek) {
      throw new NotFoundException(`Trek with ID ${id} not found`);
    }
    return this.mapTrekOutput(trek);
  }

  async findBySlug(slug: string): Promise<Trek | null> {
    const trek = await this.trekModel.findOne({ slug }).lean().exec();
    return this.mapTrekOutput(trek);
  }

  async create(data: CreateTrekDto): Promise<Trek> {
    const newTrek = new this.trekModel({
      title: data.title,
      slug: data.slug,
      description: data.description,
      overview: data.overview || '',
      duration: data.duration,
      difficulty: data.difficulty,
      maxAltitude: data.maxAltitude,
      groupSize: data.groupSize,
      highlights: data.highlights || [],
      location: data.location,
      region: data.region,
      includes: data.includes || [],
      excludes: data.excludes || [],
      displayOrder: data.displayOrder,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      keywords: data.keywords,
      thumbnail: data.thumbnail,
      images: data.images || [],
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      itinerary: data.itinerary?.map((item) => ({
        day: item.day,
        title: item.title,
        description: item.description,
      })) || [],
    });

    const savedTrek = await newTrek.save();
    return this.mapTrekOutput(savedTrek.toObject()) as Trek;
  }

  async update(id: string, data: Partial<UpdateTrekDto>): Promise<Trek> {
    const updateData: any = { ...data };

    if (data.itinerary) {
      updateData.itinerary = data.itinerary.map((item) => ({
        day: item.day,
        title: item.title,
        description: item.description,
      }));
    }

    const updatedTrek = await this.trekModel.findByIdAndUpdate(id, updateData, { new: true })
      .lean().exec();

    if (!updatedTrek) {
      throw new NotFoundException(`Trek with ID ${id} not found`);
    }

    return this.mapTrekOutput(updatedTrek) as Trek;
  }

  async delete(id: string): Promise<Trek> {
    const deletedTrek = await this.trekModel.findByIdAndDelete(id).lean().exec();
    if (!deletedTrek) {
      throw new NotFoundException(`Trek with ID ${id} not found`);
    }
    return this.mapTrekOutput(deletedTrek) as Trek;
  }

  async search(query: string): Promise<Trek[]> {
    const treks = await this.trekModel.find({
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { region: { $regex: query, $options: 'i' } },
      ],
    })
      .select(this.getListSelectFields())
      .lean()
      .exec();

    const mappedTreks = treks.map(t => this.mapTrekOutput(t)).filter(Boolean) as Trek[];
    return this.sortByDisplayOrder(mappedTreks);
  }

  private sortByDisplayOrder(treks: Trek[]): Trek[] {
    return [...treks].sort((first, second) => {
      const firstOrder = first.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const secondOrder = second.displayOrder ?? Number.MAX_SAFE_INTEGER;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return first.title.localeCompare(second.title);
    });
  }
}
