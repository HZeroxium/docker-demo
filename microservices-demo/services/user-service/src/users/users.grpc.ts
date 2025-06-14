// users/users.grpc.ts

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UserRole } from './models/user.interface';

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
}

interface GetUserRequest {
  id: string;
}

interface GetUsersRequest {
  page: number;
  limit: number;
  search: string;
}

interface UpdateUserRequest {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface DeleteUserRequest {
  id: string;
}

interface ValidateUserRequest {
  email: string;
  password: string;
}

@Controller()
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: CreateUserRequest) {
    try {
      const user = await this.usersService.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: (data.role as UserRole) || UserRole.USER,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt.getTime(),
          updatedAt: user.updatedAt.getTime(),
        },
        message: 'User created successfully',
        success: true,
      };
    } catch (error) {
      return {
        user: null,
        message: error.message,
        success: false,
      };
    }
  }

  @GrpcMethod('UserService', 'GetUser')
  async getUser(data: GetUserRequest) {
    try {
      const user = await this.usersService.findUserById(data.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt.getTime(),
          updatedAt: user.updatedAt.getTime(),
        },
        message: 'User retrieved successfully',
        success: true,
      };
    } catch (error) {
      return {
        user: null,
        message: error.message,
        success: false,
      };
    }
  }

  @GrpcMethod('UserService', 'GetUsers')
  async getUsers(data: GetUsersRequest) {
    try {
      const result = await this.usersService.findUsers({
        page: data.page || 1,
        limit: data.limit || 10,
        search: data.search,
      });

      return {
        users: result.users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt.getTime(),
          updatedAt: user.updatedAt.getTime(),
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      return {
        users: [],
        total: 0,
        page: 0,
        limit: 0,
      };
    }
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: UpdateUserRequest) {
    try {
      const user = await this.usersService.updateUser(data.id, {
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        isActive: data.isActive,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt.getTime(),
          updatedAt: user.updatedAt.getTime(),
        },
        message: 'User updated successfully',
        success: true,
      };
    } catch (error) {
      return {
        user: null,
        message: error.message,
        success: false,
      };
    }
  }

  @GrpcMethod('UserService', 'DeleteUser')
  async deleteUser(data: DeleteUserRequest) {
    try {
      await this.usersService.deleteUser(data.id);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @GrpcMethod('UserService', 'ValidateUser')
  async validateUser(data: ValidateUserRequest) {
    try {
      const result = await this.usersService.validateUser({
        email: data.email,
        password: data.password,
      });

      return {
        isValid: result.isValid,
        user: result.user
          ? {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              role: result.user.role,
              isActive: result.user.isActive,
              createdAt: result.user.createdAt.getTime(),
              updatedAt: result.user.updatedAt.getTime(),
            }
          : null,
        message: result.isValid
          ? 'User validation successful'
          : 'Invalid credentials',
      };
    } catch (error) {
      return {
        isValid: false,
        user: null,
        message: error.message,
      };
    }
  }
}
