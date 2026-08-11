import { config } from 'dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

// Load root .env (repo root relative to dist/main.js) and any cwd .env so SMTP,
// secrets, etc. work in local dev. Existing process env wins (dotenv never
// overrides already-set variables).
config({ path: path.resolve(__dirname, '../../..', '.env'), quiet: true });
config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

// Global BigInt JSON serialization fallback (prevents "Do not know how to serialize a BigInt" error)
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.endsWith('unclutter.com.ng') ||
        origin.endsWith('pages.dev') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('UnclutterOS Multi-Tenant API')
    .setDescription('B2B Practice Management & White-Label Telehealth API')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3050;
  await app.listen(port);
  console.log(`🚀 UnclutterOS API running on port ${port}`);
}

bootstrap();
