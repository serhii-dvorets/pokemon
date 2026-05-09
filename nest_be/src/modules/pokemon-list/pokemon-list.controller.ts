import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PokemonListService } from './pokemon-list.service';
import { Public } from '../../common/decorators/auth.decorator';
import { CreatePokemonListDto } from './dto/create-pokemon-list.dto';
import { UpdatePokemonListDto } from './dto/update-pokemon-list.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { readFileSync } from 'fs';

@Controller('pokemon-lists')
export class PokemonListController {
  constructor(private readonly pokemonListService: PokemonListService) {}

  @Get()
  @Public()
  findAll() {
    return this.pokemonListService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.pokemonListService.findOne(id);
  }

  @Delete(':id')
  @Public()
  remove(@Param('id') id: string) {
    return this.pokemonListService.remove(id);
  }

  @Delete(':id/items/:pokemonId')
  @Public()
  removeItem(@Param('id') id: string, @Param('pokemonId') pokemonId: string) {
    return this.pokemonListService.removeItem(id, pokemonId);
  }

  @Patch(':id')
  @Public()
  update(@Param('id') id: string, @Body() payload: UpdatePokemonListDto) {
    return this.pokemonListService.update(id, payload);
  }

  @Post()
  @Public()
  create(@Body() payload: CreatePokemonListDto) {
    return this.pokemonListService.create(payload);
  }

  @Get(':id/export')
  @Public()
  async export(@Param('id') id: string, @Res() response: Response) {
    const exported = await this.pokemonListService.exportById(id);
    const fileName = `${this.slugify(exported.list.name)}.json`;

    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );

    return response.status(200).send(JSON.stringify(exported, null, 2));
  }

  @Post('import')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  async importList(@UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      return this.pokemonListService.importFromPayload(body);
    }

    const rawText = file.buffer
      ? file.buffer.toString('utf-8')
      : file.path
        ? readFileSync(file.path, 'utf-8')
        : '';

    return this.pokemonListService.importFromPayload(JSON.parse(rawText));
  }

  private slugify(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 70) || 'pokemon-list'
    );
  }
}
