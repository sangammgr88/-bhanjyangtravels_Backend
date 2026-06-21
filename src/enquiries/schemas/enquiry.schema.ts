import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trek, Difficulty } from '../../treks/schemas/trek.schema';

export type EnquiryDocument = Enquiry & Document;

@Schema({
  collection: 'Enquiry',
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
export class Enquiry {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  nationality?: string;

  @Prop()
  age?: number;

  @Prop()
  preferredTrek?: string;

  @Prop({ enum: Difficulty })
  preferredDifficulty?: Difficulty;

  @Prop()
  preferredDuration?: string;

  @Prop()
  groupSize?: string;

  @Prop()
  budgetRange?: string;

  @Prop()
  preferredArrivalDate?: Date;

  @Prop()
  preferredDepartureDate?: Date;

  @Prop({ type: [String], default: [] })
  additionalServices: string[];

  @Prop()
  trekkingExperience?: string;

  @Prop()
  specialRequirements?: string;

  @Prop()
  heardFrom?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trek' })
  trekId?: string;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
