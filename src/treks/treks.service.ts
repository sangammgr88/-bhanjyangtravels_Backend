import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Trek } from '@prisma/client';
import { CreateTrekDto } from './dto/create-trek.dto';
import { UpdateTrekDto } from './dto/update-trek.dto';

@Injectable()
export class TreksService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Trek[]> {
    return this.prisma.trek.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findFeatured(): Promise<Trek[]> {
    return this.prisma.trek.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string): Promise<Trek | null> {
    return this.prisma.trek.findFirst({
      where: {
        id,
      },
      include: {
        itinerary: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Trek | null> {
    return this.prisma.trek.findUnique({
      where: { slug },
      include: {
        itinerary: true,
      },
    });
  }

  async create(data: CreateTrekDto): Promise<Trek> {
    return this.prisma.trek.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        overview: data.overview || '',
        duration: data.duration,
        difficulty: data.difficulty as any,
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
        itinerary: {
          create:
            data.itinerary?.map((item) => ({
              day: item.day,
              title: item.title,
              description: item.description,
            })) || [],
        },
      },
      include: {
        itinerary: true,
      },
    });
  }

  async update(id: string, data: Partial<UpdateTrekDto>): Promise<Trek> {
    return this.prisma.trek.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        overview: data.overview,
        duration: data.duration,
        difficulty: data.difficulty as any,
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
        itinerary: {
          deleteMany: {},
          create:
            data.itinerary?.map((item) => ({
              day: item.day,
              title: item.title,
              description: item.description,
            })) || [],
        },
      },
      include: {
        itinerary: true,
      },
    });
  }

  async delete(id: string): Promise<Trek> {
    return this.prisma.trek.delete({
      where: { id },
    });
  }

  async search(query: string): Promise<Trek[]> {
    return this.prisma.trek.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { region: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
