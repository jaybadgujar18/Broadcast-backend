import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './otp.interface';

@Injectable()
export class OtpService {

    constructor(@InjectModel('Otp') private readonly otpModel: Model<Otp>) { }

    async sendotp(email: string) {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTP for this email
        await this.otpModel.deleteMany({ email });

        // Create and save the new OTP
        await this.otpModel.create({ email, otp: generatedOtp });

        return { message: 'OTP sent successfully' }; // In production, don't return the OTP
    }
}
