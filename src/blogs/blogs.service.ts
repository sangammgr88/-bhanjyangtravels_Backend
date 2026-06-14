import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Blog } from '@prisma/client';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Blog[]> {
    return this.prisma.blog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
    });
    if (!blog) {
      throw new NotFoundException(`Blog with slug ${slug} not found`);
    }
    return blog;
  }

  async create(data: CreateBlogDto): Promise<Blog> {
    const existing = await this.prisma.blog.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictException(`Blog with slug ${data.slug} already exists`);
    }

    return this.prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        photo: data.photo,
      },
    });
  }

  async update(id: string, data: UpdateBlogDto): Promise<Blog> {
    await this.findOne(id); // Throws NotFoundException if blog doesn't exist

    if (data.slug) {
      const existing = await this.prisma.blog.findUnique({
        where: { slug: data.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Blog with slug ${data.slug} already exists`);
      }
    }

    return this.prisma.blog.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Blog> {
    await this.findOne(id); // Throws NotFoundException if blog doesn't exist
    return this.prisma.blog.delete({
      where: { id },
    });
  }
}
