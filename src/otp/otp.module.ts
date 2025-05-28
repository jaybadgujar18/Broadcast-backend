import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { OtpSchema } from './otp.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Otp', schema: OtpSchema }])],
  controllers: [OtpController],
  providers: [OtpService]
})
export class OtpModule {}
