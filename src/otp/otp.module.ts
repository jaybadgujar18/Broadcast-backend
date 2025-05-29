import { forwardRef, Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { OtpSchema } from './otp.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Otp', schema: OtpSchema }]),
    forwardRef(() => AuthModule), // ✅ use forwardRef here
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [MongooseModule, OtpService], // ✅ export OtpService if used in AuthModule
})
export class OtpModule { }
