// main.ts

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Create HTTP application
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    // Enable CORS
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://kong:8000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-Forwarded-Host',
      ],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
      }),
    );

    // Start HTTP server first
    await app.listen(3001);
    logger.log('📡 HTTP Server: http://localhost:3001');
    logger.log('🔗 GraphQL Playground: http://localhost:3001/graphql');

    // Create and start gRPC microservice
    try {
      const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
          transport: Transport.GRPC,
          options: {
            package: 'users',
            protoPath: join(__dirname, '../proto/users.proto'),
            url: '0.0.0.0:50051',
            maxReceiveMessageLength: 1024 * 1024 * 4, // 4MB
            maxSendMessageLength: 1024 * 1024 * 4, // 4MB
          },
        },
      );

      await grpcApp.listen();
      logger.log('⚡ gRPC Server: localhost:50051');
    } catch (grpcError) {
      logger.warn('gRPC service failed to start:', grpcError.message);
    }

    // Create and start RabbitMQ microservice
    try {
      const rabbitmqApp =
        await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
          transport: Transport.RMQ,
          options: {
            urls: [
              process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672',
            ],
            queue: 'user_queue',
            queueOptions: {
              durable: true,
            },
            socketOptions: {
              heartbeatIntervalInSeconds: 60,
              reconnectTimeInSeconds: 5,
            },
          },
        });

      await rabbitmqApp.listen();
      logger.log('🐰 RabbitMQ Queue: user_queue');
    } catch (rabbitmqError) {
      logger.warn('RabbitMQ service failed to start:', rabbitmqError.message);
    }

    logger.log('🚀 User Service started successfully!');
  } catch (error) {
    logger.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
