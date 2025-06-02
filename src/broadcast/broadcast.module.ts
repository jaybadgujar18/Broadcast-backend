import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SubscribersModule, HttpModule],
  providers: [BroadcastService],
  controllers: [BroadcastController],
})
export class BroadcastModule {}
