import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/environment.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // available in every module
      load: [configuration],
      validate,
      cache: true,
    }),
  ],
})
export class AppModule {}