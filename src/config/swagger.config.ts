import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    defaultModelsExpandDepth: -1,
  },
};

export function setupSwagger(app: INestApplication): void {
  if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local') {
    const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
      .setTitle('OHA-USER')
      .setDescription('OHA-USER API Swagger 문서')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          name: 'AccessToken',
          in: 'header',
        },
        'access-token',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          name: 'RefreshToken',
          in: 'header',
        },
        'refresh-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/user/swagger', app, document, swaggerCustomOptions);
  }
}
