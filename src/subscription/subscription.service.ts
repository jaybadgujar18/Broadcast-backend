import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './subscription.schema';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL is required');
    }

    // Use the same API version as your Stripe CLI
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil', // Match your Stripe CLI version
    });
  }

  async createCheckoutSession(
    email: string,
    whatsappNumber: string,
    plan_type: string,
    amount: number,
  ) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan_type} Plan`,
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        customer_email: email,
        metadata: {
          email,
          whatsappNumber,
          plan_type,
        },
      });

      return { id: session.id, url: session.url };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create checkout session: ${error.message}`,
      );
    }
  }

  async handleWebhook(body: Buffer, signature: string) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required');
    }

    try {
      // Construct the event from the raw body
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata) {
          throw new BadRequestException('Missing metadata in checkout session');
        }

        const { email, whatsappNumber, plan_type } = session.metadata as {
          email: string;
          whatsappNumber: string;
          plan_type: string;
        };

        if (!email || !whatsappNumber || !plan_type) {
          throw new BadRequestException(
            'Incomplete metadata in checkout session',
          );
        }

        if (!session.amount_total) {
          throw new BadRequestException(
            'Missing amount_total in checkout session',
          );
        }

        // Create subscription record
        const subscription = new this.subscriptionModel({
          email,
          stripe_payment_id: session.payment_intent as string,
          amount: session.amount_total / 100,
          currency: session.currency || 'usd',
          status: session.payment_status,
          plan_type,
          whatsapp_number: whatsappNumber,
        });

        await subscription.save();
      } else {
        this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }
}
