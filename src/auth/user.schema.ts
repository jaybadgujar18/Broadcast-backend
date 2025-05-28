import { Schema } from 'mongoose';

export const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        whatsappNumber: { type: String, required: true, unique: true },
        userName: { type: String, required: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);