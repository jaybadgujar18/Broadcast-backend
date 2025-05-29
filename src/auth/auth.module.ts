import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => OtpModule), // ✅ use forwardRef here too
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [MongooseModule, AuthService], // ✅ export AuthService if used
})
export class AuthModule { }
