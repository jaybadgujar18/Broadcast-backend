import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    AuthModule,
    OtpModule,
    ConfigModule.forRoot({ isGlobal: true }), // Load .env file globally
    MongooseModule.forRoot(process.env.MONGODB_URI as string, {
      dbName: 'broadcast',
    }), // Connect to MongoDB Atlas
    DatabaseModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
