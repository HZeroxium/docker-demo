// rabbit.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const exchangeName = config.get('RABBITMQ_EXCHANGE', 'user_exchange');
        const rabbitUrl = config.get(
          'RABBITMQ_URL',
          'amqp://guest:guest@localhost:5672/',
        );

        return {
          exchanges: [{ name: exchangeName, type: 'topic' }],
          uri: rabbitUrl,
          connectionInitOptions: { wait: false },
          enableControllerDiscovery: true,
          channels: { 'channel-1': { default: true, prefetchCount: 15 } },
        };
      },
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitModule {}
