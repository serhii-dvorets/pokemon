import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from './config';
import { validateConfig } from './common/validation/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonModule } from './modules/pokemon/pokemon.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
      isGlobal: true,
      load: [AppConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://mongo:27017',
        dbName: configService.get<string>('MONGO_DB_NAME') || 'pokemon',
      }),
    }),
    PokemonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
