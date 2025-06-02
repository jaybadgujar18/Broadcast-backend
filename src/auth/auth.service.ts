import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface';
import { Otp } from '../otp/otp.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Otp') private readonly otpModel: Model<Otp>,
  ) {}

  async signup(userData: {
    email: string;
    whatsappNumber: string;
    userName: string;
    password: string;
  }) {
    const { email, whatsappNumber, userName, password } = userData;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { whatsappNumber }],
    });
    if (existingUser) {
      throw new BadRequestException('Email or WhatsApp number already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      email,
      whatsappNumber,
      userName,
      password: hashedPassword,
    });

    await newUser.save();
    return { message: 'User registered successfully' };
  }

  async signin(email: string, password: string, otp: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const verifyOtp = await this.otpModel.findOne({ email });

    if (!verifyOtp) {
      throw new BadRequestException('OTP is expired or not generated.');
    }

    if (verifyOtp.otp !== otp) {
      throw new BadRequestException('OTP is incorrect');
    }

    await this.otpModel.deleteMany({ email });

    const payload = { _id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    return { token, userType: user.role };
  }

  async getUser(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('email whatsappNumber userName role');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
