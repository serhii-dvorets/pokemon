import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PokemonListItemDto {
  @IsInt()
  @Min(1)
  pokemonId: number;

  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(80)
  speciesName: string;

  @IsInt()
  @Min(1)
  weight: number;

  @IsOptional()
  @IsUrl()
  spriteUrl?: string | null;
}

export class CreatePokemonListDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PokemonListItemDto)
  items: PokemonListItemDto[];
}
