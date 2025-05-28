import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface'; // We'll define this next
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>
    ) { }

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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new this.userModel({
            email,
            whatsappNumber,
            userName,
            password: hashedPassword,
        });

        await newUser.save();
        return { message: 'User registered successfully' };
    }

    async signin(email: string, password: string) {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        

        console.log(process.env.JWT_SECRET)
        const payload = { _id: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        return { token, userType: "admin" };
    }
}