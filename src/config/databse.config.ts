import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const DATABASE_CONFIG: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mariadb',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PW'),
    database: configService.get('DB_NAME'),
    charset: 'utf8mb4',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    useUTC: false,
  }),
  inject: [ConfigService],
};
