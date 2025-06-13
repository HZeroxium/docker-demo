import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { UsersGrpcController } from './users.grpc';
import { User, UserSchema } from './models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'user_exchange',
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672',
    }),
  ],
  controllers: [UsersController, UsersGrpcController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
