import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  whatsappNumber: string;
  userName: string;
  role: string;
  password: string;
}