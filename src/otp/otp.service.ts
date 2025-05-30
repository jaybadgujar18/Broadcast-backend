import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './otp.interface';
import { User } from '../auth/user.interface';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel('Otp') private readonly otpModel: Model<Otp>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async sendotp(body: { email: string; method: string }) {
    const { email, method } = body;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return { message: 'User not found' };
    }

    if (method === 'whatsapp' && !user.whatsappNumber) {
      return { message: 'User has no WhatsApp number registered' };
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    if (method == 'whatsapp') {
      try {
        const response = await axios.post(
          'https://api.360messenger.com/v2/sendMessage',
          {
            phonenumber: user.whatsappNumber,
            text: `Your OTP is: *${generatedOtp}*`,
          },
          {
            headers: {
              authorization: 'Bearer ylEvjIOmAHObmTvGtLLjs7rIR8YjmIM7yKy',
            },
          },
        );
      } catch (error) {
        throw new Error('Failed to send OTP via WhatsApp');
      }
    }

    if (method == 'email') {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or your email provider
          auth: {
            user: 'jaybadgujar45@gmail.com', // your email address
            pass: 'yogj yoaq dmnx ouip', // your app password
          },
        });

        await transporter.sendMail({
          from: `"Your App Name" <jaybadgujar45@gmail.com>`,
          to: email,
          subject: 'Your OTP Code',
          html: `<p>Your OTP is: <strong>${generatedOtp}</strong></p>`,
        });
      } catch (error) {
        console.error('Email send error:', error);
        throw new Error('Failed to send OTP via email');
      }
    }

    // Delete existing OTP for the email
    await this.otpModel.deleteMany({ email });

    // Save new OTP
    await this.otpModel.create({ email, otp: generatedOtp });

    return { message: 'OTP sent successfully' }; // In production, don't return the OTP
  }
}
