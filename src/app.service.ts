import { Injectable, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    this.connection.on('connected', () => {
      console.log('✅ Connected to MongoDB Atlas (via MongooseModule)');
    });

    this.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    // Optional: list collections
    const collections = await this.connection?.db?.listCollections().toArray();
    console.log(
      '📦 Collections:',
      collections?.map((c) => c.name),
    );
  }
}
