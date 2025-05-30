import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  stripe_payment_id: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  plan_type: string;

  @Prop({ required: true })
  whatsapp_number: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
