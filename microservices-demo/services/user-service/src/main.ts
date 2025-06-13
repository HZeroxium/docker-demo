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
      origin: ['http://localhost:3000', 'http://localhost:8000'],
      credentials: true,
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

    // Create gRPC microservice
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

    // Create RabbitMQ microservice for messaging
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

    // Start all services with proper error handling
    await Promise.all([
      grpcApp
        .listen()
        .catch((error) => logger.error('gRPC service failed to start:', error)),
      rabbitmqApp
        .listen()
        .catch((error) =>
          logger.error('RabbitMQ service failed to start:', error),
        ),
      app
        .listen(3001)
        .catch((error) => logger.error('HTTP service failed to start:', error)),
    ]);

    logger.log('🚀 User Service started successfully!');
    logger.log('📡 HTTP Server: http://localhost:3001');
    logger.log('🔗 GraphQL Playground: http://localhost:3001/graphql');
    logger.log('⚡ gRPC Server: localhost:50051');
    logger.log('🐰 RabbitMQ Queue: user_queue');
  } catch (error) {
    logger.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
