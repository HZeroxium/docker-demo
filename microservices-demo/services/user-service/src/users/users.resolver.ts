// users/users.resolver.ts

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersDto,
  ValidateUserDto,
} from './dto/create-user.dto';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Logger } from '@nestjs/common';

@ObjectType()
class UsersResponse {
  @Field(() => [User])
  users: User[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
class UserStatsResponse {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  inactive: number;

  @Field(() => String)
  byRole: string; // JSON stringified object
}

@ObjectType()
class ValidateUserResponse {
  @Field()
  isValid: boolean;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  message: string;
}

@Resolver(() => User)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly rabbitMQService: AmqpConnection,
  ) {}

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserDto: CreateUserDto,
  ): Promise<User> {
    const user = await this.usersService.createUser(createUserDto);

    // Publish event asynchronously without blocking response
    try {
      await this.rabbitMQService.publish('user_exchange', 'user.created', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`Published user.created event for user ${user.id}`);
    } catch (error) {
      this.logger.error('Failed to publish user.created event:', error);
      // Don't throw error to avoid breaking user creation
    }

    return user;
  }

  @Query(() => User)
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findUserById(id);
  }

  @Query(() => User)
  async userByEmail(@Args('email') email: string): Promise<User> {
    return this.usersService.findUserByEmail(email);
  }

  @Query(() => UsersResponse)
  async users(
    @Args('getUsersInput', { nullable: true }) getUsersDto: GetUsersDto = {},
  ): Promise<UsersResponse> {
    const result = await this.usersService.findUsers(getUsersDto);
    return {
      users: result.users,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.usersService.deleteUser(id);
  }

  @Query(() => ValidateUserResponse)
  async validateUser(
    @Args('validateUserInput') validateUserDto: ValidateUserDto,
  ): Promise<ValidateUserResponse> {
    const result = await this.usersService.validateUser(validateUserDto);
    return {
      isValid: result.isValid,
      user: result.user,
      message: result.isValid
        ? 'User validation successful'
        : 'Invalid credentials',
    };
  }

  @Query(() => UserStatsResponse)
  async userStats(): Promise<UserStatsResponse> {
    const stats = await this.usersService.getUserStats();
    return {
      ...stats,
      byRole: JSON.stringify(stats.byRole),
    };
  }
}
