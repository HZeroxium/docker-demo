// users/users.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitModule } from '@/messaging/rabbit.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { UsersGrpcController } from './users.grpc';
import { User, UserSchema } from './models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: 'users',
      },
    ]),
    RabbitModule,
  ],
  controllers: [UsersController, UsersGrpcController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
