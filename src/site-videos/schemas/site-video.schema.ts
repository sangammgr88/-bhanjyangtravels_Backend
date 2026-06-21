import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SiteVideoDocument = SiteVideo & Document;

@Schema({
  collection: 'SiteVideo',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: { virtuals: true },
})
export class SiteVideo {
  @Prop({ required: true, unique: true })
  section: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ required: true })
  publicId: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SiteVideoSchema = SchemaFactory.createForClass(SiteVideo);
