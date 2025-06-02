import { Controller, Post, Body } from '@nestjs/common';
import { SubscribersService } from '../subscribers/subscribers.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
export class TelegramController {
  constructor(
    private readonly subscribersService: SubscribersService,
    private readonly httpService: HttpService,
  ) {}

  @Post('telegram-webhook')
  async handleWebhook(@Body() update: any) {
    if (update.message && update.message.chat.type === 'private') {
      const telegramId = update.message.from.id.toString();
      const message = update.message.text?.trim().toLowerCase();

      if (message === 'hyy') {
        await firstValueFrom(
          this.httpService.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              chat_id: telegramId,
              text: 'Please send the email address you used for your subscription to link your Telegram account.',
            },
          ),
        );
      } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message)) {
        try {
          await this.subscribersService.verifyTelegram(message, telegramId);
          await firstValueFrom(
            this.httpService.post(
              `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
              {
                chat_id: telegramId,
                text: 'Thank you! Your Telegram ID has been linked to your subscription.',
              },
            ),
          );
        } catch (error) {
          await firstValueFrom(
            this.httpService.post(
              `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
              {
                chat_id: telegramId,
                text: error.message || 'Failed to link Telegram account.',
              },
            ),
          );
        }
      }
    }
    return { ok: true };
  }
}
