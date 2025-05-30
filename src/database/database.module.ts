// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService],
  // exports: [DatabaseService], // Export if you want to use it elsewhere
})
export class DatabaseModule {}
