import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonListController } from './pokemon-list.controller';
import { PokemonListService } from './pokemon-list.service';
import { PokemonList, PokemonListSchema } from './schemas/pokemon-list.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PokemonList.name,
        schema: PokemonListSchema,
      },
    ]),
  ],
  controllers: [PokemonListController],
  providers: [PokemonListService],
})
export class PokemonListModule {}
