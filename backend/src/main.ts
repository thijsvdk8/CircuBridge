import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
  .setTitle('Materials API')
  .setDescription('API used for material data')
  .setVersion('0.0.1')
  .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('/', app, document)

  await app.listen(4000);
}
bootstrap();
