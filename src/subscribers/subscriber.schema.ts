import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Subscriber extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  whatsappNumber: string;

  @Prop()
  telegramId?: string;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
