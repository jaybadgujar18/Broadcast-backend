import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
    constructor(private otpService: OtpService) { }

    @Post('send')
    async send(@Body('email') email: string) {
        return this.otpService.sendotp(email);
    }
}
