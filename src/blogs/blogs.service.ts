import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  private mapBlogOutput(blog: any) {
    if (!blog) return null;
    return {
      ...blog,
      id: blog._id?.toString(),
      _id: undefined,
    };
  }

  async findAll() {
    const blogs = await this.blogModel.find()
      .select('-description -images') // Optimized for memory
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return blogs.map(b => this.mapBlogOutput(b));
  }

  async findOne(id: string) {
    const blog = await this.blogModel.findById(id).lean().exec();
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return this.mapBlogOutput(blog);
  }

  async findBySlug(slug: string) {
    const blog = await this.blogModel.findOne({ slug }).lean().exec();
    if (!blog) {
      throw new NotFoundException(`Blog with slug ${slug} not found`);
    }
    return this.mapBlogOutput(blog);
  }

  async create(data: CreateBlogDto) {
    const existing = await this.blogModel.findOne({ slug: data.slug }).exec();
    if (existing) {
      throw new ConflictException(`Blog with slug ${data.slug} already exists`);
    }

    const newBlog = new this.blogModel({
      title: data.title,
      slug: data.slug,
      description: data.description,
      photo: data.photo,
      images: data.images || [],
    });
    const saved = await newBlog.save();
    return this.mapBlogOutput(saved.toObject());
  }

  async update(id: string, data: UpdateBlogDto) {
    await this.findOne(id);

    if (data.slug) {
      const existing = await this.blogModel.findOne({ slug: data.slug }).exec();
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException(`Blog with slug ${data.slug} already exists`);
      }
    }

    const updatedBlog = await this.blogModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    return this.mapBlogOutput(updatedBlog);
  }

  async delete(id: string) {
    await this.findOne(id);
    const deletedBlog = await this.blogModel.findByIdAndDelete(id).lean().exec();
    return this.mapBlogOutput(deletedBlog);
  }
}
