import { Schema } from 'mongoose';

export const OtpSchema = new Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // expires after 5 mins
  },
  { timestamps: true },
);
