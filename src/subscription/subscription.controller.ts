// subscription/subscription.controller.ts - COMPLETE REPLACEMENT
import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Request } from 'express';

interface StripeWebhookRequest extends Request {
  body: Buffer;
  rawBody?: Buffer;
}

@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body()
    body: {
      email: string;
      whatsappNumber: string;
      plan_type: string;
      amount: number;
    },
  ) {
    return this.subscriptionService.createCheckoutSession(
      body.email,
      body.whatsappNumber,
      body.plan_type,
      body.amount,
    );
  }

  @Post('stripe-webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() request: StripeWebhookRequest,
    @Headers('stripe-signature') signature: string,
  ) {
    // Get the raw body - it should be in request.body due to our middleware setup
    const rawBody = request.body || request.rawBody;

    if (!rawBody) {
      throw new BadRequestException('Missing raw body in webhook request');
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const result = await this.subscriptionService.handleWebhook(
        rawBody,
        signature,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }
}
