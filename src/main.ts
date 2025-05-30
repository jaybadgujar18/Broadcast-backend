// main.ts - Enhanced version with full debugging
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { raw, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.use((req, res, next) => {
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

  await app.listen(process.env.PORT ?? 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
