import { Injectable, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    if (this.connection.readyState === 1) {
      // 1 = connected
      console.log('✅ Already connected to MongoDB Atlas (via MongooseModule)');
    } else {
      this.connection.on('connected', () => {
        console.log('✅ Connected to MongoDB Atlas (via MongooseModule)');
      });
    }

    this.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
  }
}
