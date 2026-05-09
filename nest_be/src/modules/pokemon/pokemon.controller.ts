import { Controller, Get, Query } from '@nestjs/common';
import { GetPokemonCatalogDto } from './dto/get-pokemon-catalog.dto';
import { Public } from '../../common/decorators/auth.decorator';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @Public()
  getCatalog(@Query() query: GetPokemonCatalogDto) {
    return this.pokemonService.getCatalog(query);
  }
}
