import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<Partial<User>[]> {
    return this.userModel.find().select('-password').lean().exec() as Promise<Partial<User>[]>;
  }

  async findOne(id: string): Promise<Partial<User> | null> {
    const user = await this.userModel.findById(id).select('-password').lean().exec() as Partial<User>;
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const createdUser = new this.userModel({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
      role: createUserDto.role || 'USER',
    });

    const savedUser = await createdUser.save();
    const userObj = savedUser.toObject();
    delete userObj.password;
    return userObj;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    const existing = await this.userModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== existing.email) {
      const emailTaken = await this.findByEmail(updateUserDto.email);
      if (emailTaken) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const dataToUpdate = { ...updateUserDto };
    if (dataToUpdate.password) {
      const saltRounds = 10;
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, saltRounds);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, dataToUpdate, { new: true })
      .select('-password').lean().exec() as Partial<User>;

    return updatedUser;
  }

  async delete(id: string): Promise<Partial<User>> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).select('-password').lean().exec() as Partial<User>;
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }

  async validateUser(email: string, password: string): Promise<Partial<User> | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    }
    return null;
  }
}