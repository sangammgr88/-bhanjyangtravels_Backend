import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrekDocument = Trek & Document;

export enum Difficulty {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  MEDIUM = 'MEDIUM',
  CHALLENGING = 'CHALLENGING',
  DIFFICULT = 'DIFFICULT',
  HARD = 'HARD',
  STRENUOUS = 'STRENUOUS',
}

@Schema({
  toJSON: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: { virtuals: true }
})
export class ItineraryItem {
  @Prop()
  day?: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;
}
const ItineraryItemSchema = SchemaFactory.createForClass(ItineraryItem);

@Schema({
  collection: 'Trek',
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
export class Trek {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop()
  overview?: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ enum: Difficulty })
  difficulty?: Difficulty;

  @Prop()
  maxAltitude?: number;

  @Prop()
  groupSize?: string;

  @Prop({ type: [String], default: [] })
  highlights: string[];

  @Prop()
  location?: string;

  @Prop()
  region?: string;

  @Prop({ type: [String], default: [] })
  includes: string[];

  @Prop({ type: [ItineraryItemSchema], default: [] })
  itinerary: ItineraryItem[];

  @Prop({ type: [String], default: [] })
  excludes: string[];

  @Prop({ default: 1 })
  displayOrder?: number;

  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop()
  keywords?: string;

  @Prop()
  thumbnail?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;
}

export const TrekSchema = SchemaFactory.createForClass(Trek);
