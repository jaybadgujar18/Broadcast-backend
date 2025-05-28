import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', // or '*' for any origin (less secure)
    credentials: true,
  });

  // await mongoose.connect("mongodb+srv://jaybadgujar:jaybadgujar@cluster0.ir0nuus.mongodb.net/broadcast");

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
