import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

export enum ContactStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  REPLIED = 'REPLIED',
  CLOSED = 'CLOSED',
}

@Schema({
  collection: 'Contact',
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
export class Contact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  subject?: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: ContactStatus, default: ContactStatus.UNREAD })
  status: ContactStatus;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
