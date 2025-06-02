import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { raw, json } from 'express';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  const uploadDir = join(__dirname, '..', 'Uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Log incoming requests
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    );
    next();
  });

  app.use('/subscriptions/stripe-webhook', (req, res, next) => {
    raw({ type: 'application/json' })(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  });

  app.use((req, res, next) => {
    if (req.originalUrl?.includes('/subscriptions/stripe-webhook')) {
      next();
    } else {
      json({ limit: '50mb' })(req, res, next);
    }
  });

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
