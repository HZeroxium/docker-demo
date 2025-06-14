// users/users.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersDto,
  ValidateUserDto,
} from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  @Get('health')
  async getHealth() {
    return {
      status: 'healthy',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }

  @Get('stats/overview')
  async getUserStats() {
    const stats = await this.usersService.getUserStats();
    return {
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats,
    };
  }

  @Post('validate')
  async validateUser(@Body() validateUserDto: ValidateUserDto) {
    const result = await this.usersService.validateUser(validateUserDto);
    return {
      success: result.isValid,
      message: result.isValid
        ? 'User validation successful'
        : 'Invalid credentials',
      data: result,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findUserById(id);
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Get()
  async getUsers(@Query() getUsersDto: GetUsersDto) {
    const result = await this.usersService.findUsers(getUsersDto);
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
