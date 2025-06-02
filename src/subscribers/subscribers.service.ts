// src/subscribers/subscribers.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber } from './subscriber.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<Subscriber>,
    private readonly httpService: HttpService,
  ) {}

  async addSubscriber(email: string, whatsappNumber: string): Promise<void> {
    const existingSubscriber = await this.subscriberModel.findOne({ email });
    if (existingSubscriber) {
      throw new BadRequestException('Email already exists');
    }

    const subscriber = new this.subscriberModel({ email, whatsappNumber });
    await subscriber.save();

    // Send WhatsApp message
    const telegramLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}`;
    const message = `Thank you for your payment! Start a DM with our Telegram bot here: ${telegramLink}\nSend "hyy" to the bot, then provide your email (${email}) to link your Telegram account for broadcast messages.`;

    const formData = new FormData();
    formData.append('phonenumber', whatsappNumber.replace(/\D/g, ''));
    formData.append('text', message);

    try {
      await firstValueFrom(
        this.httpService.post(
          'https://api.360messenger.com/v2/sendMessage',
          formData,
          {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_API}`,
              ...formData.getHeaders(),
            },
          },
        ),
      );
    } catch (error) {
      console.error(
        'Error sending WhatsApp message:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to send WhatsApp message');
    }
  }

  async verifyTelegram(email: string, telegramId: string): Promise<void> {
    const subscriber = await this.subscriberModel.findOne({ email });
    if (!subscriber) {
      throw new BadRequestException('Email not found');
    }

    if (subscriber.telegramId && subscriber.telegramId !== telegramId) {
      throw new BadRequestException(
        'Email already linked to another Telegram account',
      );
    }

    subscriber.telegramId = telegramId;
    await subscriber.save();
  }

  async getSubscribers(): Promise<Subscriber[]> {
    return this.subscriberModel.find().exec();
  }
}
