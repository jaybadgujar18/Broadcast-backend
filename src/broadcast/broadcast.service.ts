import { Injectable } from '@nestjs/common';
import { SubscribersService } from '../subscribers/subscribers.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { put, del } from '@vercel/blob';
import { Express } from 'express';

@Injectable()
export class BroadcastService {
  constructor(
    private readonly subscribersService: SubscribersService,
    private readonly httpService: HttpService,
  ) {}

  async broadcastMessage(
    message: string,
    file?: Express.Multer.File,
  ): Promise<{ success: boolean; message: string }> {
    let telegramSuccess = false;
    let whatsappSuccess = false;
    let errorMessage = '';
    let blobUrl: string | null = null;
    let whatsappDeliveredCount = 0;

    const subscribers = await this.subscribersService.getSubscribers();

    if (file) {
      try {
        const blob = await put(file.filename, fs.createReadStream(file.path), {
          access: 'public',
          token: process.env.VERCEL_BLOB_TOKEN,
        });
        blobUrl = blob.url;
        await firstValueFrom(this.httpService.head(blobUrl));
      } catch (error) {
        errorMessage += `Vercel Blob upload/verification error: ${error.message}; `;
        blobUrl = null;
      }
    }

    // Telegram Broadcast
    const telegramSubscribers = subscribers.filter((s) => s.telegramId);
    if (telegramSubscribers.length > 0) {
      for (const subscriber of telegramSubscribers) {
        try {
          if (file && blobUrl) {
            const fileType = file.mimetype;
            let method = 'sendDocument';
            if (fileType.startsWith('image/')) method = 'sendPhoto';
            else if (fileType.startsWith('video/')) method = 'sendVideo';

            await firstValueFrom(
              this.httpService.post(
                `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`,
                {
                  chat_id: subscriber.telegramId,
                  [method === 'sendPhoto'
                    ? 'photo'
                    : method === 'sendVideo'
                      ? 'video'
                      : 'document']: blobUrl,
                  caption: message || undefined,
                },
              ),
            );
          } else if (message) {
            await firstValueFrom(
              this.httpService.post(
                `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
                {
                  chat_id: subscriber.telegramId,
                  text: message,
                },
              ),
            );
          }
        } catch (error) {
          errorMessage += `Telegram error for ${subscriber.telegramId}: ${error.message}; `;
          continue;
        }
      }
      telegramSuccess = true;
    }

    // WhatsApp Broadcast
    for (const subscriber of subscribers) {
      let retries = 1;
      let success = false;
      const phoneNumber = subscriber.whatsappNumber.startsWith('+')
        ? subscriber.whatsappNumber.replace(/[^+\d]/g, '')
        : `+${subscriber.whatsappNumber.replace(/\D/g, '')}`;

      while (retries >= 0 && !success) {
        try {
          const formData = new FormData();
          formData.append('phonenumber', phoneNumber);
          formData.append('text', message || 'Attachment');
          if (file && blobUrl) {
            formData.append('url', blobUrl);
          }

          const response = await firstValueFrom(
            this.httpService.post(
              'https://api.360messenger.com/v2/sendMessage',
              formData,
              {
                headers: {
                  Authorization: `Bearer ${process.env.WHATSAPP_API}`,
                  ...formData.getHeaders(),
                },
                timeout: 10000,
              },
            ),
          );

          if (response.data.success === true && response.data.data?.id) {
            whatsappDeliveredCount++;
            success = true;
          } else {
            errorMessage += `WhatsApp delivery failed for ${phoneNumber}: ${JSON.stringify(response.data)}; `;
          }
        } catch (error) {
          errorMessage += `WhatsApp error for ${phoneNumber}: ${error.message}; `;
          retries--;
          if (retries >= 0) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }
    }
    whatsappSuccess = whatsappDeliveredCount > 0;

    if (file && blobUrl) {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Error deleting file ${file.path}:`, err);
      });
      await del(blobUrl, { token: process.env.VERCEL_BLOB_TOKEN });
    }

    if (telegramSuccess || whatsappSuccess) {
      const platforms: string[] = [];
      if (telegramSuccess) platforms.push('Telegram');
      if (whatsappSuccess) platforms.push('WhatsApp');
      return {
        success: true,
        message: `Broadcast successful to ${platforms.join(' and ')} (${whatsappDeliveredCount}/${subscribers.length} WhatsApp deliveries)`,
      };
    }
    throw new Error(`Broadcast failed: ${errorMessage}`);
  }
}
