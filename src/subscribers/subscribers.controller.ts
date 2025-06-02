import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addSubscriber(@Body() body: { email: string; whatsappNumber: string }) {
    await this.subscribersService.addSubscriber(
      body.email,
      body.whatsappNumber,
    );
    return { message: 'Subscriber added and WhatsApp message sent' };
  }
}
