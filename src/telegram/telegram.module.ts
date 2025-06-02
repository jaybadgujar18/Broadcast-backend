import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SubscribersModule, HttpModule],
  controllers: [TelegramController],
})
export class TelegramModule {}
