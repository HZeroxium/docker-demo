import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './models/user.model';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersDto,
  ValidateUserDto,
} from './dto/create-user.dto';
import { UserRole } from './models/user.interface';
import * as bcrypt from 'bcrypt';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, role } = createUserDto;

    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        email: email.toLowerCase(),
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new this.userModel({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: role || UserRole.USER,
        isActive: true,
      });

      const savedUser = await user.save();
      this.logger.log(`User created successfully: ${savedUser.email}`);

      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel
        .findOne({ email: email.toLowerCase() })
        .exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${error.message}`);
      throw error;
    }
  }

  async findUsers(
    getUsersDto: GetUsersDto,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, role, isActive } = getUsersDto;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return { users, total, page, limit };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, ...updateData } = updateUserDto;

    // Check if email is being updated and if it's already taken
    if (email) {
      const existingUser = await this.userModel.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateData, ...(email && { email }) },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return true;
  }

  async validateUser(
    validateUserDto: ValidateUserDto,
  ): Promise<{ isValid: boolean; user?: User }> {
    const { email, password } = validateUserDto;

    try {
      const user = await this.findUserByEmail(email);

      if (!user.isActive) {
        return { isValid: false };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return { isValid: true, user };
      }

      return { isValid: false };
    } catch (error) {
      return { isValid: false };
    }
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    const [total, active, inactive, roleStats] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ isActive: true }).exec(),
      this.userModel.countDocuments({ isActive: false }).exec(),
      this.userModel
        .aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
        .exec(),
    ]);

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return { total, active, inactive, byRole };
  }

  // GraphQL & gRPC reuse the same service logic

  @RabbitRPC({
    exchange: 'user_exchange',
    routingKey: 'user.created',
    queue: 'user_created_queue',
  })
  async handleUserCreated(msg: Record<string, any>) {
    try {
      this.logger.log('Received user.created event:', JSON.stringify(msg));
      // Process the event here
    } catch (error) {
      this.logger.error('Failed to handle user.created event:', error);
    }
  }
}
