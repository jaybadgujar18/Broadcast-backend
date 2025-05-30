import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    whatsappNumber: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    role: { type: String, require: true, default: 'user' },
    password: { type: String, required: true },
  },
  { timestamps: true },
);
