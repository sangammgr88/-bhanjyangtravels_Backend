import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument, ContactStatus } from './schemas/contact.schema';

@Injectable()
export class ContactsService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<ContactDocument>) {}

  private mapContactOutput(contact: any) {
    if (!contact) return null;
    return {
      ...contact,
      id: contact._id?.toString(),
      _id: undefined,
    };
  }

  async findAll() {
    const contacts = await this.contactModel.find().sort({ createdAt: -1 }).lean().exec();
    return contacts.map(c => this.mapContactOutput(c));
  }

  async findOne(id: string) {
    const contact = await this.contactModel.findById(id).lean().exec();
    if (!contact) throw new NotFoundException('Contact not found');
    return this.mapContactOutput(contact);
  }

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    const newContact = new this.contactModel(data);
    const saved = await newContact.save();
    return this.mapContactOutput(saved.toObject());
  }

  async updateStatus(id: string, status: string) {
    const contact = await this.contactModel.findByIdAndUpdate(id, { status }, { new: true }).lean().exec();
    if (!contact) throw new NotFoundException('Contact not found');
    return this.mapContactOutput(contact);
  }

  async delete(id: string) {
    const contact = await this.contactModel.findByIdAndDelete(id).lean().exec();
    if (!contact) throw new NotFoundException('Contact not found');
    return this.mapContactOutput(contact);
  }

  async findUnread() {
    const contacts = await this.contactModel.find({ status: ContactStatus.UNREAD }).sort({ createdAt: -1 }).lean().exec();
    return contacts.map(c => this.mapContactOutput(c));
  }
}